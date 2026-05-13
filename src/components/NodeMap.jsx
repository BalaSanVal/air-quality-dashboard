import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
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
    lat: 19.511339,
    lng: -99.127305,
  },
};

function NodeMap({ measurements }) {
  const latestMeasurementsByNode = getLatestMeasurementsByNode(measurements);

  return (
    <section className="map-section" id="mapa">
      <div className="section-header">
        <h2>Mapa de nodos de medición</h2>
        <p>
          Ubicación aproximada de los nodos instalados en UPIITA y estado actual
          de calidad del aire de acuerdo con las mediciones recientes.
        </p>
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
              const icon = createNodeIcon(status.colorClass);

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
                        <span className={`metric-card__status ${status.colorClass}`}>
                          {status.label}
                        </span>
                      </div>

                      <p>
                        PM2.5: <strong>{measurement.pm2_5 ?? "—"} µg/m³</strong>
                      </p>
                      <p>
                        PM10: <strong>{measurement.pm10 ?? "—"} µg/m³</strong>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <aside className="map-sidebar">
          <h3>Nodos activos</h3>
          <p>Selecciona un marcador en el mapa para ver detalles.</p>

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
                        ? "Interior"
                        : "Exterior"}
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

function createNodeIcon(colorClass) {
  return L.divIcon({
    className: "",
    html: `
      <div class="node-marker ${colorClass}">
        <div class="node-marker__inner"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export default NodeMap;