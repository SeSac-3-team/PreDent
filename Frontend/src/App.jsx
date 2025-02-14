// src/App.jsx (Routing Page)
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar"; // Sidebar 컴포넌트
import InfoFormPage from "./pages/InfoFormPage"; // 초진 환자 정보 입력 페이지
import ChatPage from "./pages/ChatPage"; // 사전문진 및 채팅 페이지
import VisitCheckPage from "./pages/VisitCheckPage"; // 방문이력 확인 페이지
import RevisitFormPage from "./pages/RevisitFormPage"; // 재진 환자 정보 입력 페이지
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation(); // 현재 경로 가져오기

  // VisitCheckPage ("/")에서는 사이드바를 숨김
  const hideSidebar = location.pathname === "/";

  return (
    <div className="app-container">
      {/* 사이드바 (좌측 고정) -> "/" 경로에서는 숨김 */}
      {!hideSidebar && <Sidebar />}

      {/* 오른쪽 메인 컨텐츠 */}
      <div className="main-content">
        <Routes>
          {/* "/" 경로 -> VisitCheckPage (병원 방문이력 확인 페이지) */}
          <Route path="/" element={<VisitCheckPage />} />

          {/* "/info" 경로 -> InfoFormPage (초진 환자 정보입력 페이지) */}
          <Route path="/info" element={<InfoFormPage />} />

          {/* "/re_info" 경로 -> RevisitFormPage (재진 환자 정보입력 페이지) */}
          <Route path="/re_info" element={<RevisitFormPage />} />

          {/* "/chat" 경로 -> ChatPage (사전 문진 챗봇 페이지) */}
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
