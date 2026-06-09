import { useEffect, useMemo, useState } from "react";
import { Activity, Gauge, Thermometer, Droplets, Wind, Ruler } from "lucide-react";
import {
  getAllMeasurementsWithRetry,
  getLatestSimatMeasurement,
  getAvailableSimatStations,
} from "../api/measurements";
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
  const [selectedComparisonNode, setSelectedComparisonNode] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Cargando datos...");
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [simatStations, setSimatStations] = useState([]);
  const [selectedSimatStation, setSelectedSimatStation] = useState("");
  const [simatMeasurement, setSimatMeasurement] = useState(null);
  const [simatLoading, setSimatLoading] = useState(true);
  const [simatStationsLoading, setSimatStationsLoading] = useState(true);
  const [simatError, setSimatError] = useState("");

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

  useEffect(() => {
  async function loadSimatStations() {
    try {
      setSimatStationsLoading(true);

      const data = await getAvailableSimatStations();
      const items = data?.items ?? [];

      setSimatStations(items);

      if (items.length > 0) {
        setSelectedSimatStation(items[0].station_code);
      }

      setSimatError("");
    } catch (error) {
      console.error("No se pudieron cargar las estaciones SIMAT:", error);
      setSimatError("No se pudieron cargar las estaciones disponibles del SIMAT.");
    } finally {
      setSimatStationsLoading(false);
    }
  }

  loadSimatStations();
}, []);

useEffect(() => {
  if (!selectedSimatStation) {
    setSimatMeasurement(null);
    setSimatLoading(false);
    return;
  }

  async function loadSimatMeasurement() {
    try {
      setSimatLoading(true);

      const data = await getLatestSimatMeasurement(selectedSimatStation);

      setSimatMeasurement(data);
      setSimatError("");
    } catch (error) {
      console.error("No se pudo cargar la medición SIMAT:", error);
      setSimatMeasurement(null);
      setSimatError("No se pudo cargar la última lectura disponible del SIMAT.");
    } finally {
      setSimatLoading(false);
    }
  }

  loadSimatMeasurement();
}, [selectedSimatStation]);

  const interiorNodes = useMemo(
    () => getUniqueNodesByType(measurements, "interior"),
    [measurements]
  );

  const exteriorNodes = useMemo(
    () => getUniqueNodesByType(measurements, "exterior"),
    [measurements]
  );

  const comparisonNodes = useMemo(() => {
    return [...interiorNodes, ...exteriorNodes];
  }, [interiorNodes, exteriorNodes]);

  const selectedComparisonMeasurement = useMemo(() => {
  return getLatestMeasurementByNode(measurements, selectedComparisonNode);
  }, [measurements, selectedComparisonNode]);

  useEffect(() => {
    if (!selectedComparisonNode && comparisonNodes.length > 0) {
      setSelectedComparisonNode(comparisonNodes[0].id_nodo);
    }
  }, [comparisonNodes, selectedComparisonNode]);

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
          path="/simat"
          element={
            <SimatSection
              stations={simatStations}
              selectedStation={selectedSimatStation}
              onSelectStation={setSelectedSimatStation}
              measurement={simatMeasurement}
              loading={simatLoading}
              stationsLoading={simatStationsLoading}
              error={simatError}
              comparisonNodes={comparisonNodes}
              selectedComparisonNode={selectedComparisonNode}
              onSelectComparisonNode={setSelectedComparisonNode}
              comparisonMeasurement={selectedComparisonMeasurement}
            />
          }
        />

        <Route
          path="/mapa"
          element={
            <NodeMap
              measurements={measurements}
              simatStations={simatStations}
            />
          }
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
            <strong>13</strong>
            <span>Variables ambientales</span>
            <p>
              Incluyen partículas suspendidas PM<sub>1</sub>, PM<sub>2.5</sub>, PM<sub>4</sub> y PM<sub>10</sub>, tamaño promedio de particula, 
              Dióxido de carbono CO<sub>2</sub>, Compuestos orgánicos volátiles totales TVOC, Dióxido de carbono equivalente eCO<sub>2</sub>,
              temperatura ambiente, humedad relativa, presión atmosférica, resistencia de gas e Índice de calidad de aire AQI.
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
            facilitar su interpretación, incluyendo comparaciones con estaciones oficiales 
            como lo son las estaciones de monitoreo ambiental del <a href="https://www.aire.cdmx.gob.mx/default.php" target="_blank">SIMAT</a>. 
            De esta forma, cualquier usuario puede
            identificar de manera rápida qué se está midiendo, en qué ubicación se
            encuentra cada punto de medición y cómo cambian los valores registrados.
          </p>

          <div className="measurements-intro-panel__info">
            <article>
              <strong>Ambientes monitoreados</strong>
              <span>
                Se muestran mediciones de espacios interiores y exteriores a nivel de calle para
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
                Las lecturas actuales permiten revisar variables como PM<sub>2.5</sub>, PM<sub>10</sub>,
                CO<sub>2</sub>, temperatura, humedad, presión y compuestos orgánicos volátiles.
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

