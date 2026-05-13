import { BarChart3, ChevronDown, Home, Map, Gauge } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__content" aria-label="Navegación principal">
        <a className="navbar__link navbar__link--active" href="#inicio">
          <Home size={18} />
          <span>Inicio</span>
        </a>

        <div className="navbar__dropdown">
          <button className="navbar__link navbar__dropdown-button" type="button">
            <Gauge size={18} />
            <span>Mediciones</span>
            <ChevronDown size={15} />
          </button>

          <div className="navbar__dropdown-menu">
            <a href="#mediciones-interiores">Mediciones interiores</a>
            <a href="#mediciones-exteriores">Mediciones exteriores</a>
          </div>
        </div>

        <a className="navbar__link" href="#mapa">
          <Map size={18} />
          <span>Mapa</span>
        </a>

        <a className="navbar__link" href="#graficos">
          <BarChart3 size={18} />
          <span>Gráficos y Análisis</span>
        </a>
      </nav>
    </header>
  );
}

export default Navbar;