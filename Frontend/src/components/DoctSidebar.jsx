// DoctSidebar.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DoctSidebar.css";

export default function DoctSidebar({ onRecordSelect }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/today_medicerts/")
      .then((response) => {
        setRecords(response.data);
      })
      .catch((error) => {
        console.error("Error fetching today's records:", error);
      });
  }, []);

  return (
    <div className="doct-sidebar">
      <h2>사전문진 기록</h2>
      <ul>
        {records.map((record) => (
          <li
            key={record.mecid}
            onClick={() => onRecordSelect(record.mecid)}
            className="sidebar-item"
          >
            {record.patient.patname} ({record.patient.patgend})
          </li>
        ))}
      </ul>
    </div>
  );
}
