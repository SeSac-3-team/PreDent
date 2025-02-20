// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import {
  fetchVASResponse,
  fetchPresumResponse,
  fetchLLMResponse,
} from "../services/api";
import { useAudioRecording } from "../hooks/useAudioRecording";
import { useSTT } from "../hooks/useSTT";
import "./ChatPage.css";
import PreDiagnosisReport from "../components/PreDiagnosisReport";
import NavigationButtons from "../components/NavigationButtons";

function ChatPage() {
  // 1. 진입 목적에 따른 모드 설정 (치료 vs 단순 채팅)
  const location = useLocation();
  const { patid, purpose } = location.state || {};
  const isSimpleChat = purpose !== "치료";

  // 2. 설문/문진 관련 상태들
  const [questions, setQuestions] = useState([
    "환자분의 통증이 얼마나 심한지 한 문장으로 표현해주세요. \n\n예) 어금니가 시려서 차가운 음식을 먹기 힘들어요.",
    "언제부터 증상이 시작되셨나요? \n\n예) 한 달 정도 된 것 같아요",
    "증상이 나타나는 부위는 어디인가요? \n\n예) 오른쪽 윗 어금니",
    "치아가 흔들리지는 않으시나요? \n\n예) 흔들리지는 않아요",
    "환부를 건드릴 때에만 아프신가요, 가만히 있어도 아프신가요? \n\n예) 건드릴 때에만 아픕니다",
    "잇몸이 부어있지는 않으신가요? \n\n예) 살짝 붓기가 있어요",
  ]);
  const [messages, setMessages] = useState([]);
  const [vas, setVas] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");
  const [isQuestionnaireCompleted, setIsQuestionnaireCompleted] =
    useState(false);

  // 로딩 상태는 이제 메시지 배열에 로딩 타입 메시지로 반영합니다.
  // 기존의 isLoading 상태는 API 호출 중 플래그로 사용합니다.
  const [isLoading, setIsLoading] = useState(false);

  // 첫 렌더 시 초기 메시지 출력 (문진 모드 vs 간단 채팅)
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (isSimpleChat) {
        setIsQuestionnaireCompleted(true);
        setMessages([
          {
            id: Date.now(),
            type: "bot",
            text: `안녕하세요!😊\n자유롭게 채팅을 이용해보세요!\n\n현재 치과 챗봇에서는 다음과 같은 안내가 가능합니다.\n\n1) **치과상담**: 사전문진, 병명, 궁금한 점 등에 대해 설명해 드려요.\n2) **비급여 진료비 안내**: 비급여 항목 및 예상 비용 정보를 알려드려요.\n3) **진료예약**: 진료 예약 가능 일정 및 방법을 안내해 드려요.\n\n원하시는 항목에 대해 언제든 질문해주세요!`,
            avatar: "/images/Doctor_img.png",
          },
        ]);
      } else if (questions.length > 0) {
        // [추가] 사용자가 치료 목적일 때, 안내 메시지 + 첫 질문을 함께 출력
        if (purpose === "치료") {
          // 안내 메시지: 질문 개수, 질문 목적 요약
          setMessages([
            {
              id: Date.now(),
              type: "bot",
              text: `안녕하세요😊\n사전 문진에 대해 간단히 안내해 드리겠습니다.\n\n사전 문진은 총 ${questions.length}개의 질문으로 구성되어 있으며,\n환자분의 증상, 기간, 위치, 통증 유형 등을 미리 파악하기 위한 과정입니다.\n\n잠시 시간을 내어 답변해주시면,\n보다 정확하고 신속한 진료에 큰 도움이 됩니다.\n\n문진을 마치면, 환자분께서 제공해주신 답변을 바탕으로\n사전 진단서를 확인하실 수 있습니다.;`,
              avatar: "/images/Doctor_img.png",
            },
            {
              id: Date.now() + 1,
              type: "bot",
              text: questions[0],
              avatar: "/images/Doctor_img.png",
            },
          ]);
        } else {
          // [기존] 치료 외 목적(문진 모드)
          setMessages([
            {
              id: Date.now(),
              type: "bot",
              text: questions[0],
              avatar: "/images/Doctor_img.png",
            },
          ]);
        }
      }
    }
  }, [questions, isSimpleChat, purpose]);

  // 질문 인덱스에 따른 키
  const getQuestionKey = (index) => {
    switch (index) {
      case 0:
        return "증상 내용";
      case 1:
        return "증상 기간";
      case 2:
        return "증상 부위";
      case 3:
        return "치아 흔들림 여부";
      case 4:
        return "통증 유형";
      case 5:
        return "잇몸 부기 여부";
      default:
        return "unknown";
    }
  };

  // 사용자 답변 처리 (문진 모드와 일반 채팅 모드 구분)
  const handleUserAnswer = async (answer) => {
    if (!isQuestionnaireCompleted) {
      // 사용자 답변 추가
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "user", text: answer },
      ]);
      const newAnswers = {
        ...answers,
        [getQuestionKey(currentQuestionIndex)]: answer,
      };
      setAnswers(newAnswers);

      try {
        // 로딩 시작
        setIsLoading(true);
        // 로딩 메시지(로딩 말풍선) 추가 (실제 답변이 들어올 위치에 inline 렌더링)
        setMessages((prev) => [...prev, { id: "loading", type: "loading" }]);

        if (currentQuestionIndex < questions.length - 1) {
          if (currentQuestionIndex === 0) {
            const vas_res = await fetchVASResponse(answer);
            setVas(vas_res);
          }
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          // 로딩 메시지 제거 후 다음 질문 추가 (pop 애니메이션 효과 적용)
          setMessages((prev) => prev.filter((msg) => msg.id !== "loading"));
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: "bot",
              text: questions[nextIndex],
              avatar: "/images/Doctor_img.png",
              animate: true, // 새 메시지 pop 애니메이션 플래그
            },
          ]);
        } else {
          const answerString = JSON.stringify(newAnswers);
          const pre_res = await fetchPresumResponse(answerString);

          const data = {
            ...newAnswers,
            vas_scale: vas,
            predicted_disease: pre_res["예상 질환"],
            patid: patid, // 전달받은 patid 사용
          };

          axios
            .post(`http://3.39.70.32/api/save-object/`, data)
            .then((response) => console.log("데이터 저장 성공:", response.data))
            .catch((error) => console.error("데이터 저장 실패:", error));

          // 로딩 메시지 제거 후 프리다이애그노시스 보고서 추가
          setMessages((prev) => prev.filter((msg) => msg.id !== "loading"));
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: "pre",
              text: <PreDiagnosisReport answersToRender={pre_res} vas={vas} />,
            },
          ]);
          setIsQuestionnaireCompleted(true);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "bot",
              text: `사전 문진이 모두 완료되었습니다. 자유롭게 채팅을 이용해보세요!\n\n현재 치과 챗봇에서는 다음과 같은 안내가 가능합니다.\n\n1) **치과상담**: 사전문진, 병명, 궁금한 점 등에 대해 설명해 드려요.\n2) **비급여 진료비 안내**: 비급여 항목 및 예상 비용 정보를 알려드려요.\n3) **진료예약**: 진료 예약 가능 일정 및 방법을 안내해 드려요.\n\n원하시는 항목에 대해 언제든 질문해주세요!`,
              avatar: "/images/Doctor_img.png",
              animate: true,
            },
          ]);
        }
      } catch (error) {
        console.error("오류 발생:", error);
      } finally {
        // 로딩 종료
        setIsLoading(false);
      }
    } else {
      // 일반 채팅 모드의 경우
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "user", text: answer },
      ]);
      try {
        // 로딩 시작 : answer, patid 객체를 전달
        setIsLoading(true);
        // API 호출 전에 로딩 메시지 추가 (실제 답변 자리)
        setMessages((prev) => [...prev, { id: "loading", type: "loading" }]);
        const llmResponse = await fetchLLMResponse({ answer, patid });
        // 로딩 메시지 제거 후 실제 답변 추가 (pop 애니메이션 적용)
        setMessages((prev) => prev.filter((msg) => msg.id !== "loading"));
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: (
              <div>
                <ReactMarkdown>{llmResponse}</ReactMarkdown>
              </div>
            ),
            animate: true,
            avatar: "/images/Doctor_img.png",
          },
        ]);
      } catch (error) {
        console.error("LLM 응답 오류:", error);
      } finally {
        // 로딩 종료
        setIsLoading(false);
      }
    }
  };

  // 텍스트 메시지 전송
  const sendMessage = async () => {
    if (input.trim() === "") return;
    const userInput = input;
    setInput("");
    await handleUserAnswer(userInput);
  };

  // STT 관련 훅 사용
  const { isTranscribing, sendAudioToOpenAI } = useSTT();

  // 음성 녹음 훅 사용 (녹음 종료 시 STT 처리 콜백 지정)
  const { isRecording, startRecording, stopRecording } = useAudioRecording(
    async (audioBlob) => {
      await sendAudioToOpenAI(audioBlob, handleUserAnswer);
    }
  );

  return (
    <div className="chat-page-container">
      <NavigationButtons />
      <ChatWindow messages={messages} />
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        isTranscribing={isTranscribing}
      />
    </div>
  );
}

export default ChatPage;
