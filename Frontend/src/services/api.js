// src/services/api.js
// vas

export async function fetchVASResponse(userMessage) {
  const apiUrl = `http://43.203.111.207/api/vas/${encodeURIComponent(
    userMessage
  )}`;
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      return data.vas;
    } else {
      return "API 요청에 실패했습니다.";
    }
  } catch (error) {
    return `오류 발생: ${error.message}`;
  }
}
// presum
export async function fetchPresumResponse(userMessage) {
  const apiUrl = `http://43.203.111.207/api/presum/${encodeURIComponent(
    userMessage
  )}`;
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return "API 요청에 실패했습니다.";
    }
  } catch (error) {
    return `오류 발생: ${error.message}`;
  }
}
// LLM 답변을 answer과 patid 객체로 받아 POST로 전송
export async function fetchLLMResponse({ answer, patid }) {
  const apiUrl = `http://43.203.111.207/api/chat/`;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer, patid }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.answer;
    } else {
      return "API 요청에 실패했습니다.";
    }
  } catch (error) {
    return `오류 발생: ${error.message}`;
  }
}
