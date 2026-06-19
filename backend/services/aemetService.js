const AEMET_BASE_URL = 'https://opendata.aemet.es/opendata/api';

let municipiosCache = null;

const ESTADOS_CIELO = {
  11: 'Despejado',
  12: 'Poco nuboso',
  13: 'Intervalos nubosos',
  14: 'Nuboso',
  15: 'Muy nuboso',
  16: 'Cubierto',
  17: 'Nubes altas',
  23: 'Intervalos nubosos con lluvia',
  24: 'Nuboso con lluvia',
  25: 'Muy nuboso con lluvia',
  26: 'Cubierto con lluvia',
  43: 'Intervalos nubosos con nieve',
  44: 'Nuboso con nieve',
  51: 'Intervalos nubosos con tormenta',
  52: 'Nuboso con tormenta',
  61: 'Niebla',
  62: 'Calima',
  63: 'Bruma',
  64: 'Bancos de niebla',
  71: 'Nubes altas con lluvia',
  72: 'Nubes altas con nieve',
  73: 'Nubes altas con tormenta',
  81: 'Calima',
  82: 'Polvo en suspension',
  83: 'Polvo en suspension',
  84: 'Niebla',
  85: 'Niebla'
};

function getApiKey() {
  const apiKey = process.env.AEMET_API_KEY;
  if (!apiKey || apiKey === 'tu_clave_aqui') {
    throw new Error('La clave de AEMET no esta configurada. Revisa el archivo .env');
  }
  return apiKey;
}

async function fetchAemet(endpoint) {
  const apiKey = getApiKey();
  const url = `${AEMET_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al consultar AEMET: ${response.status}`);
  }

  const metadata = await response.json();

  if (metadata.estado !== 200) {
    throw new Error(metadata.descripcion || 'Error en la respuesta de AEMET');
  }

  if (!metadata.datos) {
    throw new Error('AEMET no devolvio datos para esta consulta');
  }

  const datosResponse = await fetch(metadata.datos);

  if (!datosResponse.ok) {
    throw new Error(`Error al obtener datos de AEMET: ${datosResponse.status}`);
  }

  const datos = await datosResponse.json();

  if (!datos || (Array.isArray(datos) && datos.length === 0)) {
    throw new Error('No hay datos disponibles para esta consulta');
  }

  return datos;
}

async function getMunicipios() {
  if (municipiosCache) {
    return municipiosCache;
  }

  const datos = await fetchAemet('/maestro/municipios');

  municipiosCache = datos.map((municipio) => ({
    codigo: municipio.id,
    nombre: municipio.nombre,
    latitud: municipio.latitud_dec,
    longitud: municipio.longitud_dec
  }));

  return municipiosCache;
}

function obtenerEstadoCielo(dia) {
  if (!dia.estadoCielo || dia.estadoCielo.length === 0) {
    return 'Sin datos';
  }

  const periodo = dia.estadoCielo.find((e) => e.periodo === '12') || dia.estadoCielo[0];
  const codigo = Number(periodo.value);
  return periodo.descripcion || ESTADOS_CIELO[codigo] || `Estado ${periodo.value}`;
}

function obtenerTemperatura(dia, campo) {
  if (!dia.temperatura) {
    return null;
  }
  const valor = dia.temperatura[campo];
  return valor !== undefined ? Number(valor) : null;
}

function obtenerPrecipitacion(dia) {
  if (!dia.probPrecipitacion || dia.probPrecipitacion.length === 0) {
    return null;
  }

  const periodo = dia.probPrecipitacion.find((p) => p.periodo === '12') || dia.probPrecipitacion[0];
  return periodo.value !== undefined ? Number(periodo.value) : null;
}

function obtenerViento(dia) {
  if (!dia.viento || dia.viento.length === 0) {
    return { direccion: 'Sin datos', velocidad: null };
  }

  const periodo = dia.viento.find((v) => v.periodo === '12') || dia.viento[0];
  return {
    direccion: periodo.direccion || 'Sin datos',
    velocidad: periodo.velocidad !== undefined ? Number(periodo.velocidad) : null
  };
}

function transformarPrediccion(datos) {
  const municipio = Array.isArray(datos) ? datos[0] : datos;

  if (!municipio || !municipio.prediccion || !municipio.prediccion.dia) {
    throw new Error('No se encontraron datos de prediccion para este municipio');
  }

  const dias = municipio.prediccion.dia.map((dia) => {
    const viento = obtenerViento(dia);

    return {
      fecha: dia.fecha,
      estadoCielo: obtenerEstadoCielo(dia),
      temperaturaMax: obtenerTemperatura(dia, 'maxima'),
      temperaturaMin: obtenerTemperatura(dia, 'minima'),
      probPrecipitacion: obtenerPrecipitacion(dia),
      vientoDireccion: viento.direccion,
      vientoVelocidad: viento.velocidad
    };
  });

  return {
    nombre: municipio.nombre,
    provincia: municipio.provincia || '',
    elaborado: municipio.elaborado || null,
    dias
  };
}

async function getPrediccionMunicipio(codigo) {
  const datos = await fetchAemet(`/prediccion/especifica/municipio/diaria/${codigo}`);
  return transformarPrediccion(datos);
}

module.exports = {
  fetchAemet,
  getMunicipios,
  getPrediccionMunicipio
};
