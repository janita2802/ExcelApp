import axios from "axios";
import Constants from 'expo-constants';

/**
 * Dynamically get the backend URL based on the frontend's current hostname.
 */
const getBackendUrl = () => {
  const host = "localhost"; // Gets frontend's IP/domain automatically
  return `http://${host}:5000/api`; // Assumes backend is running on port 5000
};

const api = axios.create({
  baseURL: Constants.expoConfig.extra.API_BASE_URL || getBackendUrl(), // Fallback
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;