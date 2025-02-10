// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css"; // 사이드바용 CSS

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {/* 로고 이미지가 있다면 <img src="..." alt="..." /> 사용 */}
          <span className="logo-text">🦷 PreDent</span>
        </div>
        <div className="sidebar-icons">
          <span className="icon-user">👤</span>
          <span className="icon-gear">⚙️</span>
          <span className="icon-bell">🔔</span>
        </div>
      </div>

      <div className="sidebar-search">
        <input type="text" placeholder="Search for..." />
      </div>

      <nav className="sidebar-menu">
        <Link to="/" className="menu-item">
          사용자 정보 입력
        </Link>
        <Link to="/chat" className="menu-item">
          대화 시작
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
