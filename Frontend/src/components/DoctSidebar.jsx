// DoctSidebar.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DoctSidebar.css";

export default function DoctSidebar({ onRecordSelect }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    // 오늘의 문진 기록(사이드바용 최소 정보: mecid, 환자 이름, 성별) 가져오기
    axios
      .get("http://localhost:8000/today_medicerts/")
      .then((response) => {
        setRecords(response.data);
      })
      .catch((error) => {
        console.error("Error fetching today's records:", error);
      });
  }, []);

  return (
    <div
      className="doct-sidebar p-4 border-r border-gray-300"
      style={{ width: "20%", minWidth: "150px" }}
    >
      <h2 className="text-xl font-bold mb-4">사전문진 기록</h2>
      <ul>
        {records.map((record) => (
          <li
            key={record.mecid}
            onClick={() => onRecordSelect(record.mecid)}
            className="cursor-pointer hover:bg-gray-100 p-2"
          >
            {record.patient.patname} ({record.patient.patgend})
          </li>
        ))}
      </ul>
    </div>
  );
}
