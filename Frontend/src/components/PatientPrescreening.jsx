import React from "react";
import "./PatientPrescreening.css";

export default function PatientPrescreening({ patientData }) {
  if (!patientData) {
    return <div className="loading-message">Loading patient data...</div>;
  }

  // 환자 기본 정보와 사전 문진 정보를 구조 분해할당합니다.
  const {
    created,
    patient,
    symptom_description,
    vas_scale,
    symptom_area,
    symptom_duration,
    tooth_mobility,
    pain_type,
    gum_swelling,
  } = patientData;

  const getVasRange = (vas_scale) => {
    switch (vas_scale) {
      case "0":
        return "0~1";
      case "1":
        return "2~4";
      case "2":
        return "5~7";
      case "3":
        return "8~10";
      default:
        return "알 수 없음"; // 예외 처리
    }
  };

  return (
    <div className="patient-prescreening-container">
      {/* 상단: 기본 환자 정보 */}
      <div className="patient-info-card">
        <h2 className="section-title">환자 정보</h2>
        <div className="info-item">
          <strong>문진 시점:</strong> {new Date(created).toLocaleString()}
        </div>
        <div className="info-item">
          <strong>환자 이름:</strong> {patient.patname}
        </div>
        <div className="info-item">
          <strong>환자 성별:</strong> {patient.patgend}
        </div>
        <div className="info-item">
          <strong>생년월일:</strong> {patient.patbirth}
        </div>
        <div className="info-item">
          <strong>내원 목적:</strong> {patient.patpurpose}
        </div>
      </div>

      {/* 하단: 사전 문진 상세 정보 */}
      <div className="prescreening-details-card">
        <h2 className="section-title">사전 문진 정보</h2>
        <div className="info-item">
          <strong>증상 설명:</strong> {symptom_description}
        </div>
        <div className="info-item">
          <strong>통증 지수 (VAS):</strong> {getVasRange(vas_scale)}
        </div>
        <div className="info-item">
          <strong>통증 위치:</strong> {symptom_area}
        </div>
        <div className="info-item">
          <strong>증상 기간:</strong> {symptom_duration}
        </div>
        <div className="info-item">
          <strong>치아 흔들림 여부:</strong> {tooth_mobility}
        </div>
        <div className="info-item">
          <strong>통증 상황:</strong> {pain_type}
        </div>
        <div className="info-item">
          <strong>잇몸 붓기 여부:</strong> {gum_swelling}
        </div>
      </div>
    </div>
  );
}
