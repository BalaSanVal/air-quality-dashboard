export function formatDateTime(value) {
  if (!value) return "Sin fecha registrada";

  // Acepta formatos como:
  // "2026-05-11 17:03:21"
  // "2026-05-11T17:03:21"
  const normalizedValue = value.replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}