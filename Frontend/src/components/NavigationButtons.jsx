import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./NavigationButtons.css";

const NavigationButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 첫 페이지면 버튼을 렌더링하지 않음 (예: 첫 페이지가 "/"인 경우)
  if (location.pathname === "/") return null;

  return (
    <div className="nav-buttons-container">
      <button className="nav-button prev-button" onClick={() => navigate(-1)}>
        이전
      </button>
      <button
        className="nav-button home-button"
        onClick={() => navigate("/", { replace: true })}
      >
        처음으로
      </button>
    </div>
  );
};

export default NavigationButtons;
