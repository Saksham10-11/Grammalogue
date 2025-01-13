import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL; // Replace with your actual backend URL

/**
 * Save or retrieve user information on the backend.
 * @param {Object} userPayload - The user data to send to the backend.
 * @returns {Promise<Object>} - The backend response containing the user data.
 */
export const saveOrRetrieveUser = async (userPayload) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/save`, userPayload);
    return response.data;
  } catch (error) {
    console.error("Error saving/retrieving user:", error);
    throw error;
  }
};
