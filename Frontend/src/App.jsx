// src/App.jsx (Routing Page)
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
  return (
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
  );
}

export default App;
