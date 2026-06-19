import { useState } from 'react';
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

function HourlyForecast({ datos, onDiaChange }) {
  const [diaIndex, setDiaIndex] = useState(0);

  if (!datos || !datos.dias || datos.dias.length === 0) {
    return null;
  }

  const diaActual = datos.dias[diaIndex] || datos.dias[0];
  const iconoPrincipal = obtenerIconoTiempo(diaActual.horas[0]?.estadoCielo);

  function cambiarDia(index) {
    setDiaIndex(index);
    onDiaChange?.(index);
  }

  return (
    <section className="weather-results hourly-results" aria-label="Prediccion horaria">
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

      {datos.dias.length > 1 && (
        <div className="day-selector" role="tablist" aria-label="Seleccionar dia">
          {datos.dias.map((dia, index) => (
            <button
              key={dia.fecha}
              type="button"
              role="tab"
              aria-selected={diaIndex === index}
              className={`day-selector-btn${diaIndex === index ? ' day-selector-btn--active' : ''}`}
              onClick={() => cambiarDia(index)}
            >
              {formatearFecha(dia.fecha)}
            </button>
          ))}
        </div>
      )}

      <h3 className="hourly-day-title">{formatearFecha(diaActual.fecha)}</h3>

      <div className="hourly-grid">
        {diaActual.horas.map((hora) => {
          const { icono, descripcion } = obtenerIconoTiempo(hora.estadoCielo);

          return (
            <article key={`${diaActual.fecha}-${hora.hora}`} className="hourly-card">
              <p className="hourly-time">{hora.hora}:00</p>
              <span className="weather-icon" role="img" aria-label={descripcion}>
                {icono}
              </span>
              <p className="hourly-temp">
                {hora.temperatura !== null ? `${hora.temperatura} C` : 'N/D'}
              </p>
              <p className="hourly-sky">{hora.estadoCielo}</p>
              <p className="hourly-meta">
                {hora.probPrecipitacion !== null ? `${hora.probPrecipitacion}% lluvia` : 'Sin datos lluvia'}
              </p>
              <p className="hourly-meta">
                {hora.vientoDireccion}
                {hora.vientoVelocidad !== null ? ` (${hora.vientoVelocidad} km/h)` : ''}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default HourlyForecast;
