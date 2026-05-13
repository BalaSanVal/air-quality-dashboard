import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  Home,
  Map,
  Gauge,
  Menu,
  X,
} from "lucide-react";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMeasurementsOpen, setIsMeasurementsOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setIsMeasurementsOpen(false);
  }

  return (
    <header className="navbar">
      <nav className="navbar__content" aria-label="Navegación principal">
        <a
          className="navbar__brand"
          href="#inicio"
          onClick={closeMobileMenu}
        >
          Calidad de Aire UPIITA
        </a>

        <button
          className="navbar__toggle"
          type="button"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div
          className={`navbar__links ${
            isMobileMenuOpen ? "navbar__links--open" : ""
          }`}
        >
          <a
            className="navbar__link navbar__link--active"
            href="#inicio"
            onClick={closeMobileMenu}
          >
            <Home size={18} />
            <span>Inicio</span>
          </a>

          <div className="navbar__dropdown">
            <button
                className="navbar__link navbar__dropdown-button"
                type="button"
                aria-expanded={isMeasurementsOpen}
                onClick={() =>
                    setIsMeasurementsOpen((currentValue) => !currentValue)
                }
                >
                <Gauge size={18} />
                <span>Mediciones</span>
                <ChevronDown
                    size={15}
                    className={isMeasurementsOpen ? "navbar__chevron--open" : ""}
                />
            </button>

            <div className={`navbar__dropdown-menu ${isMeasurementsOpen ? "navbar__dropdown-menu--open" : ""}`}>
              <a href="#mediciones-interiores" onClick={closeMobileMenu}>
                Mediciones interiores
              </a>
              <a href="#mediciones-exteriores" onClick={closeMobileMenu}>
                Mediciones exteriores
              </a>
            </div>
          </div>

          <a className="navbar__link" href="#mapa" onClick={closeMobileMenu}>
            <Map size={18} />
            <span>Mapa</span>
          </a>

          <a
            className="navbar__link"
            href="#graficos"
            onClick={closeMobileMenu}
          >
            <BarChart3 size={18} />
            <span>Gráficos y Análisis</span>
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;