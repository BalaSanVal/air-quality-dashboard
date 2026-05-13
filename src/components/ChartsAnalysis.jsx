import { useMemo, useState } from "react";
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

  return (
    <section className="charts-section" id="graficos">
      <div className="section-header">
        <h2>Gráficos y análisis</h2>
        <p>
          Visualización de tendencias, comparación por ambiente y estadísticas
          descriptivas de las mediciones registradas.
        </p>
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

          {filteredMeasurements.length > 0 ? (
            <Line data={lineChartData} options={getLineChartOptions(metricConfig)} />
          ) : (
            <EmptyChartMessage />
          )}
        </article>

        <article className="chart-card">
          <h3>
            Comparativa - {metricConfig?.label} ({metricConfig?.unit})
          </h3>

          {filteredMeasurements.length > 0 ? (
            <Bar data={barChartData} options={getBarChartOptions(metricConfig)} />
          ) : (
            <EmptyChartMessage />
          )}
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
    </section>
  );
}

function EmptyChartMessage() {
  return (
    <div className="empty-chart-message">
      No hay datos disponibles para los filtros seleccionados.
    </div>
  );
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
  const labels = measurements.map((measurement) =>
    formatChartLabel(measurement.fecha_hora)
  );

  return [...new Set(labels)];
}

function getAverageForLabel(measurements, selectedMetric, label) {
  const values = measurements
    .filter((measurement) => formatChartLabel(measurement.fecha_hora) === label)
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

function formatChartLabel(value) {
  const date = parseMeasurementDate(value);

  if (!date) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getLineChartOptions(metricConfig) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.raw ?? "—"} ${
              metricConfig?.unit ?? ""
            }`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: metricConfig?.unit ?? "",
        },
      },
    },
  };
}

function getBarChartOptions(metricConfig) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.raw ?? "—"} ${
              metricConfig?.unit ?? ""
            }`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: metricConfig?.unit ?? "",
        },
      },
    },
  };
}

export default ChartsAnalysis;