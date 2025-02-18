// src/components/LoadingBubble.jsx
import React, { useState, useEffect } from "react";
import "./LoadingBubble.css";

function LoadingBubble({ message = "답변 생성중" }) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4); // 0~3까지 반복
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="loading-bubble">
      {message}
      <span className="loading-dots">{".".repeat(dotCount)}</span>
    </div>
  );
}

export default LoadingBubble;
