import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RevisitFormPage.css";
import { getCsrfToken } from "../Utils/getCsrfToken";

function RevisitFormPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [PatientId, setPatientId] = useState(null); // 기존 환자 ID 저장
  const [showNotFoundModal, setShowNotFoundModal] = useState(false); // 초진 환자 모달 노출 여부

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agree) {
      alert("개인정보 수집 및 이용에 동의 후 사전진료를 시작할 수 있습니다.");
      return;
    }

    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 1) 기존 환자 존재 여부 확인 (재진 환자인지 확인)
      const checkData = { name, phone };
      const checkResponse = await axios.post(
        "http://127.0.0.1:8000/get_existing_patient/",
        checkData,
        {
          headers: { "X-CSRFToken": csrfToken },
          withCredentials: true,
        }
      );

      if (checkResponse.data.found) {
        // 기존 환자인 경우: 환자 ID(PID)를 상태에 저장 후 업데이트
        const patientId = checkResponse.data.patient_id;
        setPatientId(patientId);

        const updateData = {
          patient_id: patientId,
          purpose: purpose.trim(),
          agree: agree ? 1 : 0,
        };

        // 내원 목적이 입력된 경우에만 포함
        if (purpose.trim() !== "") {
          updateData.purpose = purpose.trim();
        }
        updateData.agree = agree ? 1 : 0;

        await axios.patch("http://127.0.0.1:8000/update_patient/", updateData, {
          headers: { "X-CSRFToken": csrfToken },
          withCredentials: true,
        });

        setMessage(
          "기존 환자 정보를 확인/갱신했습니다. 챗봇 페이지로 이동합니다."
        );
        navigate("/chat", { state: { patid: patientId, purpose } });
      } else {
        // DB에 일치하는 환자 정보가 없으면(초진환자 입력) 모달 표시
        setShowNotFoundModal(true);
      }
    } catch (error) {
      console.error("오류 발생:", error);
      setMessage("데이터 저장 실패(서버 오류)");
    }
  };

  // 모달에서 "확인" 클릭 시 초진(초기정보 입력) 페이지로 이동
  const handleModalConfirm = () => {
    navigate("/info");
  };

  // 모달에서 "취소" 클릭 시 모달 닫기
  const handleModalCancel = () => {
    setShowNotFoundModal(false);
  };

  return (
    <div className="returning-info-container">
      <h1>재진 환자 정보를 확인합니다.</h1>
      <p>
        기존에 내원하신 적이 있다면, DB에서 예전 정보를 조회하여 부족한 부분만
        갱신합니다.
      </p>

      <form onSubmit={handleSubmit} className="returning-info-form">
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
          <label>휴대폰 번호</label>
          <input
            type="text"
            placeholder="휴대폰 번호를 입력하세요"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>내원 목적</label>
          <div
            className="purpose-check"
            style={{ display: "flex", gap: "2rem" }}
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
          사전진료(재진) 시작
        </button>
      </form>

      {message && <p>{message}</p>}

      {/* 초진 환자 안내 모달 */}
      {showNotFoundModal && (
        <div className="modal">
          <div className="modal-content">
            <p>
              입력하신 정보와 일치하는 환자 기록이 없습니다.
              <br />
              초진 환자 정보입니다.
              <br />
              초기 환자 정보 입력 페이지로 이동하시겠습니까?
            </p>
            <div className="modal-buttons">
              <button onClick={handleModalConfirm}>확인</button>
              <button onClick={handleModalCancel}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevisitFormPage;
