function formatearEtiquetaDia(fecha, index) {
  if (!fecha) {
    return `Dia ${index + 1}`;
  }

  const [anio, mes, dia] = fecha.split('T')[0].split('-');
  const fechaLocal = new Date(Number(anio), Number(mes) - 1, Number(dia));
  return fechaLocal.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
}

function DailyChart({ dias }) {
  const valores = dias.filter(
    (dia) => dia.temperaturaMax !== null || dia.temperaturaMin !== null
  );

  if (valores.length === 0) {
    return null;
  }

  const maxGlobal = Math.max(
    ...valores.map((dia) => Math.max(dia.temperaturaMax ?? 0, dia.temperaturaMin ?? 0))
  );
  const minGlobal = Math.min(
    ...valores.map((dia) => Math.min(dia.temperaturaMax ?? 0, dia.temperaturaMin ?? 0))
  );
  const rango = Math.max(maxGlobal - minGlobal, 1);

  const ancho = 640;
  const alto = 220;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = ancho - padding.left - padding.right;
  const chartH = alto - padding.top - padding.bottom;
  const barGap = chartW / valores.length;
  const barW = Math.min(36, barGap * 0.45);

  function escalaY(valor) {
    return padding.top + chartH - ((valor - minGlobal) / rango) * chartH;
  }

  return (
    <svg
      className="weather-chart-svg"
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label="Grafica de temperaturas maximas y minimas por dia"
    >
      <line
        x1={padding.left}
        y1={padding.top + chartH}
        x2={padding.left + chartW}
        y2={padding.top + chartH}
        className="weather-chart-axis"
      />

      {valores.map((dia, index) => {
        const x = padding.left + index * barGap + barGap / 2;
        const max = dia.temperaturaMax ?? dia.temperaturaMin;
        const min = dia.temperaturaMin ?? dia.temperaturaMax;
        const yMax = escalaY(max);
        const yMin = escalaY(min);
        const barHeight = Math.max(yMin - yMax, 2);

        return (
          <g key={dia.fecha || index}>
            <rect
              x={x - barW / 2}
              y={yMax}
              width={barW}
              height={barHeight}
              rx="3"
              className="weather-chart-bar"
            />
            <text x={x} y={yMax - 6} textAnchor="middle" className="weather-chart-value">
              {max} C
            </text>
            <text x={x} y={padding.top + chartH + 22} textAnchor="middle" className="weather-chart-label">
              {formatearEtiquetaDia(dia.fecha, index)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HourlyChart({ horas }) {
  const valores = horas.filter((hora) => hora.temperatura !== null);

  if (valores.length === 0) {
    return null;
  }

  const temps = valores.map((hora) => hora.temperatura);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const rango = Math.max(max - min, 1);

  const ancho = 640;
  const alto = 220;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = ancho - padding.left - padding.right;
  const chartH = alto - padding.top - padding.bottom;

  const puntos = valores.map((hora, index) => {
    const x = padding.left + (index / Math.max(valores.length - 1, 1)) * chartW;
    const y = padding.top + chartH - ((hora.temperatura - min) / rango) * chartH;
    return { x, y, hora };
  });

  const polyline = puntos.map((punto) => `${punto.x},${punto.y}`).join(' ');

  return (
    <svg
      className="weather-chart-svg"
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label="Grafica de temperatura por hora"
    >
      <line
        x1={padding.left}
        y1={padding.top + chartH}
        x2={padding.left + chartW}
        y2={padding.top + chartH}
        className="weather-chart-axis"
      />

      <polyline points={polyline} className="weather-chart-line" fill="none" />

      {puntos.map((punto) => (
        <g key={punto.hora.hora}>
          <circle cx={punto.x} cy={punto.y} r="4" className="weather-chart-point" />
          <text x={punto.x} y={padding.top + chartH + 22} textAnchor="middle" className="weather-chart-label">
            {punto.hora.hora}h
          </text>
        </g>
      ))}
    </svg>
  );
}

function WeatherChart({ datos, tipo, diaSeleccionado = 0 }) {
  if (!datos) {
    return null;
  }

  const esHoraria = tipo === 'horaria' || datos.tipo === 'horaria';
  const dia = datos.dias?.[diaSeleccionado] || datos.dias?.[0];

  return (
    <section className="weather-chart" aria-label="Visualizacion de datos meteorologicos">
      <h2 className="weather-chart-title">
        {esHoraria ? 'Temperatura por hora' : 'Temperaturas por dia'}
      </h2>
      <div className="weather-chart-scroll">
        {esHoraria && dia ? <HourlyChart horas={dia.horas} /> : <DailyChart dias={datos.dias || []} />}
      </div>
    </section>
  );
}

export default WeatherChart;
