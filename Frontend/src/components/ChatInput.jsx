// src/components/ChatInput.jsx
import React from "react";
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
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "전송⏹️" : "🎙️"}
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
    </div>
  );
};

export default ChatInput;
