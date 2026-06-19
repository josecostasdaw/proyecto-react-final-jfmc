function WeatherCard({ datos }) {
  if (!datos) {
    return null;
  }

  return (
    <section className="weather-results">
      <div className="weather-header">
        <h2>{datos.nombre}</h2>
        {datos.provincia && <p className="weather-provincia">{datos.provincia}</p>}
      </div>

      <div className="weather-grid">
        {datos.dias.map((dia) => (
          <article key={dia.fecha} className="weather-card">
            <h3>{dia.fecha}</h3>
            <p><strong>Estado del cielo:</strong> {dia.estadoCielo}</p>
            <p><strong>Temperatura max:</strong> {dia.temperaturaMax ?? 'N/D'} C</p>
            <p><strong>Temperatura min:</strong> {dia.temperaturaMin ?? 'N/D'} C</p>
            <p><strong>Precipitacion:</strong> {dia.probPrecipitacion ?? 'N/D'}%</p>
            <p><strong>Viento:</strong> {dia.vientoDireccion} {dia.vientoVelocidad ?? 'N/D'} km/h</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WeatherCard;
