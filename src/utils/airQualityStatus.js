export function getCO2Status(value) {
  if (value === null || value === undefined) return "Sin dato";
  if (value <= 800) return "Bueno";
  if (value <= 1200) return "Moderado";
  return "Malo";
}

export function getPM25Status(value) {
  if (value === null || value === undefined) return "Sin dato";
  if (value <= 15) return "Bueno";
  if (value <= 35) return "Moderado";
  return "Malo";
}

export function getPM10Status(value) {
  if (value === null || value === undefined) return "Sin dato";
  if (value <= 45) return "Bueno";
  if (value <= 75) return "Moderado";
  return "Malo";
}

export function getTVOCStatus(value) {
  if (value === null || value === undefined) return "Sin dato";
  if (value <= 220) return "Bueno";
  if (value <= 660) return "Moderado";
  return "Malo";
}

export function getAQIStatus(value) {
  if (value === null || value === undefined) return "Sin dato";
  if (value <= 1) return "Bueno";
  if (value <= 3) return "Moderado";
  return "Malo";
}

export function getGenericStatus(value) {
  if (value === null || value === undefined) return "Sin dato";
  return "Bueno";
}