import { obtenerIconoTiempo } from '../utils/weatherIcons';

function formatearFecha(fecha) {
  const [anio, mes, dia] = fecha.split('T')[0].split('-');
  const fechaLocal = new Date(Number(anio), Number(mes) - 1, Number(dia));
  return fechaLocal.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

function WeatherCard({ datos }) {
  if (!datos) {
    return null;
  }

  const iconoPrincipal = obtenerIconoTiempo(datos.dias[0]?.estadoCielo);

  return (
    <section className="weather-results" aria-label="Resultados meteorologicos">
      <div className="weather-header">
        <span className="weather-icon-large" role="img" aria-label={iconoPrincipal.descripcion}>
          {iconoPrincipal.icono}
        </span>
        <h2>{datos.nombre}</h2>
        {datos.provincia && <p className="weather-provincia">{datos.provincia}</p>}
        {datos.elaborado && (
          <p className="weather-elaborado">Actualizado: {datos.elaborado}</p>
        )}
      </div>

      <div className="weather-grid">
        {datos.dias.map((dia) => {
          const { icono, descripcion } = obtenerIconoTiempo(dia.estadoCielo);

          return (
            <article key={dia.fecha} className="weather-card">
              <div className="weather-card-top">
                <span className="weather-icon" role="img" aria-label={descripcion}>
                  {icono}
                </span>
                <h3>{formatearFecha(dia.fecha)}</h3>
              </div>
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
          );
        })}
      </div>
    </section>
  );
}

export default WeatherCard;
