import { Info } from "lucide-react";

function MetricCard({ title, titleText, value, unit, status, icon, info }) {
  const safeStatus = status ?? {
    label: "Sin dato",
    risk: "No disponible",
    colorClass: "status--gray",
  };

  return (
    <article className="metric-card">
      <div className="metric-card__header">
        <h3>{title}</h3>

        <div className="metric-card__actions">
          <span className="metric-card__icon">{icon}</span>

          {info && (
            <div className="metric-card__info-wrapper">
              <button
                type="button"
                className="metric-card__info-button"
                aria-label={`Información sobre ${titleText ?? "esta variable"}`}
              >
                <Info size={14} />
              </button>

              <div className="metric-card__tooltip" role="tooltip">
                {info}
              </div>
            </div>
          )}
        </div>
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