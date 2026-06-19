const ICONOS_POR_ESTADO = [
  { patron: /despejado/i, icono: '☀️', descripcion: 'Cielo despejado' },
  { patron: /poco nuboso/i, icono: '🌤️', descripcion: 'Poco nuboso' },
  { patron: /intervalos nubosos/i, icono: '⛅', descripcion: 'Intervalos nubosos' },
  { patron: /nuboso con lluvia|nuboso con tormenta/i, icono: '🌧️', descripcion: 'Lluvia' },
  { patron: /nuboso con nieve/i, icono: '🌨️', descripcion: 'Nieve' },
  { patron: /tormenta/i, icono: '⛈️', descripcion: 'Tormenta' },
  { patron: /nuboso|cubierto|muy nuboso/i, icono: '☁️', descripcion: 'Nuboso' },
  { patron: /niebla|bruma|calima/i, icono: '🌫️', descripcion: 'Niebla o calima' }
];

export function obtenerIconoTiempo(estadoCielo) {
  if (!estadoCielo) {
    return { icono: '🌡️', descripcion: 'Sin datos meteorologicos' };
  }

  const coincidencia = ICONOS_POR_ESTADO.find((item) => item.patron.test(estadoCielo));

  if (coincidencia) {
    return coincidencia;
  }

  return { icono: '🌡️', descripcion: estadoCielo };
}
