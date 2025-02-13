// src/hooks/useSTT.js
import { useState } from "react";
import axios from "axios";

export function useSTT() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");

  const sendAudioToOpenAI = async (recordedBlob, handleUserAnswer) => {
    if (!recordedBlob) {
      alert("녹음된 음성이 없습니다.");
      return;
    }

    setIsTranscribing(true);
    setTranscription("");

    try {
      const formData = new FormData();
      formData.append("file", recordedBlob, "audio.webm");
      formData.append("model", "whisper-1");
      formData.append("language", "ko");

      const openAIResponse = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const transcript = openAIResponse.data.text;
      setTranscription(transcript);
      await handleUserAnswer(transcript);
    } catch (error) {
      console.error("STT API 오류:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return { isTranscribing, transcription, sendAudioToOpenAI };
}
