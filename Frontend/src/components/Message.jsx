// src/components/Message.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import "./Message.css";

const Message = ({ msg }) => {
  return (
    <div className={`chat-message ${msg.sender}`}>
      {msg.sender === "bot" && msg.avatar && (
        <img src={msg.avatar} alt="Bot" className="chat-avatar" />
      )}

      {/* 줄바꿈 적용: whiteSpace: 'pre-line' */}
      <span className="chat-text" style={{ whiteSpace: "pre-line" }}>
        {typeof msg.text === "string" ? msg.text : msg.text}
      </span>
    </div>
  );
};

export default Message;
