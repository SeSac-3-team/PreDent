// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch(`http://3.39.70.32/api/authenticate/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${password}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("doctorToken", password);
      navigate("/doct"); // 로그인 성공 후 의사 페이지로 이동
    } else {
      setError("잘못된 비밀번호입니다.");
    }
  };

  return (
    <div className="login-container">
      <h2>의사 로그인</h2>
      <input
        type="password"
        placeholder="비밀번호 입력"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>로그인</button>
      {error && <p className="error">{error}</p>}

      {/* 🔹 메인(방문 확인 페이지)으로 돌아가는 버튼 */}
      <button className="back-button" onClick={() => navigate("/")}>
        메인 페이지로 돌아가기
      </button>
    </div>
  );
};

export default LoginPage;
