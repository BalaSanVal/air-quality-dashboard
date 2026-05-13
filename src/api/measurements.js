import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api-air-quality.onrender.com";

export async function getAllMeasurements() {
  const response = await axios.get(`${API_BASE_URL}/api/v1/measurements`);
  return response.data;
}

export async function getLatestMeasurement() {
  const response = await axios.get(`${API_BASE_URL}/api/v1/measurements/latest`);
  return response.data;
}