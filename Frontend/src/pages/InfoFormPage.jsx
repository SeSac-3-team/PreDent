import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./InfoFormPage.css";
import { getCsrfToken } from "../Utils/getCsrfToken";

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

  // 생년월일 입력 필드 onBlur: 8자리 숫자 입력 시 YYYY-MM-DD 형식으로 포맷팅
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

    // 필수 입력란이 비어있는지 확인 (성명, 성별, 휴대폰 번호, 생년월일, 주소, 내원 목적)
    if (
      name.trim() === "" ||
      gender.trim() === "" ||
      phone.trim() === "" ||
      birth.trim() === "" ||
      address.trim() === "" ||
      purpose.trim() === ""
    ) {
      setShowEmptyModal(true);
      return;
    }

    // 사용자가 입력한 모든 데이터를 객체로 생성
    const data = {
      name: name,
      gender: gender,
      phone: phone,
      birth: birth,
      address: address,
      purpose: purpose,
      agree: agree ? 1 : 0,
    };

    try {
      // CSRF 토큰 가져오기 (필요한 경우)
      const csrfToken = await getCsrfToken();

      // 1) 이름과 전화번호를 기준으로 기존 환자 조회 (재진환자 여부 확인)
      const checkResponse = await axios.post(
        "http://127.0.0.1:8000/get_existing_patient/",
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
          gender: gender,
          birth: birth,
          address: address,
          purpose: purpose,
          agree: agree ? 1 : 0,
        };

        await axios.patch("http://127.0.0.1:8000/update_patient/", updateData, {
          headers: { "X-CSRFToken": csrfToken },
          withCredentials: true,
        });

        setMessage("기존 환자 정보가 업데이트되었습니다.");
        // 기존 환자의 PID와 내원 목적을 ChatPage로 전달
        navigate("/chat", {
          state: { purpose, patid: checkResponse.data.patient_id },
        });
      } else {
        // 신규 환자: 입력한 정보로 DB에 저장
        const saveResponse = await axios.post(
          "http://127.0.0.1:8000/save_patient/",
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
            onChange={(e) => {
              // 숫자만 입력되도록 필터링
              const filteredValue = e.target.value.replace(/[^0-9]/g, "");
              setPhone(filteredValue);
            }}
            onBlur={handlePhoneBlur}
          />
        </div>

        <div className="form-group">
          <label>생년월일</label>
          <input
            type="text"
            placeholder="생년월일을 입력하세요"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            onBlur={handleBirthBlur}
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

      {/* 필수 정보 미입력 시 표시되는 모달 */}
      {showEmptyModal && (
        <div className="modal">
          <div className="modal-content">
            <p>환자 정보를 확인해주세요</p>
            <div className="modal-buttons">
              <button onClick={() => setShowEmptyModal(false)}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InfoFormPage;
