// src/pages/InfoFormPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./InfoFormPage.css";

function InfoFormPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [address, setAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!agree) {
      alert("개인정보 수집 및 이용에 동의 후 사전진료를 시작할 수 있습니다.");
      return;
    }

    // 백엔드에서 요구하는 key:value 맞추어 데이터 객체 생성
    const data = {
      name: name,
      gender: gender,
      phone: phone,
      birth: birth,
      address: address,
      purpose: purpose,
      agree: agree ? 1 : 0,
    };

    axios
      .post("http://127.0.0.1:8004/save_patient/", data)
      .then((response) => {
        console.log("성공:", response.data);
        setMessage("데이터 저장 성공!");
        // 데이터 저장 후 ChatPage로 이동하고, 환자 정보(서비스 선택 값)를 전달합니다.
        navigate("/chat", { state: { purpose: purpose } });
      })
      .catch((error) => {
        console.error("실패:", error);
        setMessage("데이터 저장 실패");
      });
  };
  // 사용자 정보 입력란 화면 랜더링
  return (
    <div className="info-page-container">
      <h1>진료를 기다리고 계신가요?</h1>
      <p>대기시간 동안 챗봇에게 간단한 사전진료를 받아보세요!</p>

      <form onSubmit={handleSubmit} className="info-form">
        <div className="form-group">
          <label>성명</label>
          <input
            type="text"
            placeholder="성명을 입력하세요"
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
            placeholder="휴대폰 번호를 입력하세요"
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
            placeholder="주소를 입력하세요"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>내원 목적</label>
          <div
            className="purpose-check"
            style={{ display: "flex", gap: "10rem" }}
          >
            <label>
              <input
                type="radio"
                name="purpose"
                value="치료"
                checked={purpose === "치료"}
                onChange={(e) => setPurpose(e.target.value)}
              />
              치료
            </label>
            <label>
              <input
                type="radio"
                name="purpose"
                value="미용"
                checked={purpose === "미용"}
                onChange={(e) => setPurpose(e.target.value)}
              />
              미용
            </label>
            <label>
              <input
                type="radio"
                name="purpose"
                value="교정"
                checked={purpose === "교정"}
                onChange={(e) => setPurpose(e.target.value)}
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

      {message && <p>{message}</p>}
    </div>
  );
}

export default InfoFormPage;
