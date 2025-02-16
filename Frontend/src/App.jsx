// src/App.jsx (Routing Page)
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar"; // Sidebar 컴포넌트
import InfoFormPage from "./pages/InfoFormPage"; // 초진 환자 정보 입력 페이지
import ChatPage from "./pages/ChatPage"; // 사전문진 및 채팅 페이지
import VisitCheckPage from "./pages/VisitCheckPage"; // 방문이력 확인 페이지
import RevisitFormPage from "./pages/RevisitFormPage"; // 재진 환자 정보 입력 페이지
import DoctPage from "./pages/DoctPage"; // DoctPage 추가
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
  const hideSidebar =
    location.pathname === "/" || location.pathname.startsWith("/doct");

  return (
    <div className="app-container">
      {!hideSidebar && <Sidebar />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<VisitCheckPage />} />
          <Route path="/info" element={<InfoFormPage />} />
          <Route path="/re_info" element={<RevisitFormPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/doct/*" element={<DoctPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