function SimatSection({
  stations,
  selectedStation,
  onSelectStation,
  measurement,
  loading,
  stationsLoading,
  error,
  comparisonNodes,
  selectedComparisonNode,
  onSelectComparisonNode,
  comparisonMeasurement,
}) {
  const selectedStationInfo =
    stations.find((station) => station.station_code === selectedStation) ?? null;

  const stationName =
    measurement?.estacion ??
    selectedStationInfo?.station_name ??
    "Estación SIMAT";

  return (
    <section className="measurement-group-card measurement-group-card--simat simat-section">
      <div className="measurement-group-card__header simat-header">
        <div className="measurement-group-card__intro">
          <span className="measurement-group-card__eyebrow">
            Fuente oficial de referencia
          </span>

          <h3>Últimas lecturas disponibles del SIMAT</h3>

          <p>
            Consulta contextual de estaciones oficiales del SIMAT. Estos datos
            se muestran como referencia oficial disponible y no como validación
            metrológica directa de los nodos IoT.
          </p>

          <div className="measurement-group-card__meta">
            <span>{stations.length} estación(es) disponible(s)</span>
            <span>Referencia contextual</span>
            <span>No tiempo real</span>
          </div>
        </div>

        <label className="simat-selector">
          <span>Seleccionar estación SIMAT</span>

          <select
            value={selectedStation}
            onChange={(event) => onSelectStation(event.target.value)}
            disabled={stationsLoading || stations.length === 0}
          >
            {stations.length === 0 && (
              <option value="">Sin estaciones disponibles</option>
            )}

            {stations.map((station) => (
              <option
                key={station.id_estacion}
                value={station.station_code}
              >
                {station.station_code} — {station.station_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {stationsLoading && (
        <p className="empty-message">
          Cargando estaciones disponibles del SIMAT...
        </p>
      )}

      {!stationsLoading && loading && (
        <p className="empty-message">
          Cargando última lectura disponible del SIMAT...
        </p>
      )}

      {!stationsLoading && !loading && error && (
        <p className="empty-message">{error}</p>
      )}

      {!stationsLoading && !loading && !error && measurement && (
        <>
          <div className="simat-summary">
            <div>
              <span>Estación</span>
              <strong>{stationName}</strong>
            </div>

            <div>
              <span>Fecha y hora</span>
              <strong>{formatDateTime(measurement.fecha_hora)} h</strong>
            </div>

            <div>
              <span>Alcaldía / municipio</span>
              <strong>{measurement.alcaldia ?? selectedStationInfo?.alcaldia ?? "No disponible"}</strong>
            </div>

            <div>
              <span>Total de registros cargados</span>
              <strong>{selectedStationInfo?.total_mediciones ?? "No disponible"}</strong>
            </div>
          </div>

          <section className="metrics-grid simat-grid">
            <MetricCard
              title="PM₁₀"
              value={measurement.pm10}
              unit="µg/m³"
              status={getPM10Status(measurement.pm10)}
              icon={<Activity />}
              info="Material particulado con diámetro menor o igual a 10 micrómetros reportado por SIMAT."
            />

            <MetricCard
              title="PM₂.₅"
              value={measurement.pm2_5}
              unit="µg/m³"
              status={getPM25Status(measurement.pm2_5)}
              icon={<Activity />}
              info="Material particulado fino con diámetro menor o igual a 2.5 micrómetros reportado por SIMAT."
            />

            <MetricCard
              title="PMCO"
              value={measurement.pmco}
              unit="µg/m³"
              status={getInformativeStatus(measurement.pmco)}
              icon={<Activity />}
              info="Fracción gruesa de material particulado reportada por SIMAT."
            />

            <MetricCard
              title="O₃"
              value={measurement.o3}
              unit="ppb"
              status={getInformativeStatus(measurement.o3)}
              icon={<Wind />}
              info="Ozono reportado por la estación oficial SIMAT."
            />

            <MetricCard
              title="NO₂"
              value={measurement.no2}
              unit="ppb"
              status={getInformativeStatus(measurement.no2)}
              icon={<Wind />}
              info="Dióxido de nitrógeno reportado por la estación oficial SIMAT."
            />

            <MetricCard
              title="NOX"
              value={measurement.nox}
              unit="ppb"
              status={getInformativeStatus(measurement.nox)}
              icon={<Wind />}
              info="Óxidos de nitrógeno reportados por la estación oficial SIMAT."
            />

            <MetricCard
              title="NO"
              value={measurement.no}
              unit="ppb"
              status={getInformativeStatus(measurement.no)}
              icon={<Wind />}
              info="Óxido nítrico reportado por la estación oficial SIMAT."
            />

            <MetricCard
              title="CO"
              value={measurement.co}
              unit="ppm"
              status={getInformativeStatus(measurement.co)}
              icon={<Gauge />}
              info="Monóxido de carbono reportado por la estación oficial SIMAT."
            />

            <MetricCard
              title="SO₂"
              value={measurement.so2}
              unit="ppb"
              status={getInformativeStatus(measurement.so2)}
              icon={<Wind />}
              info="Dióxido de azufre reportado por la estación oficial SIMAT."
            />
          </section>
          <SimatComparisonBlock
            simatMeasurement={measurement}
            nodes={comparisonNodes}
            selectedNode={selectedComparisonNode}
            onSelectNode={onSelectComparisonNode}
            nodeMeasurement={comparisonMeasurement}
          />
        </>
      )}

      {!stationsLoading && !loading && !error && !measurement && (
        <p className="empty-message">
          No hay lectura SIMAT disponible para la estación seleccionada.
        </p>
      )}
    </section>
  );
}

function SimatComparisonBlock({
  simatMeasurement,
  nodes,
  selectedNode,
  onSelectNode,
  nodeMeasurement,
}) {
  const selectedNodeInfo =
    nodes.find((node) => String(node.id_nodo) === String(selectedNode)) ?? null;

  const nodeName = selectedNodeInfo
    ? getNodeDisplayName(selectedNodeInfo)
    : `Nodo ${selectedNode}`;

  const pm25Difference = calculateDifference(
    nodeMeasurement?.pm2_5,
    simatMeasurement?.pm2_5
  );

  const pm10Difference = calculateDifference(
    nodeMeasurement?.pm10,
    simatMeasurement?.pm10
  );

  return (
    <section className="simat-comparison">
      <div className="simat-comparison__header">
        <div>
          <span className="measurement-group-card__eyebrow">
            Comparación contextual
          </span>

          <h4>Comparación SIMAT vs nodo seleccionado</h4>

          <p>
            Comparación directa únicamente para PM₂.₅ y PM₁₀, ya que son las
            variables presentes tanto en SIMAT como en los nodos del sistema.
          </p>
        </div>

        <label className="simat-selector">
          <span>Seleccionar nodo propio</span>

          <select
            value={selectedNode}
            onChange={(event) => onSelectNode(event.target.value)}
            disabled={nodes.length === 0}
          >
            {nodes.length === 0 && (
              <option value="">Sin nodos disponibles</option>
            )}

            {nodes.map((node) => (
              <option key={node.id_nodo} value={node.id_nodo}>
                {getNodeDisplayName(node)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="comparison-columns">
        <div className="comparison-panel">
          <span>SIMAT</span>
          <h5>Estación oficial seleccionada</h5>

          <ComparisonRow
            label="PM₂.₅"
            value={simatMeasurement?.pm2_5}
            unit="µg/m³"
          />

          <ComparisonRow
            label="PM₁₀"
            value={simatMeasurement?.pm10}
            unit="µg/m³"
          />
        </div>

        <div className="comparison-panel">
          <span>Nodo propio</span>
          <h5>{nodeName}</h5>

          <ComparisonRow
            label="PM₂.₅"
            value={nodeMeasurement?.pm2_5}
            unit="µg/m³"
          />

          <ComparisonRow
            label="PM₁₀"
            value={nodeMeasurement?.pm10}
            unit="µg/m³"
          />
        </div>

        <div className="comparison-panel comparison-panel--difference">
          <span>Diferencia</span>
          <h5>Nodo - SIMAT</h5>

          <ComparisonRow
            label="PM₂.₅"
            value={pm25Difference}
            unit="µg/m³"
            showSign
          />

          <ComparisonRow
            label="PM₁₀"
            value={pm10Difference}
            unit="µg/m³"
            showSign
          />
        </div>
      </div>
    </section>
  );
}

function ComparisonRow({ label, value, unit, showSign = false }) {
  const hasValue = value !== null && value !== undefined && !Number.isNaN(value);
  const formattedValue = hasValue
    ? `${showSign && value > 0 ? "+" : ""}${Number(value).toFixed(2)}`
    : "—";

  return (
    <div className="comparison-row">
      <span>{label}</span>
      <strong>
        {formattedValue}
        {hasValue && <small> {unit}</small>}
      </strong>
    </div>
  );
}

function calculateDifference(nodeValue, simatValue) {
  const nodeNumber = Number(nodeValue);
  const simatNumber = Number(simatValue);

  if (Number.isNaN(nodeNumber) || Number.isNaN(simatNumber)) {
    return null;
  }

  return nodeNumber - simatNumber;
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

function getNodeDisplayName(node) {
  if (Number(node.id_nodo) === 1) return "Nodo interior 1";
  if (Number(node.id_nodo) === 2) return "Nodo interior 2";
  if (Number(node.id_nodo) === 3) return "Nodo exterior 1";

  return node.nombre ?? node.ubicacion ?? `Nodo ${node.id_nodo}`;
}

export default Dashboard;