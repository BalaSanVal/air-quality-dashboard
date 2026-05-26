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
import { NavLink } from "react-router-dom";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMeasurementsOpen, setIsMeasurementsOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setIsMeasurementsOpen(false);
  }

  return (
    <header className="navbar">
      <nav className="navbar__container">
        <button
          className="navbar__toggle"
          type="button"
          onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
          aria-label="Abrir menú de navegación"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div
          className={`navbar__links ${
            isMobileMenuOpen ? "navbar__links--open" : ""
          }`}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
            onClick={closeMobileMenu}
          >
            <Home size={17} />
            Inicio
          </NavLink>

          <div className="navbar__dropdown">
            <button
              className="navbar__link navbar__dropdown-button"
              type="button"
              onClick={() =>
                setIsMeasurementsOpen((currentValue) => !currentValue)
              }
            >
              <Gauge size={17} />
              Mediciones
              <ChevronDown size={15} />
            </button>

            <div
              className={`navbar__dropdown-menu ${
                isMeasurementsOpen ? "navbar__dropdown-menu--open" : ""
              }`}
            >
              <NavLink
                to="/mediciones/interiores"
                className="navbar__dropdown-item"
                onClick={closeMobileMenu}
              >
                Mediciones interiores
              </NavLink>

              <NavLink
                to="/mediciones/exteriores"
                className="navbar__dropdown-item"
                onClick={closeMobileMenu}
              >
                Mediciones exteriores
              </NavLink>
            </div>
          </div>

          <NavLink
            to="/mapa"
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
            onClick={closeMobileMenu}
          >
            <Map size={17} />
            Mapa
          </NavLink>

          <NavLink
            to="/graficas"
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
            onClick={closeMobileMenu}
          >
            <BarChart3 size={17} />
            Gráficos y Análisis
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;