// DoctPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientPrescreening from "../components/PatientPrescreening";
import axios from "axios";
import DoctSidebar from "../components/DoctSidebar";
import "./DoctPage.css";

export default function DoctPage() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRecordSelect = (mecid) => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://3.39.70.32/api/medicert_detail/${mecid}/`)
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

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    navigate("/login");
  };

  return (
    <div className="doctor-page">
      {/* 왼쪽 사이드바 영역 */}
      <DoctSidebar onRecordSelect={handleRecordSelect} />

      {/* 오른쪽 메인 콘텐츠 영역 */}
      <div className="doctor-page-container">
        <div className="header">
          <h1 className="page-title">환자별 사전문진 상세</h1>
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
