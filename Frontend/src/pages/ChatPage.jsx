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

// --- 추가된 부분: 중앙에 고정된 스피너 및 진행 상황 메시지 컴포넌트 ---
function LoadingSpinner({ message = "잠시만 기다려 주세요..." }) {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        <div className="spinner" />
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  );
}

function ChatPage() {
  // 1. 진입 목적에 따른 모드 설정 (치료 vs 단순 채팅)
  const location = useLocation();
  const { patid, purpose } = location.state || {};
  const isSimpleChat = purpose !== "치료";

  // 2. 설문/문진 관련 상태들
  const [questions, setQuestions] = useState([
    "환자분의 증상을 한 문장으로 표현해주세요. \n예) 어금니가 시려서 차가운 음식을 먹기 힘들어요.",
    "언제부터 증상이 시작되셨나요? \n예) 한 달 정도 된 것 같아요",
    "증상이 나타나는 부위는 어디인가요? \n예) 오른쪽 윗 어금니",
    "치아가 흔들리지는 않으시나요? \n예) 흔들리지는 않아요",
    "환부를 건드릴 때에만 아프신가요, 가만히 있어도 아프신가요? \n예) 건드릴 때에만 아픕니다",
    "잇몸이 부어있지는 않으신가요? \n예) 살짝 붓기가 있어요",
  ]);
  const [messages, setMessages] = useState([]);
  const [vas, setVas] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");
  const [isQuestionnaireCompleted, setIsQuestionnaireCompleted] =
    useState(false);

  // --- 추가된 부분: 로딩 상태 추가 ---
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
            text: "안녕하세요!😊\n자유롭게 채팅을 이용해보세요!",
            sender: "bot",
            avatar: "public/images/Doctor_img.png",
          },
        ]);
      } else if (questions.length > 0) {
        setMessages([
          {
            text: questions[0],
            sender: "bot",
            avatar: "public/images/Doctor_img.png",
          },
        ]);
      }
    }
  }, [questions, isSimpleChat]);

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
      setMessages((prev) => [...prev, { text: answer, sender: "user" }]);
      const newAnswers = {
        ...answers,
        [getQuestionKey(currentQuestionIndex)]: answer,
      };
      setAnswers(newAnswers);

      try {
        // --- 추가된 부분: 로딩 시작 ---
        setIsLoading(true);

        if (currentQuestionIndex < questions.length - 1) {
          if (currentQuestionIndex === 0) {
            const vas_res = await fetchVASResponse(answer);
            setVas(vas_res);
          }
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          setMessages((prev) => [
            ...prev,
            {
              text: questions[nextIndex],
              sender: "bot",
              avatar: "public/images/Doctor_img.png",
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
            .post("http://127.0.0.1:8000/save-object/", data)
            .then((response) => console.log("데이터 저장 성공:", response.data))
            .catch((error) => console.error("데이터 저장 실패:", error));

          setMessages((prev) => [
            ...prev,
            {
              text: <PreDiagnosisReport answersToRender={pre_res} vas={vas} />,
              sender: "pre",
            },
          ]);
          setIsQuestionnaireCompleted(true);
          setMessages((prev) => [
            ...prev,
            {
              text: "사전 문진이 모두 완료되었습니다. 😊자유롭게 채팅을 이용해보세요!",
              sender: "bot",
              avatar: "public/images/Doctor_img.png",
            },
          ]);
        }
      } catch (error) {
        console.error("오류 발생:", error);
      } finally {
        // --- 추가된 부분: 로딩 종료 ---
        setIsLoading(false);
      }
    } else {
      setMessages((prev) => [...prev, { text: answer, sender: "user" }]);
      try {
        // --- 추가된 부분: 로딩 시작 ---
        setIsLoading(true);
        const llmResponse = await fetchLLMResponse(answer);
        const content2 = (
          <div>
            <ReactMarkdown>{llmResponse}</ReactMarkdown>
          </div>
        );
        setMessages((prev) => [
          ...prev,
          {
            text: content2,
            sender: "bot",
            avatar: "public/images/Doctor_img.png",
          },
        ]);
      } catch (error) {
        console.error("LLM 응답 오류:", error);
      } finally {
        // --- 추가된 부분: 로딩 종료 ---
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
  const { isTranscribing, transcription, sendAudioToOpenAI } = useSTT();

  // 음성 녹음 훅 사용 (녹음 종료 시 STT 처리 콜백 지정)
  const { isRecording, startRecording, stopRecording } = useAudioRecording(
    async (audioBlob) => {
      await sendAudioToOpenAI(audioBlob, handleUserAnswer);
    }
  );

  return (
    <div className="chat-page-container">
      <NavigationButtons />
      {/* --- 추가된 부분: 로딩 중일 때 오버레이로 스피너와 진행 메시지 표시 --- */}
      {isLoading && <LoadingSpinner message="현재 답변을 생성 중입니다..." />}
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
