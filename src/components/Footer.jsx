import {
  Code2,
  Globe,
  Leaf,
  Server,
  BarChart3,
  Cpu,
} from "lucide-react";

const externalLinks = [
  {
    label: "UPIITA - IPN",
    description: "Sitio oficial de la unidad académica",
    href: "https://www.upiita.ipn.mx/",
    icon: <Globe size={18} />,
  },
  {
    label: "SIMAT / Aire CDMX",
    description: "Monitoreo atmosférico oficial de CDMX",
    href: "https://www.aire.cdmx.gob.mx/",
    icon: <Leaf size={18} />,
  },
  {
    label: "Repositorio Frontend",
    description: "Interfaz web del dashboard",
    href: "https://github.com/BalaSanVal/air-quality-dashboard",
    icon: <Code2 size={18} />,
  },
  {
    label: "Repositorio Backend",
    description: "API y conexión con base de datos",
    href: "https://github.com/BalaSanVal/api-air-quality",
    icon: <Code2 size={18} />,
  },
];

const technologies = [
  {
    name: "React",
    detail: "Interfaz web",
  },
  {
    name: "Vite",
    detail: "Entorno frontend",
  },
  {
    name: "FastAPI",
    detail: "API REST",
  },
  {
    name: "MariaDB / RDS",
    detail: "Base de datos",
  },
  {
    name: "Render",
    detail: "Backend cloud",
  },
  {
    name: "Leaflet",
    detail: "Mapa interactivo",
  },
  {
    name: "Chart.js",
    detail: "Gráficas",
  },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__content">
        <section className="site-footer__brand">
          <div className="site-footer__logo">
            <Cpu size={24} />
          </div>

          <div>
            <h2>Calidad de Aire UPIITA</h2>
            <p>
              Plataforma académica para la consulta, visualización y análisis de
              mediciones ambientales captadas por nodos.
            </p>
          </div>
        </section>

        <section className="site-footer__links" aria-label="Enlaces de interés">
          {externalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="site-footer__link-card"
            >
              <span className="site-footer__link-icon">{link.icon}</span>

              <span>
                <strong>{link.label}</strong>
                <small>{link.description}</small>
              </span>
            </a>
          ))}
        </section>

        <section className="site-footer__tech">
          <div className="site-footer__section-title">
            <Server size={18} />
            <h3>Tecnologías utilizadas</h3>
          </div>

          <div className="tech-stack">
            {technologies.map((technology) => (
              <span className="tech-pill" key={technology.name}>
                <BarChart3 size={14} />
                <strong>{technology.name}</strong>
                <small>{technology.detail}</small>
              </span>
            ))}
          </div>
        </section>

        <div className="site-footer__bottom">
          <p>
            © {currentYear} Proyecto académico de monitoreo de calidad del aire.
          </p>
          <p>
            Desarrollado como prototipo web para integración con nodos,
            backend API REST y base de datos en la nube.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;