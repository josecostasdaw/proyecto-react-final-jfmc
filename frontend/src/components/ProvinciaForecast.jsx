function ProvinciaForecast({ datos }) {
  if (!datos) {
    return null;
  }

  return (
    <section className="weather-results provincia-results" aria-label="Prediccion provincial">
      <div className="weather-header">
        <h2>Provincia de {datos.nombre}</h2>
        <p className="weather-provincia">Codigo INE: {datos.codigo}</p>
      </div>

      <article className="provincia-text-block">
        <h3>Prediccion para hoy</h3>
        <pre className="provincia-text">{datos.hoy}</pre>
      </article>

      <article className="provincia-text-block">
        <h3>Prediccion para manana</h3>
        <pre className="provincia-text">{datos.manana}</pre>
      </article>
    </section>
  );
}

export default ProvinciaForecast;
