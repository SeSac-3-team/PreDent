import React, { useState, useEffect } from "react";
import PatientPrescreening from "../components/PatientPrescreening";
import axios from "axios";
import DoctSidebar from "../components/DoctSidebar";
import "./DoctPage.css";

export default function DoctPage() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRecordSelect = (mecid) => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://localhost:8000/medicert_detail/${mecid}/`)
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

  return (
    <div className="doctor-page">
      {/* 의사용 사이드바 */}
      <DoctSidebar onRecordSelect={handleRecordSelect} />

      {/* 메인 콘텐츠 컨테이너 */}
      <div className="doctor-page-container">
        <h1 className="page-title">환자별 사전문진 상세</h1>

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
