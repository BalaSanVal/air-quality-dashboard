function MetricCard({ title, value, unit, status = "Sin dato", icon }) {
  return (
    <article className="metric-card">
      <div className="metric-card__header">
        <h3>{title}</h3>
        <span className="metric-card__icon">{icon}</span>
      </div>

      <p className="metric-card__value">
        {value ?? "—"} <span>{unit}</span>
      </p>

      <span className={`metric-card__status ${getStatusClass(status)}`}>
        {status}
      </span>
    </article>
  );
}

function getStatusClass(status) {
  const normalizedStatus = String(status).toLowerCase();

  if (normalizedStatus.includes("bueno")) return "metric-card__status--good";
  if (normalizedStatus.includes("moderado")) return "metric-card__status--moderate";
  if (normalizedStatus.includes("malo")) return "metric-card__status--bad";

  return "metric-card__status--unknown";
}

export default MetricCard;