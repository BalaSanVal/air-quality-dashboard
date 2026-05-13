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

        setLoadingMessage("Despertando servidor y cargando datos...");

        const data = await getAllMeasurementsWithRetry({
          attempts: 6,
          delay: 10000,
          onRetry: (attempt, attempts) => {
            setLoadingMessage(
              `El servidor está despertando. Reintento ${attempt} de ${attempts}...`
            );
          },
        });

        const items = data?.items ?? [];

        setMeasurements(items);
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
        setErrorMessage(
          "No se pudieron cargar datos nuevos. Verifica la conexión o intenta nuevamente en unos segundos."
        );
        console.error(error);
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
    <main className="page" id="inicio">
      <section className="hero">
        <h1>Calidad de Aire UPIITA</h1>
        <p>
          Plataforma de monitoreo ambiental para consultar las mediciones
          registradas por los nodos instalados en UPIITA.
        </p>
      </section>

      {isUsingCachedData && (
        <div className="cached-data-alert">
          Mostrando la última información guardada mientras se actualizan los datos
          desde el servidor.
        </div>
      )}

      <section className="section-header" id="mediciones">
        <h2>Mediciones de calidad de aire</h2>
        <p>
          Consulta las lecturas más recientes por ambiente y por nodo de
          monitoreo.
        </p>
      </section>

      <MeasurementGroup
        id="mediciones-interiores"
        title="Interior"
        description="Mediciones registradas por los nodos instalados en espacios interiores."
        nodes={interiorNodes}
        selectedNode={selectedInteriorNode}
        onSelectNode={setSelectedInteriorNode}
        measurement={selectedInteriorMeasurement}
      />

      <MeasurementGroup
        id="mediciones-exteriores"
        title="Exterior"
        description="Mediciones registradas por los nodos instalados en espacios exteriores."
        nodes={exteriorNodes}
        selectedNode={selectedExteriorNode}
        onSelectNode={setSelectedExteriorNode}
        measurement={selectedExteriorMeasurement}
      />
    </main>
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
  return (
    <section className="measurement-group" id={id}>
      <div className="measurement-group__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <label className="node-selector">
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