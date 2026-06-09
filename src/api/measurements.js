import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api-air-quality.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function wakeApi() {
  try {
    await apiClient.get("/health");
    return true;
  } catch {
    return false;
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

export async function getLatestSimatMeasurement(stationCode = "GAM") {
  const response = await apiClient.get("/api/v1/simat/latest", {
    params: {
      station_code: stationCode,
      source: "db",
    },
  });

  return response.data;
}

export async function getAvailableSimatStations() {
  const response = await apiClient.get("/api/v1/simat/stations");
  return response.data;
}

export async function getAllMeasurementsWithRetry({
  attempts = 6,
  delay = 10000,
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