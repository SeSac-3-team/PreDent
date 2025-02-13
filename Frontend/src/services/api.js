// src/services/api.js
export async function fetchVASResponse(userMessage) {
  const apiUrl = `http://127.0.0.1:8000/vas/${encodeURIComponent(userMessage)}`;
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

export async function fetchPresumResponse(userMessage) {
  const apiUrl = `http://127.0.0.1:8000/presum/${encodeURIComponent(
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

export async function fetchLLMResponse(userMessage) {
  const apiUrl = `http://127.0.0.1:8000/chat/${encodeURIComponent(
    userMessage
  )}`;
  try {
    const response = await fetch(apiUrl);
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
