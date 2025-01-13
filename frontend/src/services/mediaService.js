import { fastApi } from './api';
const API_FASTAPI_URL = import.meta.env.VITE_API_FASTAPI_URL;


export const sendMediaToServer = async (mediaBlob, questionIndex, currentQuestion, language = "English") => {
  if (!mediaBlob || mediaBlob.size === 0) {
    throw new Error("No recording data available");
  }

  try {
    const formData = new FormData();
    formData.append(
      "file",
      mediaBlob,
      `question_${questionIndex}.mp4`
    );
    formData.append("questionIndex", questionIndex);
    formData.append("language", language);

    const response = await fastApi.post("/process-audio", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.status === "error") {
      throw new Error(response.data.message || "Failed to process audio");
    }

    if (response.data.status === "success" && response.data.text) {
      // Get the questions from localStorage
      const assessmentData = JSON.parse(localStorage.getItem('assessmentSetup'));
      

      // Get feedback analysis with the current question
      const feedbackData = await getFeedbackAnalysis(
        response.data.text,
        currentQuestion,
        language
      );

      return {
        transcribedText: response.data.text,
        feedback: feedbackData
      };
    } else {
      throw new Error(response.data.message || "Failed to transcribe audio");
    }
  } catch (error) {
    console.error("Error in sendMediaToServer:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to process audio");
  }
};

export const getFeedbackAnalysis = async (text, question, language = "English") => {
  try {
    const response = await fastApi.post("/analyze-text", {
      text,
      question,
      language
    });

    if (response.data.status === "error") {
      throw new Error(response.data.message || "Failed to get feedback analysis");
    }

    return response.data;
  } catch (error) {
    console.error("Error in getFeedbackAnalysis:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to get feedback analysis");
  }
};