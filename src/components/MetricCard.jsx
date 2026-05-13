function MetricCard({ title, value, unit, status, icon }) {
  const safeStatus = status ?? {
    label: "Sin dato",
    risk: "No disponible",
    colorClass: "status--gray",
  };

  return (
    <article className="metric-card">
      <div className="metric-card__header">
        <h3>{title}</h3>
        <span className="metric-card__icon">{icon}</span>
      </div>

      <p className="metric-card__value">
        {value ?? "—"} <span>{unit}</span>
      </p>

      <div className="metric-card__footer">
        <span className={`metric-card__status ${safeStatus.colorClass}`}>
          {safeStatus.label}
        </span>

        <small>{safeStatus.risk}</small>
      </div>
    </article>
  );
}

export default MetricCard;