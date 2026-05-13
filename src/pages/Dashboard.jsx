import { useEffect, useState } from "react";
import { getLatestMeasurement } from "../api/measurements";

function Dashboard() {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLatestMeasurement() {
      try {
        const data = await getLatestMeasurement();
        setLatest(data);
      } catch (error) {
        setErrorMessage("No se pudieron cargar los datos de la API.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadLatestMeasurement();
  }, []);

  if (loading) {
    return <main className="page">Cargando datos...</main>;
  }

  if (errorMessage) {
    return <main className="page">{errorMessage}</main>;
  }

  return (
    <main className="page">
      <h1>Calidad de Aire UPIITA</h1>
      <p>Última medición recibida desde la API.</p>

      <pre className="debug-box">
        {JSON.stringify(latest, null, 2)}
      </pre>
    </main>
  );
}

export default Dashboard;