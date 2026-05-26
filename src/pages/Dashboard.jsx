import { useEffect, useMemo, useState } from "react";
import { Activity, Gauge, Thermometer, Droplets, Wind, Ruler } from "lucide-react";
import { getAllMeasurementsWithRetry } from "../api/measurements";
import MetricCard from "../components/MetricCard";
import {
  getInformativeStatus,
  getPM10Status,
  getPM25Status,
} from "../utils/airQualityStatus";
import { metricInfo } from "../utils/metricInfo";
import { formatDateTime } from "../utils/formatDate";
import NodeMap from "../components/NodeMap";
import ChartsAnalysis from "../components/ChartsAnalysis";
import { Routes, Route, Navigate } from "react-router-dom";

function Dashboard() {
  const [measurements, setMeasurements] = useState([]);
  const [selectedInteriorNode, setSelectedInteriorNode] = useState("");
  const [selectedExteriorNode, setSelectedExteriorNode] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Cargando datos...");
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);

  useEffect(() => {
    async function loadMeasurements() {
      try {
        const cachedMeasurements = localStorage.getItem("latestMeasurements");

        if (cachedMeasurements) {
          const parsedItems = JSON.parse(cachedMeasurements);

          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            setMeasurements(parsedItems);
            setIsUsingCachedData(true);
            setLoading(false);

            const interiorNodes = getUniqueNodesByType(parsedItems, "interior");
            const exteriorNodes = getUniqueNodesByType(parsedItems, "exterior");

            if (interiorNodes.length > 0) {
              setSelectedInteriorNode(String(interiorNodes[0].id_nodo));
            }

            if (exteriorNodes.length > 0) {
              setSelectedExteriorNode(String(exteriorNodes[0].id_nodo));
            }
          }
        }

        setLoadingMessage("Conectando con el servidor de mediciones...");

        const data = await getAllMeasurementsWithRetry({
          attempts: 6,
          delay: 10000,
          onRetry: (attempt, attempts) => {
            setLoadingMessage(
              `El servidor está iniciando. Reintento ${attempt} de ${attempts}...`
            );
          },
        });

        const items = data?.items ?? [];

        setMeasurements(items);
        setErrorMessage("");
        setIsUsingCachedData(false);
        localStorage.setItem("latestMeasurements", JSON.stringify(items));

        const interiorNodes = getUniqueNodesByType(items, "interior");
        const exteriorNodes = getUniqueNodesByType(items, "exterior");

        if (interiorNodes.length > 0) {
          setSelectedInteriorNode(String(interiorNodes[0].id_nodo));
        }

        if (exteriorNodes.length > 0) {
          setSelectedExteriorNode(String(exteriorNodes[0].id_nodo));
        }
      } catch (error) {
        console.error("No se pudieron cargar datos nuevos desde la API:", error);

        setMeasurements((currentMeasurements) => {
          if (currentMeasurements.length > 0) {
            setErrorMessage("");
            setIsUsingCachedData(true);
            return currentMeasurements;
          }

          setErrorMessage(
            "No se pudieron cargar datos nuevos. Verifica la conexión o intenta nuevamente en unos segundos."
          );

          return currentMeasurements;
        });
      } finally {
        setLoading(false);
      }
    }

    loadMeasurements();
  }, []);

  const interiorNodes = useMemo(
    () => getUniqueNodesByType(measurements, "interior"),
    [measurements]
  );

  const exteriorNodes = useMemo(
    () => getUniqueNodesByType(measurements, "exterior"),
    [measurements]
  );

  const selectedInteriorMeasurement = useMemo(
    () => getLatestMeasurementByNode(measurements, selectedInteriorNode),
    [measurements, selectedInteriorNode]
  );

  const selectedExteriorMeasurement = useMemo(
    () => getLatestMeasurementByNode(measurements, selectedExteriorNode),
    [measurements, selectedExteriorNode]
  );

  if (loading) {
    return (
      <main className="page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <h2>{loadingMessage}</h2>
          <p>
            El servicio puede tardar unos segundos si estuvo inactivo. La página
            seguirá intentando cargar la información automáticamente.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return <main className="page">{errorMessage}</main>;
  }

  return (
    <main className="page">

      <Routes>
        <Route
          path="/"
          element={
            <HomePage />
          }
        />

        <Route
          path="/mediciones/interiores"
          element={
            <MeasurementGroup
              id="mediciones-interiores"
              title="Interior"
              description="Mediciones registradas por los puntos de medición instalados en espacios interiores."
              nodes={interiorNodes}
              selectedNode={selectedInteriorNode}
              onSelectNode={setSelectedInteriorNode}
              measurement={selectedInteriorMeasurement}
            />
          }
        />

        <Route
          path="/mediciones/exteriores"
          element={
            <MeasurementGroup
              id="mediciones-exteriores"
              title="Exterior"
              description="Mediciones registradas por los puntos de medición instalados en espacios exteriores."
              nodes={exteriorNodes}
              selectedNode={selectedExteriorNode}
              onSelectNode={setSelectedExteriorNode}
              measurement={selectedExteriorMeasurement}
            />
          }
        />

        <Route
          path="/mapa"
          element={<NodeMap measurements={measurements} />}
        />

        <Route
          path="/graficas"
          element={<ChartsAnalysis measurements={measurements} />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isUsingCachedData && (
        <div className="cached-data-alert">
          Mostrando la última información guardada mientras se actualizan los datos
          desde el servidor.
        </div>
      )}

    </main>
  );
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__label">
          Monitoreo ambiental en tiempo real
        </div>

        <h1>Sistema de monitoreo de calidad del aire en UPIITA</h1>

        <p>
          Página web diseñada para consultar de forma clara el estado de la calidad
          del aire dentro y fuera de la UPIITA. El sistema recopila mediciones
          ambientales mediante puntos de medición instalados en zonas estratégicas
          y las presenta en tarjetas, mapa y gráficas para facilitar su interpretación.
        </p>

        <div className="hero__highlights">
          <article>
            <strong>3</strong>
            <span>Puntos de medición (nodos)</span>
            <p>
              Instalados en espacios interiores y exteriores para comparar las
              condiciones ambientales de distintas zonas.
            </p>
          </article>

          <article className="hero__highlight--wide">
            <strong>15</strong>
            <span>Variables ambientales</span>
            <p>
              Incluyen partículas suspendidas PM1, PM2.5, PM4 y PM10, CO₂, TVOC,
              temperatura, humedad, presión atmosférica, gas, AQI y otros
              indicadores generados por los sensores.
            </p>
          </article>
        </div>
      </section>

      <section className="measurements-intro-panel" id="mediciones">
        <div className="measurements-intro-panel__content">
          <span className="section-header__eyebrow">Guía de consulta</span>

          <h2>¿Qué puedes encontrar en esta página?</h2>

          <p>
            Esta página permite consultar el estado de la calidad del aire en
            diferentes zonas de la UPIITA mediante puntos de medición, también
            llamados nodos. Cada punto registra variables ambientales como
            partículas suspendidas, dióxido de carbono, temperatura, humedad y
            otros indicadores que ayudan a conocer las condiciones del entorno.
          </p>

          <p>
            La información se presenta mediante tarjetas, gráficas y un mapa para
            facilitar su interpretación. De esta forma, cualquier usuario puede
            identificar de manera rápida qué se está midiendo, en qué ubicación se
            encuentra cada punto de medición y cómo cambian los valores registrados.
          </p>

          <div className="measurements-intro-panel__info">
            <article>
              <strong>Ambientes monitoreados</strong>
              <span>
                Se muestran mediciones de espacios interiores y exteriores para
                comparar las condiciones ambientales de distintas zonas.
              </span>
            </article>

            <article>
              <strong>Puntos de medición</strong>
              <span>
                Cada punto de medición corresponde a un nodo instalado en una
                ubicación específica dentro o alrededor de la unidad.
              </span>
            </article>

            <article>
              <strong>Datos ambientales</strong>
              <span>
                Las lecturas actuales permiten revisar variables como PM₂.₅, PM₁₀,
                CO₂, temperatura, humedad, presión y compuestos orgánicos volátiles.
              </span>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

function MeasurementGroup({
  id,
  title,
  description,
  nodes,
  selectedNode,
  onSelectNode,
  measurement,
}) {

      const environmentClass =
  String(title).toLowerCase() === "exterior" ? "exterior" : "interior";

return (
  <section
    className={`measurement-group measurement-group-card measurement-group-card--${environmentClass}`}
    id={id}
  >
    <div className="measurement-group-card__header">
      <div className="measurement-group-card__intro">
        <span className="measurement-group-card__eyebrow">
          {environmentClass === "interior"
            ? "Ambiente interior"
            : "Ambiente exterior"}
        </span>

        <h3>
          {environmentClass === "interior"
            ? "Mediciones en interiores"
            : "Mediciones en exteriores"}
        </h3>

        <p>{description}</p>

        <div className="measurement-group-card__meta">
          <span>{nodes.length} nodo(s) disponible(s)</span>
          <span>Última lectura por nodo</span>
          <span>Datos obtenidos desde la API</span>
        </div>
      </div>

      <label className="node-selector measurement-group-card__selector">
        <span>Seleccionar nodo</span>
        <select
          value={selectedNode}
          onChange={(event) => onSelectNode(event.target.value)}
          disabled={nodes.length === 0}
        >
          {nodes.length === 0 && <option value="">Sin nodos disponibles</option>}

          {nodes.map((node) => (
            <option key={node.id_nodo} value={node.id_nodo}>
              {node.nodo} — {node.ubicacion}
            </option>
          ))}
        </select>
      </label>
    </div>

      {measurement ? (
        <>
          <div className="measurement-group__summary">
            <div>
              <span>Última medición</span>
              <strong>{measurement.nodo}</strong>
              <p>{measurement.ubicacion}</p>
            </div>

            <div>
              <span>Fecha y hora</span>
              <strong>{formatDateTime(measurement.fecha_hora)} h</strong>
            </div>
          </div>

          <section className="metrics-grid">
            <MetricCard
                title={metricInfo.pm1_0.title}
                value={measurement.pm1_0}
                unit="µg/m³"
                status={getInformativeStatus(measurement.pm1_0)}
                icon={<Wind size={20} />}
                info={metricInfo.pm1_0.description}
            />

            <MetricCard
                title={metricInfo.pm2_5.title}
                value={measurement.pm2_5}
                unit="µg/m³"
                status={getPM25Status(measurement.pm2_5)}
                icon={<Wind size={20} />}
                info={metricInfo.pm2_5.description}
            />

            <MetricCard
                title={metricInfo.pm4_0.title}
                value={measurement.pm4_0}
                unit="µg/m³"
                status={getInformativeStatus(measurement.pm4_0)}
                icon={<Wind size={20} />}
                info={metricInfo.pm4_0.description}
            />

            <MetricCard
                title={metricInfo.pm10.title}
                value={measurement.pm10}
                unit="µg/m³"
                status={getPM10Status(measurement.pm10)}
                icon={<Wind size={20} />}
                info={metricInfo.pm10.description}
            />

            <MetricCard
                title={metricInfo.particleSize.title}
                value={measurement.tamano_promedio_particula}
                unit="µm"
                status={getInformativeStatus(measurement.tamano_promedio_particula)}
                icon={<Ruler size={20} />}
                info={metricInfo.particleSize.description}
            />

            <MetricCard
                title={metricInfo.tvoc.title}
                value={measurement.tvoc}
                unit="ppb"
                status={getInformativeStatus(measurement.tvoc)}
                icon={<Droplets size={20} />}
                info={metricInfo.tvoc.description}
            />

            <MetricCard
                title={metricInfo.co2.title}
                value={measurement.co2}
                unit="ppm"
                status={getInformativeStatus(measurement.co2)}
                icon={<Activity size={20} />}
                info={metricInfo.co2.description}
            />

            <MetricCard
                title={metricInfo.eco2.title}
                value={measurement.eco2}
                unit="ppm"
                status={getInformativeStatus(measurement.eco2)}
                icon={<Activity size={20} />}
                info={metricInfo.eco2.description}
            />

            <MetricCard
                title={metricInfo.temperature.title}
                value={measurement.scd41_temp ?? measurement.bme688_temp}
                unit="°C"
                status={getInformativeStatus(
                measurement.scd41_temp ?? measurement.bme688_temp
                )}
                icon={<Thermometer size={20} />}
                info={metricInfo.temperature.description}
            />

            <MetricCard
                title={metricInfo.humidity.title}
                value={measurement.scd41_humedad ?? measurement.bme688_humedad}
                unit="%"
                status={getInformativeStatus(
                measurement.scd41_humedad ?? measurement.bme688_humedad
                )}
                icon={<Droplets size={20} />}
                info={metricInfo.humidity.description}
            />

            <MetricCard
                title={metricInfo.pressure.title}
                value={measurement.presion_atmosferica}
                unit="hPa"
                status={getInformativeStatus(measurement.presion_atmosferica)}
                icon={<Gauge size={20} />}
                info={metricInfo.pressure.description}
            />

            <MetricCard
                title={metricInfo.gasResistance.title}
                value={measurement.resistencia_gas}
                unit="kΩ"
                status={getInformativeStatus(measurement.resistencia_gas)}
                icon={<Gauge size={20} />}
                info={metricInfo.gasResistance.description}
            />

            <MetricCard
                title={metricInfo.aqiEns160.title}
                value={measurement.aqi}
                unit="índice"
                status={getInformativeStatus(measurement.aqi)}
                icon={<Gauge size={20} />}
                info={metricInfo.aqiEns160.description}
            />
          </section>
        </>
      ) : (
        <div className="empty-state">
          No hay mediciones disponibles para esta sección.
        </div>
      )}
  </section>
  );
}

function getUniqueNodesByType(measurements, type) {
  const normalizedType = type.toLowerCase();
  const nodesMap = new Map();

  measurements
    .filter((item) => String(item.tipo_nodo).toLowerCase() === normalizedType)
    .forEach((item) => {
      if (!nodesMap.has(item.id_nodo)) {
        nodesMap.set(item.id_nodo, {
          id_nodo: item.id_nodo,
          nodo: item.nodo,
          ubicacion: item.ubicacion,
        });
      }
    });

  return Array.from(nodesMap.values()).sort((a, b) => a.id_nodo - b.id_nodo);
}

function getLatestMeasurementByNode(measurements, nodeId) {
  if (!nodeId) return null;

  return (
    measurements.find((item) => String(item.id_nodo) === String(nodeId)) ?? null
  );
}

export default Dashboard;