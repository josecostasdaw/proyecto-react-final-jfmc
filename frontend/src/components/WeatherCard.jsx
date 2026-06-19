function formatearFecha(fecha) {
  const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
  return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

function WeatherCard({ datos }) {
  if (!datos) {
    return null;
  }

  return (
    <section className="weather-results" aria-label="Resultados meteorologicos">
      <div className="weather-header">
        <h2>{datos.nombre}</h2>
        {datos.provincia && <p className="weather-provincia">{datos.provincia}</p>}
        {datos.elaborado && (
          <p className="weather-elaborado">Actualizado: {datos.elaborado}</p>
        )}
      </div>

      <div className="weather-grid">
        {datos.dias.map((dia) => (
          <article key={dia.fecha} className="weather-card">
            <h3>{formatearFecha(dia.fecha)}</h3>
            <ul className="weather-details">
              <li>
                <span className="detail-label">Estado del cielo</span>
                <span className="detail-value">{dia.estadoCielo}</span>
              </li>
              <li>
                <span className="detail-label">Temp. maxima</span>
                <span className="detail-value">
                  {dia.temperaturaMax !== null ? `${dia.temperaturaMax} C` : 'N/D'}
                </span>
              </li>
              <li>
                <span className="detail-label">Temp. minima</span>
                <span className="detail-value">
                  {dia.temperaturaMin !== null ? `${dia.temperaturaMin} C` : 'N/D'}
                </span>
              </li>
              <li>
                <span className="detail-label">Precipitacion</span>
                <span className="detail-value">
                  {dia.probPrecipitacion !== null ? `${dia.probPrecipitacion}%` : 'N/D'}
                </span>
              </li>
              <li>
                <span className="detail-label">Viento</span>
                <span className="detail-value">
                  {dia.vientoDireccion}
                  {dia.vientoVelocidad !== null ? ` (${dia.vientoVelocidad} km/h)` : ''}
                </span>
              </li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WeatherCard;
