import React from "react";
import "./VisitCheckPage.css";

const VisitCheckPage = ({ onSelect }) => {
  // onSelect 함수를 통해 클릭된 타입('new' or 'existing')을 부모에게 전달
  // 추후 다른 페이지로 이동할 경우 react-router-dom의 useNavigate 등을 사용할 수 있음
  const handleNewPatient = () => {
    if (onSelect) onSelect("new");
    // 예) navigate('/new-patient-form');
  };

  const handleExistingPatient = () => {
    if (onSelect) onSelect("existing");
    // 예) navigate('/returning-patient-form');
  };

  return (
    <div className="visit-check-container">
      <h1>안녕하세요. 편안한 진료를 위해 안내해 드리겠습니다.</h1>
      <p>처음 방문하셨다면 초진을, 다시 찾아주셨다면 재진을 선택해 주세요.</p>

      <div className="visit-check-button-group">
        <button className="visit-check-button" onClick={handleNewPatient}>
          초진
        </button>
        <button className="visit-check-button" onClick={handleExistingPatient}>
          재진
        </button>
      </div>
    </div>
  );
};

export default VisitCheckPage;
