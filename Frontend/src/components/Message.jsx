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
      <span className="chat-text">
        {typeof msg.text === "string"
          ? msg.text
          : // JSX나 컴포넌트가 들어올 경우 그대로 렌더링
            msg.text}
      </span>
    </div>
  );
};

export default Message;
