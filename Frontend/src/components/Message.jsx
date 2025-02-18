// src/components/Message.jsx
import React, { useEffect, useRef } from "react";
import "./Message.css";
import LoadingBubble from "./LoadingBubble";

const Message = ({ msg }) => {
  const messageRef = useRef(null);

  // pop 애니메이션 적용
  useEffect(() => {
    if (msg.animate && messageRef.current) {
      messageRef.current.classList.add("pop-animation");
    }
  }, [msg.animate]);

  // 로딩 메시지면 LoadingBubble을 렌더링
  if (msg.type === "loading") {
    return (
      <div ref={messageRef} className={`chat-message loading`}>
        <LoadingBubble message="현재 답변 생성중입니다 잠시만 기다려 주세요" />
      </div>
    );
  }

  return (
    <div ref={messageRef} className={`chat-message ${msg.type}`}>
      {/* 봇 메시지(또는 필요 시) 아바타 표시 */}
      {msg.type === "bot" && msg.avatar && (
        <img src={msg.avatar} alt="Bot" className="chat-avatar" />
      )}

      <span className="chat-text">
        {typeof msg.text === "string" ? msg.text : msg.text}
      </span>
    </div>
  );
};

export default Message;
