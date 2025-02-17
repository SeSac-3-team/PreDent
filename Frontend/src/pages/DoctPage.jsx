import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 🔹 페이지 이동을 위한 useNavigate 추가
import PatientPrescreening from "../components/PatientPrescreening";
import axios from "axios";
import DoctSidebar from "../components/DoctSidebar";
import "./DoctPage.css";

export default function DoctPage() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // 🔹 React Router의 페이지 이동 기능 사용

  const handleRecordSelect = (mecid) => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://127.0.0.1:8000/medicert_detail/${mecid}/`)
      .then((response) => {
        setPatientData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching record detail:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 🔹 로그아웃 버튼 클릭 시 실행
  const handleLogout = () => {
    localStorage.removeItem("doctorToken"); // 저장된 토큰 삭제
    navigate("/login"); // 로그인 페이지로 이동
  };

  return (
    <div className="doctor-page">
      {/* 의사용 사이드바 */}
      <DoctSidebar onRecordSelect={handleRecordSelect} />

      {/* 메인 콘텐츠 컨테이너 */}
      <div className="doctor-page-container">
        <div className="header">
          <h1 className="page-title">환자별 사전문진 상세</h1>
          {/* 🔹 로그아웃 버튼 추가 */}
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : patientData ? (
          <div className="patient-card">
            <PatientPrescreening patientData={patientData} />
          </div>
        ) : (
          <div className="empty-message">
            사전문진을 확인할 환자를 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
