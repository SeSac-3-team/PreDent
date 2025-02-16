// src/App.jsx (Routing Page)

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar"; // Sidebar 컴포넌트
import InfoFormPage from "./pages/InfoFormPage"; // 개인정보 입력 페이지
import ChatPage from "./pages/ChatPage"; // 채팅 페이지
import DoctPage from "./pages/DoctPage"; // DoctPage 추가
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* 사이드바 (좌측 고정) */}
        <Sidebar />

        {/* 오른쪽 메인 컨텐츠 */}
        <div className="main-content">
          <Routes>
            {/* "/" 경로 -> InfoFormPage (사용자 정보 입력 페이지) */}
            <Route path="/" element={<InfoFormPage />} />

            {/* "/chat" 경로 -> ChatPage (채팅 페이지) */}
            <Route path="/chat" element={<ChatPage />} />

            {/* "/doct" 경로 -> DoctPage (의사 페이지) */}
            <Route path="/doct" element={<DoctPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
