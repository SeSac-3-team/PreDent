// src/pages/InfoFormPage.jsx

/* -----------------------
   1) 개인정보 입력 페이지 
------------------------*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InfoFormPage.css";

function InfoFormPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [address, setAddress] = useState("");
  const [perpose, setPerpose] = useState(false);
  const [agree, setAgree] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      alert("개인정보 수집 및 이용에 동의해야 사전진료를 시작할 수 있습니다.");
      return;
    }
    // 선택한 서비스 목적(perpose)을 함께 전달
    navigate("/chat", { state: { perpose } });
  };

  return (
    <div className="info-page-container">
      <h1>진료를 기다리고 계신가요?</h1>
      <p>대기시간 동안 챗봇에게 간단한 사전진료를 받아보세요!</p>

      <form onSubmit={handleSubmit} className="info-form">
        <div className="form-group">
          <label>성명</label>
          <input
            type="text"
            placeholder="Placeholder"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>성별</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <label>
              <input
                type="radio"
                name="gender"
                value="남"
                checked={gender === "남"}
                onChange={(e) => setGender(e.target.value)}
              />
              남
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="여"
                checked={gender === "여"}
                onChange={(e) => setGender(e.target.value)}
              />
              여
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>휴대폰 번호</label>
          <input
            type="text"
            placeholder="Placeholder"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>생년월일</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>주소</label>
          <input
            type="text"
            placeholder="Placeholder"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>서비스 선택</label>
          <div
            className="perpose-check"
            style={{ display: "flex", gap: "10rem" }}
          >
            <label>
              <input
                type="radio"
                name="perpose"
                value="치료"
                checked={perpose === "치료"}
                onChange={(e) => setPerpose(e.target.value)}
              />
              치료
            </label>
            <label>
              <input
                type="radio"
                name="perpose"
                value="미용"
                checked={perpose === "미용"}
                onChange={(e) => setPerpose(e.target.value)}
              />
              미용
            </label>
            <label>
              <input
                type="radio"
                name="perpose"
                value="교정"
                checked={perpose === "교정"}
                onChange={(e) => setPerpose(e.target.value)}
              />
              교정
            </label>
          </div>
        </div>

        <div className="form-check">
          <input
            type="checkbox"
            id="agree"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <label htmlFor="agree">
            [개인정보 보호법]에 의거한 개인정보 수집 및 이용에 동의합니다
          </label>
        </div>

        <button type="submit" className="start-button" disabled={!agree}>
          사전진료 시작
        </button>
      </form>
    </div>
  );
}

export default InfoFormPage;
