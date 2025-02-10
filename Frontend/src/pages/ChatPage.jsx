// src/pages/ChatPage.jsx

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; // [변경]
import "./ChatPage.css";

function ChatPage() {
  // [변경] "치료" 선택 여부 확인
  const location = useLocation(); // [변경]
  const perpose = location.state?.perpose || ""; // [변경]
  const isSimpleChat = perpose !== "치료"; // [변경]

  // -----------------------------
  // 1) 기존 텍스트 채팅 상태 및 로직
  // -----------------------------
  const [questions, setQuestions] = useState([
    "환자분의 증상을 한 문장으로 표현해주세요. \n예) 왼쪽 어금니가 시려서 차가운 음식을 먹기 힘들어요.",
    "언제부터 증상이 시작되셨나요? \n예) 한 달 정도 된 것 같아요",
    "증상이 나타나는 부위는 어디인가요? \n예) 오른쪽 윗 어금니",
    "치아가 흔들리지는 않으시나요? \n예) 흔들리지는 않아요",
    "환부를 건드릴 때에만 아프신가요, 가만히 있어도 아프신가요? \n예) 건드릴 때에만 아픕니다",
    "잇몸이 부어있지는 않으신가요? \n예) 살짝 붓기가 있어요",
  ]);

  const [messages, setMessages] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");

  // 설문(질문 목록) 완료 여부를 판단하는 상태
  const [isQuestionnaireCompleted, setIsQuestionnaireCompleted] =
    useState(false);

  // 첫 질문을 한 번만 추가하기 위한 Ref
  const hasInitialized = useRef(false);
  useEffect(() => {
    // [변경] 첫 렌더링 시, "치료"가 아닐 경우 문진 없이 간단 인사만
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (isSimpleChat) {
        setIsQuestionnaireCompleted(true); // [변경]
        setMessages([
          {
            text: "안녕하세요!😊\n자유롭게 채팅을 이용해보세요!",
            sender: "bot",
            avatar: "public/images/Doctor_img.png",
          },
        ]); // [변경]
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
  }, [questions, isSimpleChat]); // [변경: isSimpleChat도 의존성에 추가]

  // 채팅창에 스크롤을 제어할 ref 추가
  const chatWindowRef = useRef(null);

  // messages 업데이트 시 자동 스크롤
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // 질문 인덱스에 따른 키 반환 함수
  const getQuestionKey = (index) => {
    switch (index) {
      case 0:
        return "증상";
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

  // 답변들을 채팅창에 출력하는 함수 (설문 종료 후 요약)
  const renderAnswers = (answersToRender) => {
    const answerElements = Object.entries(answersToRender).map(
      ([key, value]) => (
        <div key={key}>
          <p>
            {key}: {value}
          </p>
        </div>
      )
    );

    setMessages((prev) => [
      ...prev,
      {
        text: <div>{answerElements}</div>,
        sender: "bot",
        avatar: "public/images/Doctor_img.png",
      },
    ]);
  };

  // 텍스트와 음성 입력 모두 공통으로 답변을 처리하는 함수 (설문 모드 vs LLM 대화 모드)
  const handleUserAnswer = async (answer) => {
    // LLM 대화 모드가 아니라면 설문 모드로 처리
    if (!isQuestionnaireCompleted) {
      // 사용자 답변 메시지 추가
      setMessages((prev) => [...prev, { text: answer, sender: "user" }]);

      // 답변 객체 업데이트
      const newAnswers = {
        ...answers,
        [getQuestionKey(currentQuestionIndex)]: answer,
      };
      setAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        // 다음 질문 출력
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
        // 마지막 질문의 답변이면 설문 요약을 렌더링하고 LLM 대화 모드로 전환
        renderAnswers(newAnswers);
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
    } else {
      // 문진이 완료된 상태 or 치과방문 간단 모드일 때(처음부터)
      setMessages((prev) => [...prev, { text: answer, sender: "user" }]);
      const llmResponse = await fetchLLMResponse(answer);
      setMessages((prev) => [
        ...prev,
        {
          text: llmResponse,
          sender: "bot",
          avatar: "public/images/Doctor_img.png",
        },
      ]);
    }
  };

  // 텍스트 전송 처리
  const sendMessage = async () => {
    if (input.trim() === "") return;
    const userInput = input;
    setInput("");
    await handleUserAnswer(userInput);
  };

  // 간단 fetch 함수 (LLM API 호출)
  const fetchLLMResponse = async (userMessage) => {
    const apiUrl = `http://127.0.0.1:8000/chat/${encodeURIComponent(
      userMessage
    )}`;
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        return data.answer;
      } else {
        return "API 요청에 실패했습니다.";
      }
    } catch (error) {
      return `오류 발생: ${error.message}`;
    }
  };

  // -----------------------------
  // 2) 음성 녹음 관련 상태 및 로직 (수정 없음)
  // -----------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  // -----------------------------
  // 3) STT(음성 → 텍스트) 상태 및 로직 (수정 없음)
  // -----------------------------
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
      mediaRecorder.onstop = () => {
        const audio = new Blob(chunks, { type: "audio/webm" });
        console.log("[DEBUG] audio:", audio);
        setAudioBlob(audio);
        sendAudioToOpenAI(audio);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("마이크 접근 오류:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // -----------------------------
  // 4) 음성 → 텍스트 변환 및 답변 처리 (수정 없음)
  // -----------------------------
  const sendAudioToOpenAI = async (recordedBlob) => {
    if (!recordedBlob) {
      alert("녹음된 음성이 없습니다.");
      return;
    }

    setIsTranscribing(true);
    setTranscription("");

    try {
      const formData = new FormData();
      formData.append("file", recordedBlob, "audio.webm");
      formData.append("model", "whisper-1");
      formData.append("language", "ko");

      const openAIResponse = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const transcript = openAIResponse.data.text;
      setTranscription(transcript);
      await handleUserAnswer(transcript);
    } catch (error) {
      console.error("STT API 오류:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  // -----------------------------
  // 5) 최종 렌더링 (수정 없음)
  // -----------------------------
  return (
    <div className="chat-page-container">
      <h2>대화 페이지</h2>

      {/* 대화 메시지 창에 ref 추가 */}
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.sender === "bot" && (
              <img src={msg.avatar} alt="Bot" className="chat-avatar" />
            )}
            <span className="chat-text">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* 텍스트 입력, 마이크 버튼, 전송 버튼 */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <div className="send-button">
          <button onClick={sendMessage}>전송</button>
        </div>

        <div className="mic-button">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{ marginLeft: "0px", marginRight: "1px" }}
          >
            {isRecording ? "전송⏹️" : "🎙️"}
          </button>
        </div>

        {isRecording && (
          <div
            className="recording-indicator"
            style={{
              color: "red",
              marginLeft: "10px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <span>●</span> 녹음 중...
          </div>
        )}

        {isTranscribing && (
          <span style={{ marginLeft: "10px" }}>변환 중...</span>
        )}
      </div>

      {/* STT 결과 표시 */}
      {transcription && (
        <div className="stt-result">
          <strong>STT 결과:</strong> {transcription}
        </div>
      )}
    </div>
  );
}

export default ChatPage;
