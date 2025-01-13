import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL_API;

const FASTAPI_URL = import.meta.env.VITE_API_FASTAPI_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fastApi = axios.create({
  baseURL: FASTAPI_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get ideal answer and analysis
export const getIdealAnswer = async (question, answer) => {
  try {
    const response = await fastApi.post('/get-ideal-answer', {
      question,
      answer
    });
    console.log("IDEAL ANSWER::::::::",response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting ideal answer:', error);
    throw error;
  }
};

// Function to process audio file
export const processAudio = async (audioFile) => {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await fastApi.post('/process-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
};

// Function to get complete feedback analysis
export const getCompleteAnalysis = async (text, question = null) => {
  try {
    const response = await fastApi.post('/analyze-text', {
      text,
      question
    });
    
    if (response.data.status === "error") {
      throw new Error(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting analysis:', error);
    throw error;
  }
};

// Function to check answer correctness
export const checkAnswer = async (question, answer) => {
  try {
    const response = await fastApi.post('/check-answer', {
      question,
      answer
    });
    return response.data;
  } catch (error) {
    console.error('Error checking answer:', error);
    throw error;
  }
};

// Function to generate assessment questions
export const generateQuestions = async (setupData) => {
  try {
    const response = await fastApi.post('/generate-questions', setupData);
    return response.data;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};