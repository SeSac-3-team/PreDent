// src/pages/DoctPage.jsx

import React from "react";
import PatientPrescreening from "../components/PatientPrescreening"; // 환자 사전문진 컴포넌트
import { useParams } from "react-router-dom";

// 임시 환자 데이터 (실제 앱에서는 API에서 불러오기)
const patientData = {
  mecid: 126,
  vas_scale: 2,
  predicted_disease: "치은염 및 치주염 초기",
  created: "2025-02-14 01:17:24.78161",
  patid: 46,
  symptom_description: "왼쪽 어금니가 시려서 차가운 음식을 먹기 힘들어요",
  symptom_duration: "한 달 정도 된 것 같아요",
  symptom_area: "오른쪽 윗 어금니",
  tooth_mobility: "흔들리지는 않아요",
  pain_type: "건드릴 때에만 아픕니다",
  gum_swelling: "살짝 붓기가 있어요",
};

export default function DoctPage() {
  const { patientId } = useParams(); // URL에서 환자 ID 가져오기 (필요하면 활용)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">의사용 환자 사전문진 페이지</h1>
      <PatientPrescreening patientData={patientData} />
    </div>
  );
}
