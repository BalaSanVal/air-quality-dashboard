import { useEffect, useMemo, useState } from "react";
import { getSimatHistory } from "../api/measurements";
import {
  Bar,
  Line,
} from "react-chartjs-2";
import {
  BarChart3,
  CalendarDays,
  Filter,
  MapPin,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const METRIC_OPTIONS = [
  {
    key: "pm1_0",
    label: "Material particulado PM₁",
    unit: "µg/m³",
  },
  {
    key: "pm2_5",
    label: "Material particulado PM₂.₅",
    unit: "µg/m³",
  },
  {
    key: "pm4_0",
    label: "Material particulado PM₄",
    unit: "µg/m³",
  },
  {
    key: "pm10",
    label: "Material particulado PM₁₀",
    unit: "µg/m³",
  },
  {
    key: "tamano_promedio_particula",
    label: "Tamaño promedio de partícula",
    unit: "µm",
  },
  {
    key: "co2",
    label: "Dióxido de carbono CO₂",
    unit: "ppm",
  },
  {
    key: "tvoc",
    label: "Compuestos orgánicos volátiles totales TVOC",
    unit: "ppb",
  },
  {
    key: "eco2",
    label: "Dióxido de carbono equivalente eCO₂",
    unit: "ppm",
  },
  {
    key: "scd41_temp",
    label: "Temperatura SCD41",
    unit: "°C",
  },
  {
    key: "scd41_humedad",
    label: "Humedad relativa SCD41",
    unit: "%",
  },
  {
    key: "bme688_temp",
    label: "Temperatura BME688",
    unit: "°C",
  },
  {
    key: "bme688_humedad",
    label: "Humedad relativa BME688",
    unit: "%",
  },
  {
    key: "presion_atmosferica",
    label: "Presión atmosférica",
    unit: "hPa",
  },
  {
    key: "resistencia_gas",
    label: "Resistencia de gas",
    unit: "kΩ",
  },
  {
    key: "aqi",
    label: "Índice de calidad de aire",
    unit: "índice",
  },
];

const PERIOD_OPTIONS = [
  {
    key: "24h",
    label: "24h",
    days: 1,
  },
  {
    key: "7d",
    label: "7d",
    days: 7,
  },
  {
    key: "30d",
    label: "30d",
    days: 30,
  },
];

function ChartsAnalysis({ measurements }) {
  const [selectedMetric, setSelectedMetric] = useState("pm2_5");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [simatHistory, setSimatHistory] = useState([]);
  const [simatHistoryLoading, setSimatHistoryLoading] = useState(true);
  const [simatHistoryError, setSimatHistoryError] = useState("");
  const [selectedSimatMetric, setSelectedSimatMetric] = useState("pm2_5");

  const metricConfig = METRIC_OPTIONS.find(
    (metric) => metric.key === selectedMetric
  );

  const filteredMeasurements = useMemo(() => {
    return filterMeasurementsByControls(
      measurements,
      selectedMetric,
      selectedLocation,
      selectedPeriod
    );
  }, [measurements, selectedMetric, selectedLocation, selectedPeriod]);

  const lineChartData = useMemo(() => {
    return buildLineChartData(filteredMeasurements, selectedMetric);
  }, [filteredMeasurements, selectedMetric]);

  const barChartData = useMemo(() => {
    return buildComparisonChartData(filteredMeasurements, selectedMetric);
  }, [filteredMeasurements, selectedMetric]);

  const statistics = useMemo(() => {
    return calculateStatistics(filteredMeasurements, selectedMetric);
  }, [filteredMeasurements, selectedMetric]);

  const simatMonthlyData = useMemo(() => {
    return buildSimatMonthlyChartData(simatHistory, selectedSimatMetric);
  }, [simatHistory, selectedSimatMetric]);

  const nodeMonthlyData = useMemo(() => {
    return buildNodeMonthlyChartData(measurements, selectedSimatMetric);
  }, [measurements, selectedSimatMetric]);

  const simatMetricLabel =
    selectedSimatMetric === "pm2_5" ? "PM₂.₅" : "PM₁₀";

  const [isMobileChart, setIsMobileChart] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobileChart(window.innerWidth <= 640);
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    async function loadSimatHistory() {
      try {
        setSimatHistoryLoading(true);

        const data = await getSimatHistory("GAM", 200);

        setSimatHistory(data?.items ?? []);
        setSimatHistoryError("");
      } catch (error) {
        console.error("No se pudo cargar el historial SIMAT:", error);
        setSimatHistoryError("No se pudo cargar el historial de SIMAT.");
      } finally {
        setSimatHistoryLoading(false);
      }
    }

    loadSimatHistory();
  }, []);

  return (
  <section className="charts-section charts-section-panel" id="graficos">
    <div className="charts-section-panel__header">
      <div className="charts-section-panel__intro">
        <span className="charts-section-panel__eyebrow">
          Análisis temporal de mediciones
        </span>

        <h2>Gráficos y análisis</h2>

        <p>
          Consulta la evolución de las variables ambientales registradas por los
          nodos de monitoreo, compara el comportamiento entre ambientes
          interiores y exteriores, y revisa estadísticas descriptivas del
          periodo seleccionado.
        </p>

        <div className="charts-section-panel__chips">
          <span>Tendencia temporal</span>
          <span>Comparativa interior/exterior</span>
          <span>Estadísticas del periodo</span>
        </div>
      </div>

      <div className="charts-section-panel__summary">
        <article>
          <strong>{metricConfig?.label}</strong>
          <span>Métrica seleccionada</span>
        </article>

        <article>
          <strong>{selectedPeriod}</strong>
          <span>Periodo de análisis</span>
        </article>

        <article>
          <strong>{filteredMeasurements.length}</strong>
          <span>Registros filtrados</span>
        </article>
      </div>
    </div>

    <div className="filters-card">
        <div className="filters-card__title">
          <Filter size={18} />
          <h3>Filtros</h3>
        </div>

        <div className="filters-grid">
          <label className="filter-control">
            <span>
              <BarChart3 size={15} />
              Métrica
            </span>
            <select
              value={selectedMetric}
              onChange={(event) => setSelectedMetric(event.target.value)}
            >
              {METRIC_OPTIONS.map((metric) => (
                <option key={metric.key} value={metric.key}>
                  {metric.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>
              <MapPin size={15} />
              Ubicación
            </span>
            <select
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
            >
              <option value="all">Todos</option>
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
            </select>
          </label>

          <div className="period-control">
            <span>
              <CalendarDays size={15} />
              Periodo
            </span>

            <div className="period-buttons">
              {PERIOD_OPTIONS.map((period) => (
                <button
                  key={period.key}
                  type="button"
                  className={
                    selectedPeriod === period.key
                      ? "period-button period-button--active"
                      : "period-button"
                  }
                  onClick={() => setSelectedPeriod(period.key)}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <article className="chart-card">
          <h3>
            Tendencia - {metricConfig?.label} ({metricConfig?.unit})
          </h3>

          <div className="chart-card__canvas">
            {filteredMeasurements.length > 0 ? (
              <Line
                data={lineChartData}
                options={getLineChartOptions(
                  metricConfig,
                  selectedPeriod,
                  isMobileChart
                )}
              />
            ) : (
              <EmptyChartMessage />
            )}
          </div>
        </article>

        <article className="chart-card">
          <h3>
            Comparativa - {metricConfig?.label} ({metricConfig?.unit})
          </h3>

          <div className="chart-card__canvas">
            {filteredMeasurements.length > 0 ? (
              <Bar
                data={barChartData}
                options={getBarChartOptions(
                  metricConfig,
                  selectedPeriod,
                  isMobileChart
                )}
              />
            ) : (
              <EmptyChartMessage />
            )}
          </div>
        </article>
      </div>

      <article className="statistics-card">
        <h3>Estadísticas del periodo</h3>

        <div className="statistics-grid">
          <StatisticBox
            label="Promedio interior"
            value={statistics.interiorAverage}
            unit={metricConfig?.unit}
          />

          <StatisticBox
            label="Promedio exterior"
            value={statistics.exteriorAverage}
            unit={metricConfig?.unit}
          />

          <StatisticBox
            label="Mínimo"
            value={statistics.minimum}
            unit={metricConfig?.unit}
          />

          <StatisticBox
            label="Máximo"
            value={statistics.maximum}
            unit={metricConfig?.unit}
          />
        </div>
      </article>

          
    <section className="chart-card simat-analysis-card">
      <div className="chart-card__header simat-analysis-card__header">
        <div>
          <span className="chart-card__eyebrow">Comparación oficial</span>
          <h3>Último mes guardado: SIMAT GAM vs nodos UPIITA</h3>
          <p>
            Comparación contextual del último mes almacenado. Cada gráfica conserva
            sus fechas reales de registro, sin promedios ni aproximaciones
            temporales.
          </p>
        </div>

        <label className="filter-control simat-metric-control">
          <span>
            <BarChart3 size={15} />
            Variable a comparar
          </span>

          <select
            value={selectedSimatMetric}
            onChange={(event) => setSelectedSimatMetric(event.target.value)}
          >
            <option value="pm2_5">PM₂.₅</option>
            <option value="pm10">PM₁₀</option>
          </select>
        </label>
      </div>

      {simatHistoryLoading ? (
        <EmptyChartMessage message="Cargando historial SIMAT..." />
      ) : simatHistoryError ? (
        <EmptyChartMessage message={simatHistoryError} />
      ) : simatHistory.length > 0 ? (
        <div className="simat-monthly-grid">
          <article className="simat-monthly-chart-card">
            <h4>SIMAT GAM - {simatMetricLabel}</h4>

            <div className="chart-card__canvas simat-comparison-chart">
              <Line
                key={`simat-${selectedSimatMetric}`}
                data={simatMonthlyData}
                options={getSimatComparisonChartOptions(
                  isMobileChart,
                  simatMetricLabel
                )}
              />
            </div>
          </article>

          <article className="simat-monthly-chart-card">
            <h4>Nodos UPIITA - {simatMetricLabel}</h4>

            <div className="chart-card__canvas simat-comparison-chart">
              <Line
                key={`nodes-${selectedSimatMetric}`}
                data={nodeMonthlyData}
                options={getSimatComparisonChartOptions(
                  isMobileChart,
                  simatMetricLabel
                )}
              />
            </div>
          </article>
        </div>
      ) : (
        <EmptyChartMessage message="No hay historial SIMAT disponible." />
      )}
    </section>
    </section>
  );
}

function EmptyChartMessage({
  message = "No hay datos disponibles para los filtros seleccionados.",
}) {
  return <div className="empty-chart-message">{message}</div>;
}

function StatisticBox({ label, value, unit }) {
  return (
    <div className="statistic-box">
      <span>{label}</span>
      <strong>
        {value ?? "—"}
        {value !== null && value !== undefined && unit ? (
          <small> {unit}</small>
        ) : null}
      </strong>
    </div>
  );
}

function filterMeasurementsByControls(
  measurements,
  selectedMetric,
  selectedLocation,
  selectedPeriod
) {
  const period = PERIOD_OPTIONS.find((item) => item.key === selectedPeriod);
  const days = period?.days ?? 1;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);

  return measurements
    .filter((measurement) => {
      const metricValue = measurement[selectedMetric];

      if (metricValue === null || metricValue === undefined) {
        return false;
      }

      if (
        selectedLocation !== "all" &&
        String(measurement.tipo_nodo).toLowerCase() !== selectedLocation
      ) {
        return false;
      }

      const measurementDate = parseMeasurementDate(measurement.fecha_hora);

      if (!measurementDate) {
        return true;
      }

      return measurementDate >= startDate;
    })
    .sort((a, b) => {
      const dateA = parseMeasurementDate(a.fecha_hora)?.getTime() ?? 0;
      const dateB = parseMeasurementDate(b.fecha_hora)?.getTime() ?? 0;
      return dateA - dateB;
    });
}

function buildLineChartData(measurements, selectedMetric) {
  const interiorData = measurements.filter(
    (measurement) => String(measurement.tipo_nodo).toLowerCase() === "interior"
  );

  const exteriorData = measurements.filter(
    (measurement) => String(measurement.tipo_nodo).toLowerCase() === "exterior"
  );

  const labels = buildLabels(measurements);

  return {
    labels,
    datasets: [
      {
        label: "Interior",
        data: labels.map((label) =>
          getAverageForLabel(interiorData, selectedMetric, label)
        ),
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.35,
        spanGaps: true,
      },
      {
        label: "Exterior",
        data: labels.map((label) =>
          getAverageForLabel(exteriorData, selectedMetric, label)
        ),
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
        tension: 0.35,
        spanGaps: true,
      },
    ],
  };
}

function buildComparisonChartData(measurements, selectedMetric) {
  const labels = buildLabels(measurements);

  return {
    labels,
    datasets: [
      {
        label: "Interior",
        data: labels.map((label) =>
          getAverageForLabel(
            measurements.filter(
              (measurement) =>
                String(measurement.tipo_nodo).toLowerCase() === "interior"
            ),
            selectedMetric,
            label
          )
        ),
        backgroundColor: "#6366f1",
      },
      {
        label: "Exterior",
        data: labels.map((label) =>
          getAverageForLabel(
            measurements.filter(
              (measurement) =>
                String(measurement.tipo_nodo).toLowerCase() === "exterior"
            ),
            selectedMetric,
            label
          )
        ),
        backgroundColor: "#f59e0b",
      },
    ],
  };
}

function buildLabels(measurements) {
  const labels = measurements.map((measurement) => measurement.fecha_hora);

  return [...new Set(labels)];
}

function getAverageForLabel(measurements, selectedMetric, label) {
  const values = measurements
    .filter((measurement) => measurement.fecha_hora === label)
    .map((measurement) => Number(measurement[selectedMetric]))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  return Number(average.toFixed(2));
}

function calculateStatistics(measurements, selectedMetric) {
  const interiorValues = getMetricValuesByType(
    measurements,
    selectedMetric,
    "interior"
  );

  const exteriorValues = getMetricValuesByType(
    measurements,
    selectedMetric,
    "exterior"
  );

  const allValues = [...interiorValues, ...exteriorValues];

  return {
    interiorAverage: calculateAverage(interiorValues),
    exteriorAverage: calculateAverage(exteriorValues),
    minimum: allValues.length > 0 ? Number(Math.min(...allValues).toFixed(2)) : null,
    maximum: allValues.length > 0 ? Number(Math.max(...allValues).toFixed(2)) : null,
  };
}

function getMetricValuesByType(measurements, selectedMetric, type) {
  return measurements
    .filter((measurement) => String(measurement.tipo_nodo).toLowerCase() === type)
    .map((measurement) => Number(measurement[selectedMetric]))
    .filter((value) => Number.isFinite(value));
}

function calculateAverage(values) {
  if (values.length === 0) return null;

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  return Number(average.toFixed(2));
}

function parseMeasurementDate(value) {
  if (!value) return null;

  const normalizedValue = String(value).replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatChartTickLabel(value, selectedPeriod) {
  const date = parseMeasurementDate(value);

  if (!date) return "Sin fecha";

  if (selectedPeriod === "24h") {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatChartTooltipTitle(value) {
  const date = parseMeasurementDate(value);

  if (!date) return value ?? "Sin fecha";

  return `${new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)} h`;
}

function getLineChartOptions(metricConfig, selectedPeriod, isMobileChart) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 200,
    layout: {
      padding: {
        top: 8,
        right: isMobileChart ? 4 : 12,
        bottom: isMobileChart ? 2 : 8,
        left: isMobileChart ? 2 : 8,
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: isMobileChart ? 10 : 14,
          font: {
            size: isMobileChart ? 10 : 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const label = tooltipItems[0]?.label;
            return formatChartTooltipTitle(label);
          },
          label: (context) =>
            `${context.dataset.label}: ${context.raw ?? "—"} ${
              metricConfig?.unit ?? ""
            }`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: isMobileChart
            ? selectedPeriod === "24h"
              ? 4
              : 5
            : selectedPeriod === "24h"
              ? 8
              : 10,
          maxRotation: isMobileChart ? 35 : selectedPeriod === "24h" ? 45 : 0,
          minRotation: isMobileChart ? 35 : selectedPeriod === "24h" ? 45 : 0,
          font: {
            size: isMobileChart ? 9 : 11,
          },
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return formatChartTickLabel(label, selectedPeriod);
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: isMobileChart ? 5 : 6,
          font: {
            size: isMobileChart ? 9 : 11,
          },
        },
        title: {
          display: true,
          text: metricConfig?.unit ?? "",
          font: {
            size: isMobileChart ? 10 : 12,
          },
        },
      },
    },
  };
}

function getBarChartOptions(metricConfig, selectedPeriod, isMobileChart) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 200,
    layout: {
      padding: {
        top: 8,
        right: isMobileChart ? 4 : 12,
        bottom: isMobileChart ? 2 : 8,
        left: isMobileChart ? 2 : 8,
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: isMobileChart ? 10 : 14,
          font: {
            size: isMobileChart ? 10 : 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const label = tooltipItems[0]?.label;
            return formatChartTooltipTitle(label);
          },
          label: (context) =>
            `${context.dataset.label}: ${context.raw ?? "—"} ${
              metricConfig?.unit ?? ""
            }`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: isMobileChart
            ? selectedPeriod === "24h"
              ? 4
              : 5
            : selectedPeriod === "24h"
              ? 8
              : 10,
          maxRotation: isMobileChart ? 35 : selectedPeriod === "24h" ? 45 : 0,
          minRotation: isMobileChart ? 35 : selectedPeriod === "24h" ? 45 : 0,
          font: {
            size: isMobileChart ? 9 : 11,
          },
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return formatChartTickLabel(label, selectedPeriod);
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: isMobileChart ? 5 : 6,
          font: {
            size: isMobileChart ? 9 : 11,
          },
        },
        title: {
          display: true,
          text: metricConfig?.unit ?? "",
          font: {
            size: isMobileChart ? 10 : 12,
          },
        },
      },
    },
  };
}

function buildSimatMonthlyChartData(simatHistory, metricKey) {
  const monthlyRecords = getLastStoredMonthRecords(simatHistory, "fecha_hora");

  return {
    labels: monthlyRecords.map((item) => item.fecha_hora),
    datasets: [
      {
        label: `SIMAT GAM ${metricKey === "pm2_5" ? "PM₂.₅" : "PM₁₀"}`,
        data: monthlyRecords.map((item) => toChartNumber(item[metricKey])),
        borderColor: "#0284c7",
        backgroundColor: "#0284c7",
        tension: 0.35,
        spanGaps: true,
      },
    ],
  };
}

function buildNodeMonthlyChartData(measurements, metricKey) {
  const monthlyRecords = getLastStoredMonthRecords(measurements, "fecha_hora");

  const interiorRecords = monthlyRecords.filter(
    (item) => String(item.tipo_nodo).toLowerCase() === "interior"
  );

  const exteriorRecords = monthlyRecords.filter(
    (item) => String(item.tipo_nodo).toLowerCase() === "exterior"
  );

  const labels = monthlyRecords.map((item) => item.fecha_hora);
  const uniqueLabels = [...new Set(labels)];

  return {
    labels: uniqueLabels,
    datasets: [
      {
        label: `Nodos interiores ${metricKey === "pm2_5" ? "PM₂.₅" : "PM₁₀"}`,
        data: uniqueLabels.map((label) =>
          getAverageForLabel(interiorRecords, metricKey, label)
        ),
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.35,
        spanGaps: true,
      },
      {
        label: `Nodo exterior ${metricKey === "pm2_5" ? "PM₂.₅" : "PM₁₀"}`,
        data: uniqueLabels.map((label) =>
          getAverageForLabel(exteriorRecords, metricKey, label)
        ),
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
        tension: 0.35,
        spanGaps: true,
      },
    ],
  };
}

function getLastStoredMonthRecords(records, dateKey) {
  const sortedRecords = records
    .filter((item) => parseMeasurementDate(item[dateKey]))
    .sort((a, b) => {
      const dateA = parseMeasurementDate(a[dateKey]).getTime();
      const dateB = parseMeasurementDate(b[dateKey]).getTime();
      return dateA - dateB;
    });

  if (sortedRecords.length === 0) {
    return [];
  }

  const latestDate = parseMeasurementDate(
    sortedRecords[sortedRecords.length - 1][dateKey]
  );

  const startDate = new Date(latestDate);
  startDate.setDate(latestDate.getDate() - 30);

  return sortedRecords.filter((item) => {
    const itemDate = parseMeasurementDate(item[dateKey]);
    return itemDate >= startDate && itemDate <= latestDate;
  });
}

function toChartNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getSimatComparisonChartOptions(isMobileChart, metricLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 200,
    interaction: {
      mode: "nearest",
      intersect: true,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: isMobileChart ? 10 : 14,
          font: {
            size: isMobileChart ? 10 : 12,
          },
        },
      },
      tooltip: {
        intersect: true,
        mode: "nearest",
        callbacks: {
          title: (tooltipItems) => {
            const label = tooltipItems[0]?.label;
            return formatChartTooltipTitle(label);
          },
          label: (context) =>
            `${context.dataset.label}: ${context.raw ?? "—"} µg/m³`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: isMobileChart ? 5 : 10,
          maxRotation: isMobileChart ? 35 : 45,
          minRotation: isMobileChart ? 35 : 45,
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return formatChartTickLabel(label, "30d");
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: `${metricLabel} (µg/m³)`,
        },
      },
    },
  };
}

export default ChartsAnalysis;