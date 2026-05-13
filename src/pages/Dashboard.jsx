import { useEffect, useState } from "react";
import { Activity, Gauge, Thermometer, Droplets, Wind } from "lucide-react";
import { getLatestMeasurement } from "../api/measurements";
import MetricCard from "../components/MetricCard";
import {
  getAQIStatus,
  getCO2Status,
  getGenericStatus,
  getPM10Status,
  getPM25Status,
  getTVOCStatus,
} from "../utils/airQualityStatus";

function Dashboard() {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLatestMeasurement() {
      try {
        const data = await getLatestMeasurement();
        setLatest(data);
      } catch (error) {
        setErrorMessage("No se pudieron cargar los datos de la API.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadLatestMeasurement();
  }, []);

  if (loading) {
    return <main className="page">Cargando datos...</main>;
  }

  if (errorMessage) {
    return <main className="page">{errorMessage}</main>;
  }

  return (
    <main className="page">
      <section className="hero">
        <h1>Calidad de Aire UPIITA</h1>
        <p>
          Plataforma de monitoreo ambiental para consultar las mediciones
          registradas por los nodos instalados en UPIITA.
        </p>
      </section>

      <section className="summary-panel">
        <div>
          <span className="summary-panel__label">Última medición</span>
          <h2>{latest?.nodo ?? "Nodo no disponible"}</h2>
          <p>{latest?.ubicacion ?? "Ubicación no disponible"}</p>
        </div>

        <div>
          <span className="summary-panel__label">Fecha y hora</span>
          <p className="summary-panel__datetime">
            {latest?.fecha_hora ?? "Sin fecha"}
          </p>
        </div>
      </section>

      <section className="section-header">
        <h2>Mediciones de calidad de aire</h2>
        <p>Lecturas más recientes recibidas desde el backend.</p>
      </section>

      <section className="metrics-grid">
        <MetricCard
          title="PM1"
          value={latest?.pm1_0}
          unit="µg/m³"
          status={getGenericStatus(latest?.pm1_0)}
          icon={<Wind size={20} />}
        />

        <MetricCard
          title="PM2.5"
          value={latest?.pm2_5}
          unit="µg/m³"
          status={getPM25Status(latest?.pm2_5)}
          icon={<Wind size={20} />}
        />

        <MetricCard
          title="PM10"
          value={latest?.pm10}
          unit="µg/m³"
          status={getPM10Status(latest?.pm10)}
          icon={<Wind size={20} />}
        />

        <MetricCard
          title="TVOC"
          value={latest?.tvoc}
          unit="ppb"
          status={getTVOCStatus(latest?.tvoc)}
          icon={<Droplets size={20} />}
        />

        <MetricCard
          title="CO2"
          value={latest?.co2}
          unit="ppm"
          status={getCO2Status(latest?.co2)}
          icon={<Activity size={20} />}
        />

        <MetricCard
          title="eCO2"
          value={latest?.eco2}
          unit="ppm"
          status={getCO2Status(latest?.eco2)}
          icon={<Activity size={20} />}
        />

        <MetricCard
          title="Temperatura"
          value={latest?.scd41_temp ?? latest?.bme688_temp}
          unit="°C"
          status={getGenericStatus(latest?.scd41_temp ?? latest?.bme688_temp)}
          icon={<Thermometer size={20} />}
        />

        <MetricCard
          title="Humedad"
          value={latest?.scd41_humedad ?? latest?.bme688_humedad}
          unit="%"
          status={getGenericStatus(
            latest?.scd41_humedad ?? latest?.bme688_humedad
          )}
          icon={<Droplets size={20} />}
        />

        <MetricCard
          title="Presión"
          value={latest?.presion_atmosferica}
          unit="hPa"
          status={getGenericStatus(latest?.presion_atmosferica)}
          icon={<Gauge size={20} />}
        />

        <MetricCard
          title="Gas"
          value={latest?.resistencia_gas}
          unit="kΩ"
          status={getGenericStatus(latest?.resistencia_gas)}
          icon={<Gauge size={20} />}
        />

        <MetricCard
          title="AQI"
          value={latest?.aqi}
          unit="índice"
          status={getAQIStatus(latest?.aqi)}
          icon={<Gauge size={20} />}
        />
      </section>
    </main>
  );
}

export default Dashboard;