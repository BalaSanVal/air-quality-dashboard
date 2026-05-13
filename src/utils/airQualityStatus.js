export const AIR_QUALITY_CATEGORIES = {
  good: {
    label: "Buena",
    risk: "Bajo",
    colorClass: "status--green",
  },
  acceptable: {
    label: "Aceptable",
    risk: "Moderado",
    colorClass: "status--yellow",
  },
  bad: {
    label: "Mala",
    risk: "Alto",
    colorClass: "status--orange",
  },
  veryBad: {
    label: "Muy mala",
    risk: "Muy alto",
    colorClass: "status--red",
  },
  extremelyBad: {
    label: "Extremadamente mala",
    risk: "Extremadamente alto",
    colorClass: "status--purple",
  },
  unavailable: {
    label: "Sin dato",
    risk: "No disponible",
    colorClass: "status--gray",
  },
  informative: {
    label: "Informativo",
    risk: "Referencia",
    colorClass: "status--blue",
  },
};

export function getPM25Status(value) {
  if (value === null || value === undefined) {
    return AIR_QUALITY_CATEGORIES.unavailable;
  }

  if (value <= 15) return AIR_QUALITY_CATEGORIES.good;
  if (value <= 25) return AIR_QUALITY_CATEGORIES.acceptable;
  if (value <= 79) return AIR_QUALITY_CATEGORIES.bad;
  if (value <= 130) return AIR_QUALITY_CATEGORIES.veryBad;
  return AIR_QUALITY_CATEGORIES.extremelyBad;
}

export function getPM10Status(value) {
  if (value === null || value === undefined) {
    return AIR_QUALITY_CATEGORIES.unavailable;
  }

  if (value <= 45) return AIR_QUALITY_CATEGORIES.good;
  if (value <= 50) return AIR_QUALITY_CATEGORIES.acceptable;
  if (value <= 132) return AIR_QUALITY_CATEGORIES.bad;
  if (value <= 213) return AIR_QUALITY_CATEGORIES.veryBad;
  return AIR_QUALITY_CATEGORIES.extremelyBad;
}

export function getInformativeStatus(value) {
  if (value === null || value === undefined) {
    return AIR_QUALITY_CATEGORIES.unavailable;
  }

  return AIR_QUALITY_CATEGORIES.informative;
}