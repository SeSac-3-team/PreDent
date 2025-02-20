// src/pages/InfoFormPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./InfoFormPage.css";
import { getCsrfToken } from "../Utils/getCsrfToken";
import NavigationButtons from "../components/NavigationButtons";

function InfoFormPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [address, setAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  const navigate = useNavigate();

  // -------------------------
  // 생년월일 입력 로직
  // -------------------------

  // 생년월일 onChange: 8자리까지만 숫자만 입력
  const handleBirthChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 추출
    if (value.length > 8) {
      value = value.slice(0, 8); // 최대 8자리 제한
    }
    setBirth(value);
  };

  // 생년월일 onBlur: 정확히 8자리이면 YYYY-MM-DD로 포맷
  const handleBirthBlur = () => {
    const value = birth.trim();
    if (value.length === 8 && /^\d+$/.test(value)) {
      const formatted = `${value.slice(0, 4)}-${value.slice(
        4,
        6
      )}-${value.slice(6, 8)}`;
      setBirth(formatted);
    }
  };

  // -------------------------
  // 휴대폰 번호 입력 로직
  // -------------------------

  // 휴대폰 번호 onChange: 11자리까지만 숫자만 입력
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 추출
    if (value.length > 11) {
      value = value.slice(0, 11); // 최대 11자리 제한
    }
    setPhone(value);
  };

  // 휴대폰 번호 onBlur: 11자리면 010-1234-5678 형식으로 포맷
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

  // -------------------------
  // 사용자 입력 검증 로직
  // -------------------------

  // 필수 입력란이 비어있는지 확인 (성명, 성별, 휴대폰 번호, 생년월일, 주소, 내원 목적)
  const isFormValid = () => {
    if (
      name.trim() === "" ||
      gender.trim() === "" ||
      phone.trim() === "" ||
      birth.trim() === "" ||
      address.trim() === "" ||
      purpose.trim() === ""
    ) {
      return false;
    }

    // 전화번호가 11자리인지 확인
    const numericPhone = phone.replace(/[^0-9]/g, "");
    if (numericPhone.length < 11) {
      return false;
    }

    // 생년월일이 8자리인지 확인
    const numericBirth = birth.replace(/[^0-9]/g, "");
    if (numericBirth.length < 8) {
      return false;
    }

    // 개인정보 동의 여부
    if (!agree) {
      return false;
    }

    return true;
  };

  // -------------------------
  // 사용자 입력 제출 로직
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 입력란 또는 전화번호/생년월일 불완전 입력 시 모달 띄우기
    if (!isFormValid()) {
      setShowEmptyModal(true);
      return;
    }

    // 사용자가 입력한 모든 데이터를 객체로 생성
    const data = {
      name,
      gender,
      phone,
      birth,
      address,
      purpose,
      agree: agree ? 1 : 0,
    };

    try {
      // CSRF 토큰 가져오기 (필요한 경우)
      const csrfToken = await getCsrfToken();

      // 1) 이름과 전화번호를 기준으로 기존 환자 조회 (재진환자 여부 확인)
      const checkResponse = await axios.post(
        `http://43.203.111.207/api/get_existing_patient/`,
        { name, phone },
        {
          headers: { "X-CSRFToken": csrfToken },
          withCredentials: true,
        }
      );

      if (checkResponse.data.found) {
        // 기존 환자(PID 존재): 이름, 전화번호를 제외한 나머지 정보를 업데이트
        const updateData = {
          patient_id: checkResponse.data.patient_id,
          gender,
          birth,
          address,
          purpose,
          agree: agree ? 1 : 0,
        };

        await axios.patch(
          `http://43.203.111.207/api/update_patient/`,
          updateData,
          {
            headers: { "X-CSRFToken": csrfToken },
            withCredentials: true,
          }
        );

        setMessage("기존 환자 정보가 업데이트되었습니다.");
        // 기존 환자의 PID와 내원 목적을 ChatPage로 전달
        navigate("/chat", {
          state: { purpose, patid: checkResponse.data.patient_id },
        });
      } else {
        // 신규 환자: 입력한 정보로 DB에 저장
        const saveResponse = await axios.post(
          `http://43.203.111.207/api/save_patient/`,
          data,
          {
            headers: { "X-CSRFToken": csrfToken },
            withCredentials: true,
          }
        );
        // 신규 생성된 patient_id가 응답에 포함되어 있다고 가정합니다.
        const newPatientId = saveResponse.data.patient_id;
        setMessage("신규 환자 정보가 저장되었습니다.");
        // 신규 환자의 PID와 내원 목적을 ChatPage로 전달
        navigate("/chat", { state: { purpose, patid: newPatientId } });
      }
    } catch (error) {
      console.error("데이터 저장 실패:", error);
    }
  };

  return (
    <div className="info-page-container">
      <NavigationButtons />
      {/* [추가] 이미지 왼쪽에 배치 */}
      <div className="info-image-container">
        <img src="images/tooth_image.png" alt="치아 이미지" />
      </div>

      {/* 정보 입력란(오른쪽) */}
      <div className="info-content">
        <h1>진료를 기다리고 계신가요?</h1>
        <p>대기시간 동안 챗봇에게 간단한 사전진료를 받아보세요!</p>

        <form onSubmit={handleSubmit} className="info-form">
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
            <label>성별</label>
            <div style={{ display: "flex", gap: "2rem" }}>
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
              placeholder="예) 01012345678"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
            />
          </div>

          <div className="form-group">
            <label>생년월일</label>
            <input
              type="text"
              placeholder="예) 19901224"
              value={birth}
              onChange={handleBirthChange}
              onBlur={handleBirthBlur}
            />
          </div>

          <div className="form-group">
            <label>주소</label>
            <input
              type="address"
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

          <button type="submit" className="start-button">
            사전진료 시작
          </button>
        </form>

        {message && <p>{message}</p>}

        {/* 필수 정보 미입력 or 전화번호/생년월일 불완전 시 표시되는 모달 */}
        {showEmptyModal && (
          <div className="modal">
            <div className="modal-content">
              <p>사용자 정보를 확인해주세요</p>
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

export default InfoFormPage;
