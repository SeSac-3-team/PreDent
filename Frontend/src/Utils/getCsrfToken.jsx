import axios from "axios";

export async function getCsrfToken() {
  try {
    const response = await axios.get(`http://43.203.111.207/api/csrf/`, {
      withCredentials: true, // 쿠키 포함하여 요청
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error("CSRF 토큰 가져오기 실패:", error);
    return null;
  }
}
