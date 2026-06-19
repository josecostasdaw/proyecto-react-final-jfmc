const AEMET_BASE_URL = 'https://opendata.aemet.es/opendata/api';

const PERIODOS_PREFERIDOS = ['12', '12-24', '00-24', '06-12', '00-12', '18-24', '00-06'];

let municipiosCache = null;

function limpiarCacheMunicipios() {
  municipiosCache = null;
}

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

function normalizarCodigoMunicipio(municipio) {
  const id = String(municipio.id || '');

  if (id.startsWith('id')) {
    return id.slice(2);
  }

  if (municipio.id_old) {
    return String(municipio.id_old);
  }

  return id;
}

function normalizarCodigoEntrada(codigo) {
  const limpio = String(codigo || '').trim();

  if (limpio.startsWith('id')) {
    return limpio.slice(2);
  }

  return limpio;
}

async function parseAemetDatos(response) {
  const buffer = await response.arrayBuffer();
  const texto = new TextDecoder('iso-8859-1').decode(buffer);
  return JSON.parse(texto);
}

function seleccionarPeriodo(items) {
  if (!items || items.length === 0) {
    return null;
  }

  for (const periodo of PERIODOS_PREFERIDOS) {
    const encontrado = items.find((item) => String(item.periodo) === periodo);
    if (encontrado) {
      return encontrado;
    }
  }

  return items[Math.floor(items.length / 2)] || items[0];
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

  const datos = await parseAemetDatos(datosResponse);

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
    codigo: normalizarCodigoMunicipio(municipio),
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

  const periodo = seleccionarPeriodo(dia.estadoCielo);
  const codigo = Number(periodo.value);
  return periodo.descripcion || ESTADOS_CIELO[codigo] || `Estado ${periodo.value}`;
}

function obtenerTemperatura(dia, campo) {
  const temperatura = dia.temperatura;

  if (!temperatura) {
    return null;
  }

  if (!Array.isArray(temperatura)) {
    const valor = temperatura[campo];
    return valor !== undefined && valor !== '' ? Number(valor) : null;
  }

  const porId = temperatura.find((item) => item.id === campo);
  if (porId && porId.value !== undefined && porId.value !== '') {
    return Number(porId.value);
  }

  const porCampo = temperatura.find((item) => item[campo] !== undefined && item[campo] !== '');
  if (porCampo) {
    return Number(porCampo[campo]);
  }

  return null;
}

function obtenerPrecipitacion(dia) {
  if (!dia.probPrecipitacion || dia.probPrecipitacion.length === 0) {
    return null;
  }

  const periodo = seleccionarPeriodo(dia.probPrecipitacion);
  return periodo && periodo.value !== undefined ? Number(periodo.value) : null;
}

function obtenerViento(dia) {
  if (!dia.viento || dia.viento.length === 0) {
    return { direccion: 'Sin datos', velocidad: null };
  }

  const periodo = seleccionarPeriodo(dia.viento);
  return {
    direccion: periodo.direccion || 'Sin datos',
    velocidad: periodo.velocidad !== undefined ? Number(periodo.velocidad) : null
  };
}

function extraerDiasPrediccion(municipio) {
  if (!municipio || !municipio.prediccion) {
    return null;
  }

  const prediccion = Array.isArray(municipio.prediccion)
    ? municipio.prediccion[0]
    : municipio.prediccion;

  if (!prediccion || !prediccion.dia) {
    return null;
  }

  return prediccion.dia;
}

function transformarPrediccion(datos) {
  const municipio = Array.isArray(datos) ? datos[0] : datos;
  const diasRaw = extraerDiasPrediccion(municipio);

  if (!diasRaw || diasRaw.length === 0) {
    throw new Error('No se encontraron datos de prediccion para este municipio');
  }

  const dias = diasRaw.map((dia) => {
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
  getPrediccionMunicipio,
  seleccionarPeriodo,
  extraerDiasPrediccion,
  transformarPrediccion,
  normalizarCodigoMunicipio,
  normalizarCodigoEntrada,
  limpiarCacheMunicipios
};
