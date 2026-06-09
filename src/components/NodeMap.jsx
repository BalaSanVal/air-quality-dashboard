import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Activity, MapPin, RadioTower } from "lucide-react";
import { getPM10Status, getPM25Status } from "../utils/airQualityStatus";
import { formatDateTime } from "../utils/formatDate";

const UPIITA_CENTER = [19.5113, -99.1269];

const NODE_COORDINATES = {
  1: {
    lat: 19.511344,
    lng: -99.125027,
  },
  2: {
    lat: 19.510918,
    lng: -99.125418,
  },
  3: {
    lat: 19.511847,
    lng: -99.127651,
  },
};

function NodeMap({ measurements, simatStations = [] }) {
  const latestMeasurementsByNode = getLatestMeasurementsByNode(measurements);

  return (
    <section className="map-section map-section-panel" id="mapa">
      <div className="map-section-panel__header">
        <div className="map-section-panel__intro">
          <span className="map-section-panel__eyebrow">
            Ubicación georreferenciada
          </span>

          <h2>Mapa de nodos de medición</h2>

          <p>
            Visualización espacial de los nodos IoT instalados en UPIITA. Cada
            marcador representa un nodo de monitoreo y su color resume el estado
            actual de calidad del aire con base en las mediciones recientes de
            PM₂.₅ y PM₁₀.
          </p>

          <div className="map-section-panel__chips">
            <span>
              <MapPin size={14} />
              Coordenadas aproximadas
            </span>

            <span>
              <Activity size={14} />
              Estado por color
            </span>

            <span>
              <RadioTower size={14} />
              Nodos IoT activos
            </span>
          </div>
        </div>

        <div className="map-section-panel__summary">
          <article>
            <strong>{latestMeasurementsByNode.length}</strong>
            <span>Nodos activos</span>
          </article>

          <article>
            <strong>PM₂.₅ / PM₁₀</strong>
            <span>Variables de referencia</span>
          </article>
        </div>
      </div>

      <div className="map-layout">
        <div className="map-card">
          <MapContainer
            center={UPIITA_CENTER}
            zoom={18}
            scrollWheelZoom={false}
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {latestMeasurementsByNode.map((measurement) => {
              const coordinates = NODE_COORDINATES[measurement.id_nodo];
              if (!coordinates) return null;

              const status = getNodeAirStatus(measurement);
              const nodeLabel = getNodeMapLabel(measurement.id_nodo);
              const icon = createNodeIcon(status.colorClass, getNodeMapLabel(measurement.id_nodo));

              return (
                <Marker
                  key={measurement.id_nodo}
                  position={[coordinates.lat, coordinates.lng]}
                  icon={icon}
                >
                  <Popup>
                    <div className="node-popup">
                      <strong>{measurement.nodo}</strong>
                      <span>{measurement.ubicacion}</span>
                      <small>{formatDateTime(measurement.fecha_hora)} h</small>

                      <div className="node-popup__status">
                        <span
                          className={`metric-card__status ${status.colorClass}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <p>
                        PM<sub>2.5</sub>:{" "}
                        <strong>{measurement.pm2_5 ?? "—"} µg/m³</strong>
                      </p>

                      <p>
                        PM<sub>10</sub>:{" "}
                        <strong>{measurement.pm10 ?? "—"} µg/m³</strong>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {simatStations.map((station) => {
              const lat = Number(station.latitud);
              const lng = Number(station.longitud);

              if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

              return (
                <Marker
                  key={`simat-${station.id_estacion}`}
                  position={[lat, lng]}
                  icon={createSimatIcon(station.station_code)}
                >
                  <Popup>
                    <strong>{station.station_name}</strong>
                    <br />
                    {station.alcaldia ?? "Alcaldía / municipio no disponible"}
                    <br />
                    <br />
                    <strong>Fuente:</strong> SIMAT
                    <br />
                    <strong>Registros cargados:</strong>{" "}
                    {station.total_mediciones ?? "No disponible"}
                    <br />
                    <strong>Última lectura:</strong>{" "}
                    {station.ultima_fecha_hora
                      ? `${formatDateTime(station.ultima_fecha_hora)} h`
                      : "No disponible"}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <aside className="map-sidebar">
          <div className="map-sidebar__header">
            <span className="map-sidebar__icon">
              <RadioTower size={18} />
            </span>

            <div>
              <h3>Nodos activos</h3>
              <p>Selecciona un marcador en el mapa para consultar detalles.</p>
            </div>
          </div>

          <div className="node-list">
            {latestMeasurementsByNode.map((measurement) => {
              const status = getNodeAirStatus(measurement);

              return (
                <article className="node-list__item" key={measurement.id_nodo}>
                  <div className={`node-list__dot ${status.colorClass}`} />

                  <div>
                    <strong>{measurement.nodo}</strong>
                    <span>{measurement.ubicacion}</span>
                    <small>
                      {measurement.tipo_nodo === "interior"
                        ? "Ambiente interior"
                        : "Ambiente exterior"}
                    </small>
                  </div>

                  <span className={`metric-card__status ${status.colorClass}`}>
                    {status.label}
                  </span>
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}

function getLatestMeasurementsByNode(measurements) {
  const nodeMap = new Map();

  measurements.forEach((measurement) => {
    if (!nodeMap.has(measurement.id_nodo)) {
      nodeMap.set(measurement.id_nodo, measurement);
    }
  });

  return Array.from(nodeMap.values()).sort((a, b) => a.id_nodo - b.id_nodo);
}

function getNodeAirStatus(measurement) {
  const pm25Status = getPM25Status(measurement.pm2_5);
  const pm10Status = getPM10Status(measurement.pm10);

  const priority = {
    "status--gray": 0,
    "status--green": 1,
    "status--yellow": 2,
    "status--orange": 3,
    "status--red": 4,
    "status--purple": 5,
  };

  const pm25Priority = priority[pm25Status.colorClass] ?? 0;
  const pm10Priority = priority[pm10Status.colorClass] ?? 0;

  return pm25Priority >= pm10Priority ? pm25Status : pm10Status;
}

function createNodeIcon(colorClass, label = "Nodo") {
  return L.divIcon({
    className: "",
    html: `
      <div class="node-marker-wrapper">
        <div class="node-marker ${colorClass}">
          <div class="node-marker__inner"></div>
        </div>
        <span class="node-marker-label">${label}</span>
      </div>
    `,
    iconSize: [70, 48],
    iconAnchor: [35, 14],
    popupAnchor: [0, -14],
  });
}

function createSimatIcon(label = "SIMAT") {
  return L.divIcon({
    className: "",
    html: `
      <div class="map-marker-label-wrap">
        <div class="map-marker map-marker--simat">
          <div class="map-marker__core"></div>
        </div>
        <span class="map-marker-label">${label}</span>
      </div>
    `,
    iconSize: [90, 48],
    iconAnchor: [45, 16],
    popupAnchor: [0, -18],
  });
}

function getNodeMapLabel(nodeId) {
  if (Number(nodeId) === 1) return "NI1";
  if (Number(nodeId) === 2) return "NI2";
  if (Number(nodeId) === 3) return "NE1";

  return `N${nodeId}`;
}

export default NodeMap;