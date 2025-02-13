// src/components/ChatWindow.jsx
import React, { useEffect, useRef } from "react";
import Message from "./Message";
import "./ChatWindow.css";

const ChatWindow = ({ messages }) => {
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-window" ref={chatWindowRef}>
      {messages.map((msg, index) => (
        <Message key={index} msg={msg} />
      ))}
    </div>
  );
};

export default ChatWindow;
