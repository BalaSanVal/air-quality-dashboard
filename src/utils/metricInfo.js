export const metricInfo = {
  pm1_0: {
    title: "Material particulado (PM₁)",
    shortName: "PM₁",
    description:
      "El PM₁ corresponde a partículas suspendidas en el aire con diámetro menor o igual a 1 micrómetro. Se mide para observar partículas muy finas que pueden permanecer suspendidas y penetrar profundamente en el sistema respiratorio.",
  },
  pm2_5: {
    title: "Material particulado (PM₂.₅)",
    shortName: "PM₂.₅",
    description:
      "El PM₂.₅ corresponde a partículas con diámetro menor o igual a 2.5 micrómetros. Es una variable importante para evaluar calidad del aire porque puede ingresar profundamente en los pulmones. Esta variable sí puede relacionarse con la escala Aire y Salud.",
  },
  pm4_0: {
    title: "Material particulado (PM₄)",
    shortName: "PM₄",
    description:
      "El PM₄ representa partículas con diámetro menor o igual a 4 micrómetros. Se utiliza como medición complementaria del sensor SPS30 para caracterizar la distribución de partículas suspendidas en el ambiente.",
  },
  pm10: {
    title: "Material particulado (PM₁₀)",
    shortName: "PM₁₀",
    description:
      "El PM10 corresponde a partículas con diámetro menor o igual a 10 micrómetros. Se mide para evaluar polvo, partículas suspendidas y contaminación atmosférica. Esta variable sí puede relacionarse con la escala Aire y Salud.",
  },
  particleSize: {
    title: "Tamaño promedio de partícula",
    shortName: "Tamaño partícula",
    description:
      "Indica el tamaño promedio estimado de las partículas detectadas por el sensor. Ayuda a interpretar si predominan partículas finas o partículas de mayor tamaño en la muestra de aire.",
  },
  tvoc: {
    title: "Compuestos orgánicos volátiles totales (TVOC)",
    shortName: "TVOC",
    description:
      "Los TVOC agrupan diversos compuestos orgánicos volátiles presentes en el aire. Se miden como referencia para detectar posibles emisiones de pinturas, solventes, productos de limpieza, materiales o actividades humanas en interiores.",
  },
  co2: {
    title: "Dióxido de carbono (CO₂)",
    shortName: "CO₂",
    description:
      "El CO₂ se mide como indicador de ventilación y ocupación en espacios interiores. Concentraciones elevadas pueden sugerir ventilación insuficiente o acumulación de aire exhalado.",
  },
  eco2: {
    title: "Dióxido de carbono equivalente (eCO₂)",
    shortName: "eCO₂",
    description:
      "El eCO₂ es una estimación calculada por el sensor ENS160 a partir de gases detectados. No sustituye una medición directa de CO2, pero sirve como referencia complementaria de calidad del aire interior.",
  },
  temperature: {
    title: "Temperatura ambiente",
    shortName: "Temperatura",
    description:
      "La temperatura ambiente permite contextualizar las condiciones de operación del nodo y del entorno. También ayuda a interpretar otras variables ambientales medidas por los sensores.",
  },
  humidity: {
    title: "Humedad relativa",
    shortName: "Humedad",
    description:
      "La humedad relativa indica el porcentaje de vapor de agua presente en el aire respecto al máximo posible a esa temperatura. Es útil para evaluar confort ambiental y condiciones que pueden afectar sensores o partículas.",
  },
  pressure: {
    title: "Presión atmosférica",
    shortName: "Presión",
    description:
      "La presión atmosférica representa la presión ejercida por la atmósfera. Se usa como variable ambiental complementaria para caracterizar el entorno de medición.",
  },
  gasResistance: {
    title: "Resistencia de gas",
    shortName: "Gas",
    description:
      "La resistencia de gas proviene del sensor BME688 y cambia según la presencia de ciertos compuestos en el aire. Se utiliza como referencia para observar variaciones relacionadas con gases o compuestos volátiles.",
  },
  aqiEns160: {
    title: "Índice de calidad de aire (AQI)",
    shortName: "AQI",
    description:
      "El AQI del ENS160 es un índice propio del sensor para representar una estimación general de calidad del aire basada en gases detectados. No debe confundirse con el Índice Aire y Salud oficial.",
  },
};