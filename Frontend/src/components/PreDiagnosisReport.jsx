// src/components/PreDiagnosisReport.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import "./PreDiagnosisReport.css";

const PreDiagnosisReport = ({ answersToRender, vas }) => {
  const diseaseCategory = answersToRender["질환 카테고리"];
  const diseaseArea = answersToRender["증상 위치"];
  const imageUrlVAS = `/assets/VASimages/${vas}.jpg`;
  const imageUrlDC = `/assets/DCimages/${diseaseCategory}.jpg`;
  const imageUrlArea = `/assets/Areaimages/${diseaseArea}.jpg`;

  return (
    <div className="pre-diagnosis-container">
      <h2 className="pre-diagnosis-title">📝 사전진단서</h2>
      <p className="pre-diagnosis-warning">
        ⚠️ 예상 질환은 참고용일 뿐이며, 정확한 검사와 치료를 위해 치과 전문의의
        상담이 꼭 필요합니다.
      </p>
      <img src={imageUrlVAS} alt={vas} className="pre-diagnosis-image-vas" />
      <div className="pre-diagnosis-row">
        <div className="pre-diagnosis-image-dc">
          <img src={imageUrlDC} alt={diseaseCategory} />
        </div>
        <div className="pre-diagnosis-text">
          <p>
            귀하의 문진 결과에 따라 일반적으로 예상되는 질환은{" "}
            <strong>{answersToRender["예상 질환"]}</strong> 으로 추정됩니다.
          </p>
          <ReactMarkdown>{answersToRender["질환 설명"]}</ReactMarkdown>
        </div>
      </div>
      <div className="pre-diagnosis-row">
        <div className="pre-diagnosis-text">
          <ReactMarkdown>
            {answersToRender["초기 관리 및 생활 습관 추천"]}
          </ReactMarkdown>
          <p className="pre-diagnosis-note">
            👨‍⚕️ 진료 시 전문의가 직접 상태를 세심하게 살펴본 뒤 환자분께 꼭 맞는
            치료 방법을 안내해 드릴 테니 편안한 마음으로 상담 받아보세요! 🦷
          </p>
        </div>
        <div className="pre-diagnosis-image-area">
          <p className="pre-diagnosis-label">증상 발생 위치</p>
          <img src={imageUrlArea} alt={diseaseArea} />
        </div>
      </div>
    </div>
  );
};

export default PreDiagnosisReport;
