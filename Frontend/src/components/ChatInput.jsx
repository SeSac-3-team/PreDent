import React, { useState } from "react";
import "./ChatInput.css";

const ChatInput = ({
  input,
  setInput,
  sendMessage,
  isRecording,
  startRecording,
  stopRecording,
  isTranscribing,
}) => {
  const [showVoiceModal, setShowVoiceModal] = useState(false); // 상태 관리 추가

  // 녹음 시작
  const handleStartRecording = () => {
    setShowVoiceModal(true);
    startRecording();
  };

  // 녹음 종료
  const handleStopRecording = () => {
    setShowVoiceModal(false);
    stopRecording();
  };

  return (
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
          onClick={isRecording ? handleStopRecording : handleStartRecording}
        >
          {isRecording ? "⏹️" : "🎙️"}
        </button>
      </div>
      {isRecording && (
        <div
          className="recording-indicator"
          style={{ color: "red", marginLeft: "10px" }}
        >
          <span>●</span> 녹음 중...
        </div>
      )}
      {isTranscribing && <span style={{ marginLeft: "10px" }}>변환 중...</span>}

      {/* 음성 입력 모달 */}
      {showVoiceModal && <VoiceModal stopRecording={handleStopRecording} />}
    </div>
  );
};

const VoiceModal = ({ stopRecording }) => {
  return (
    <div className="voice-modal">
      <div className="voice-content">
        {/* 막대 4개를 가진 원 형태 */}
        <div className="loading-animation">
          <div className="bar bar1"></div>
          <div className="bar bar2"></div>
          <div className="bar bar3"></div>
          <div className="bar bar4"></div>
        </div>

        <p>음성 인식 중...</p>
        <button className="stop-button" onClick={stopRecording}>
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
