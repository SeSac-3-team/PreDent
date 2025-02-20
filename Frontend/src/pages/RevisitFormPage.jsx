import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RevisitFormPage.css";
import { getCsrfToken } from "../Utils/getCsrfToken";
import NavigationButtons from "../components/NavigationButtons";

function RevisitFormPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [PatientId, setPatientId] = useState(null); // 기존 환자 ID 저장
  const [showNotFoundModal, setShowNotFoundModal] = useState(false); // 초진 환자 모달 노출 여부
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  const navigate = useNavigate();

  // 휴대폰 번호 입력 필드 onBlur: 11자리 숫자 입력 시 010-1234-5678 형식으로 포맷팅
  const handlePhoneBlur = () => {
    const value = phone.trim();
    if (value.length === 11 && /^\d+$/.test(value)) {
      const formatted = `${value.slice(0, 3)}-${value.slice(
        3,
        7
      )}-${value.slice(7, 11)}`;
      setPhone(formatted);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) {
      alert("개인정보 수집 및 이용에 동의 후 사전진료를 시작할 수 있습니다.");
      return;
    }
    // 이름과 전화번호가 입력되었는지, 전화번호가 11자리 숫자인지 검증
    const numericPhone = phone.replace(/[^0-9]/g, "");
    if (
      name.trim() === "" ||
      phone.trim() === "" ||
      numericPhone.length !== 11
    ) {
      setShowEmptyModal(true);
      return;
    }
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();
      // 1) 기존 환자 존재 여부 확인 (재진 환자인지 확인)
      const checkData = { name, phone };
      const checkResponse = await axios.post(
        `http://3.39.70.32/api/get_existing_patient/`,
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
        await axios.patch(`http://3.39.70.32/api/update_patient/`, updateData, {
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
  // 입력란(성명, 휴대폰 번호) 중 하나라도 비어있는지 확인
  const isAnyFieldEmpty = name.trim() === "" || phone.trim() === "";
  return (
    <div className="revisit-info-container">
      <NavigationButtons />
      {/* 좌측 이미지 컨테이너 */}
      <div className="revisit-info-image-container">
        <img src="images/tooth_image.png" alt="치아 이미지" />{" "}
      </div>
      {/* 우측 재진 정보 입력란 */}
      <div className="revisit-info-content">
        <h1>진료를 기다리고 계신가요?</h1>
        <p>대기시간 동안 챗봇에게 간단한 사전진료를 받아보세요!</p>
        <form onSubmit={handleSubmit} className="revisit-info-form">
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>휴대폰 번호</label>
            <input
              type="text"
              placeholder="예) 01012345678"
              value={phone}
              onChange={(e) => {
                // 숫자만 추출
                let value = e.target.value.replace(/[^0-9]/g, "");
                // 최대 11자리까지만 허용
                if (value.length > 11) {
                  value = value.slice(0, 11);
                }
                setPhone(value);
              }}
              onBlur={handlePhoneBlur}
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
            사전진료(재진) 시작
          </button>
        </form>
        {message && <p>{message}</p>}
        {/* 초진 환자 안내 모달 */}
        {showNotFoundModal && (
          <div className="modal">
            <div className="modal-content">
              <p>
                입력하신 정보와 일치하는 기록이 없습니다.
                <br />
                초진 페이지로 이동하시겠습니까?
              </p>
              <div className="modal-buttons">
                <button onClick={handleModalConfirm}>확인</button>
                <button onClick={handleModalCancel}>취소</button>
              </div>
            </div>
          </div>
        )}
        {/* 빈 입력 또는 전화번호 형식 오류 시 표시되는 모달 */}
        {showEmptyModal && (
          <div className="modal">
            <div className="modal-content">
              <p>
                정보 입력란이 비어 있거나, 형식이 올바르지 않습니다.
                <br />
                입력 내용을 다시 확인해 주세요.
              </p>
              <div className="modal-buttons">
                <button onClick={() => setShowEmptyModal(false)}>확인</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default RevisitFormPage;
