const API_FASTAPI_URL = import.meta.env.VITE_API_FASTAPI_URL;


export const fetchQuestions = async (setupData) => {
  if (!setupData) {
    throw new Error('Assessment setup data is required');
  }

  const response = await fetch(`${API_FASTAPI_URL}/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(setupData),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }

  const data = await response.json();
  
  const questionsList = Array.isArray(data.questions) ? data.questions : 
                      Array.isArray(data) ? data : [];
  
  if (questionsList.length === 0) {
    throw new Error('No questions received from the server');
  }

  return questionsList;
};