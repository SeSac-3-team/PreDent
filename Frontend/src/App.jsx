// src/App.jsx (Routing Page)
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import InfoFormPage from "./pages/InfoFormPage"; // 초진 환자 정보 입력 페이지
import ChatPage from "./pages/ChatPage"; // 사전문진 및 채팅 페이지
import VisitCheckPage from "./pages/VisitCheckPage"; // 방문이력 확인 페이지
import RevisitFormPage from "./pages/RevisitFormPage"; // 재진 환자 정보 입력 페이지
import DoctPage from "./pages/DoctPage"; // 의사 전용 페이지
import LoginPage from "./pages/LoginPage"; // 의사 로그인 페이지
import "./App.css";

// ✅ 의사 전용 페이지 보호 (Private Route)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("doctorToken"); // 저장된 토큰 확인
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation(); // 현재 경로 가져오기

  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<VisitCheckPage />} />
        <Route path="/info" element={<InfoFormPage />} />
        <Route path="/re_info" element={<RevisitFormPage />} />
        <Route path="/chat" element={<ChatPage />} />

        {/* ✅ 의사 전용 페이지 보호 */}
        <Route
          path="/doct/*"
          element={
            <PrivateRoute>
              <DoctPage />
            </PrivateRoute>
          }
        />

        {/* 🔹 의사 로그인 페이지 추가 */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
