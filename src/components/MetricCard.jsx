import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

function MetricCard({ title, titleText, value, unit, status, icon, info }) {
  const safeStatus = status ?? {
    label: "Sin dato",
    risk: "No disponible",
    colorClass: "status--gray",
  };

  const buttonRef = useRef(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    left: 0,
    top: 0,
    width: 280,
    arrowLeft: 140,
    placement: "top",
  });

  useLayoutEffect(() => {
    if (!isTooltipOpen || !buttonRef.current) return;

    function updateTooltipPosition() {
      const buttonRect = buttonRef.current.getBoundingClientRect();

      const margin = 12;
      const preferredWidth = 280;
      const width = Math.min(preferredWidth, window.innerWidth - margin * 2);

      const centeredLeft = buttonRect.left + buttonRect.width / 2 - width / 2;
      const left = Math.min(
        Math.max(centeredLeft, margin),
        window.innerWidth - width - margin
      );

      const hasSpaceAbove = buttonRect.top > 150;
      const placement = hasSpaceAbove ? "top" : "bottom";
      const top = hasSpaceAbove ? buttonRect.top - 10 : buttonRect.bottom + 10;

      const arrowLeft = buttonRect.left + buttonRect.width / 2 - left;

      setTooltipPosition({
        left,
        top,
        width,
        arrowLeft,
        placement,
      });
    }

    updateTooltipPosition();

    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, true);

    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition, true);
    };
  }, [isTooltipOpen]);

  return (
    <article className="metric-card">
      <div className="metric-card__header">
        <h3>{title}</h3>

        <div className="metric-card__actions">
          <span className="metric-card__icon">{icon}</span>

          {info && (
            <div
              className="metric-card__info-wrapper"
              onMouseEnter={() => setIsTooltipOpen(true)}
              onMouseLeave={() => setIsTooltipOpen(false)}
            >
              <button
                ref={buttonRef}
                type="button"
                className="metric-card__info-button"
                aria-label={`Información sobre ${titleText ?? "esta variable"}`}
                onFocus={() => setIsTooltipOpen(true)}
                onBlur={() => setIsTooltipOpen(false)}
                onClick={() =>
                  setIsTooltipOpen((currentValue) => !currentValue)
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsTooltipOpen(false);
                  }
                }}
              >
                <Info size={14} />
              </button>

              {isTooltipOpen &&
                createPortal(
                  <div
                    className={`metric-card__tooltip-portal metric-card__tooltip-portal--${tooltipPosition.placement}`}
                    style={{
                      left: `${tooltipPosition.left}px`,
                      top: `${tooltipPosition.top}px`,
                      width: `${tooltipPosition.width}px`,
                      "--tooltip-arrow-left": `${tooltipPosition.arrowLeft}px`,
                    }}
                    role="tooltip"
                  >
                    {info}
                  </div>,
                  document.body
                )}
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