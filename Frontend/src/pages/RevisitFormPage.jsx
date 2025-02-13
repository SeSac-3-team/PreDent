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
  const [PatientId, setPatientId] = useState(null); // 기존 PID 저장

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

      // 1) 기존 환자 존재 여부 확인
      const checkData = {
        name: name,
        phone: phone,
      };
      const checkResponse = await axios.post(
        "http://127.0.0.1:8000/get_existing_patient/",
        checkData,
        {
          headers: {
            "X-CSRFToken": csrfToken, // CSRF 토큰 포함
          },
          withCredentials: true, // 인증된 요청 허용
        }
      );

      if (checkResponse.data.found) {
        const PatientId = checkResponse.data.patient_id; // 기존 patid 조회
        setPatientId(PatientId); // 상태에 저장

        // 기존 환자 조회 후 받은 patient_id가 state에 저장되어 있다고 가정
        const updateData = {
          patient_id: PatientId, // 기존 환자 id
          // 업데이트할 필드만 포함 (예: 내원 목적, 동의 여부)
          purpose: purpose.trim(),
          agree: agree ? 1 : 0,
        };

        // 내원 목적이 공백이 아니라면 업데이트
        if (purpose.trim() !== "") {
          updateData.purpose = purpose.trim();
        }
        // 동의 여부 최근 동의 갱신
        updateData.agree = agree ? 1 : 0;

        await axios.patch("http://127.0.0.1:8000/update_patient/", updateData, {
          headers: {
            "X-CSRFToken": csrfToken, //CSRF 토큰 포함
          },
          withCredentials: true, // 인증된 요청 허용
        });

        setMessage(
          "기존 환자 정보를 확인/갱신했습니다. 챗봇 페이지로 이동합니다."
        );
        navigate("/chat", { state: { patid: PatientId, purpose } });
      } else {
        alert("기존 환자 정보를 찾을 수 없습니다. 다시 입력해주세요.");
      }
    } catch (error) {
      console.error("오류 발생:", error);
      setMessage("데이터 저장 실패(서버 오류)");
    }
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
    </div>
  );
}

export default RevisitFormPage;
