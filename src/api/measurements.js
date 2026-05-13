import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api-air-quality.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function wakeApi() {
  try {
    await apiClient.get("/health");
  } catch (error) {
    console.warn("La API todavía no responde al endpoint /health.", error);
  }
}

export async function getAllMeasurements() {
  const response = await apiClient.get("/api/v1/measurements");
  return response.data;
}

export async function getLatestMeasurement() {
  const response = await apiClient.get("/api/v1/measurements/latest");
  return response.data;
}

export async function getAllMeasurementsWithRetry({
  attempts = 5,
  delay = 12000,
  onRetry,
} = {}) {
  let lastError;

  await wakeApi();

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const data = await getAllMeasurements();
      return data;
    } catch (error) {
      lastError = error;

      if (onRetry) {
        onRetry(attempt, attempts);
      }

      if (attempt < attempts) {
        await wait(delay);
      }
    }
  }

  throw lastError;
}