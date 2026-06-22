const { PROVINCIAS, obtenerNombreProvincia } = require('../data/provincias');

const AEMET_BASE_URL = 'https://opendata.aemet.es/opendata/api';

const PERIODOS_PREFERIDOS = ['12', '12-24', '00-24', '06-12', '00-12', '18-24', '00-06'];

const AEMET_MAX_REINTENTOS = 3;
const AEMET_ESPERA_MS = 2500;

let municipiosCache = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function crearErrorAemet(mensaje, statusCode = 500) {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
}

async function ejecutarConReintentos(operacion) {
  let ultimoError;

  for (let intento = 0; intento < AEMET_MAX_REINTENTOS; intento++) {
    try {
      return await operacion();
    } catch (error) {
      ultimoError = error;
      const esLimite = error.statusCode === 429 || String(error.message).includes('429');

      if (!esLimite || intento === AEMET_MAX_REINTENTOS - 1) {
        throw error;
      }

      await sleep(AEMET_ESPERA_MS * (intento + 1));
    }
  }

  throw ultimoError;
}

function validarRespuestaAemet(response, metadata) {
  if (response.status === 429) {
    throw crearErrorAemet(
      'AEMET ha limitado las peticiones. Espera unos segundos e intentalo de nuevo.',
      429
    );
  }

  if (!response.ok) {
    throw crearErrorAemet(`Error al consultar AEMET: ${response.status}`);
  }

  if (metadata.estado === 429) {
    throw crearErrorAemet(
      'AEMET ha limitado las peticiones. Espera unos segundos e intentalo de nuevo.',
      429
    );
  }

  if (metadata.estado !== 200) {
    throw crearErrorAemet(metadata.descripcion || 'Error en la respuesta de AEMET');
  }
}

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

async function parseAemetTexto(response) {
  const buffer = await response.arrayBuffer();
  return new TextDecoder('iso-8859-1').decode(buffer);
}

async function parseAemetDatos(response) {
  const texto = await parseAemetTexto(response);
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

function esPeriodoHorarioValido(periodo) {
  const valor = String(periodo);

  if (!/^\d{1,2}$/.test(valor)) {
    return false;
  }

  const hora = Number(valor);
  return hora >= 0 && hora <= 23;
}

function coincidenPeriodoHorario(a, b) {
  return Number(a) === Number(b);
}

function obtenerPeriodosHorarios(dia) {
  const periodos = new Set();

  if (Array.isArray(dia.temperatura)) {
    dia.temperatura.forEach((item) => {
      if (item.periodo !== undefined && esPeriodoHorarioValido(item.periodo)) {
        periodos.add(String(item.periodo));
      }
    });
  }

  if (periodos.size === 0) {
    [dia.estadoCielo, dia.probPrecipitacion, dia.viento].forEach((lista) => {
      if (Array.isArray(lista)) {
        lista.forEach((item) => {
          if (item.periodo !== undefined && esPeriodoHorarioValido(item.periodo)) {
            periodos.add(String(item.periodo));
          }
        });
      }
    });
  }

  return Array.from(periodos).sort((a, b) => Number(a) - Number(b));
}

async function fetchAemet(endpoint) {
  return ejecutarConReintentos(async () => {
    const apiKey = getApiKey();
    const url = `${AEMET_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${apiKey}`;

    const response = await fetch(url);
    const metadata = await response.json();
    validarRespuestaAemet(response, metadata);

    if (!metadata.datos) {
      throw crearErrorAemet('AEMET no devolvio datos para esta consulta');
    }

    const datosResponse = await fetch(metadata.datos);

    if (datosResponse.status === 429) {
      throw crearErrorAemet(
        'AEMET ha limitado las peticiones. Espera unos segundos e intentalo de nuevo.',
        429
      );
    }

    if (!datosResponse.ok) {
      throw crearErrorAemet(`Error al obtener datos de AEMET: ${datosResponse.status}`);
    }

    const datos = await parseAemetDatos(datosResponse);

    if (!datos || (Array.isArray(datos) && datos.length === 0)) {
      throw crearErrorAemet('No hay datos disponibles para esta consulta');
    }

    return datos;
  });
}

async function fetchAemetTexto(endpoint) {
  return ejecutarConReintentos(async () => {
    const apiKey = getApiKey();
    const url = `${AEMET_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${apiKey}`;

    const response = await fetch(url);
    const metadata = await response.json();
    validarRespuestaAemet(response, metadata);

    if (!metadata.datos) {
      throw crearErrorAemet('AEMET no devolvio datos para esta consulta');
    }

    const datosResponse = await fetch(metadata.datos);

    if (datosResponse.status === 429) {
      throw crearErrorAemet(
        'AEMET ha limitado las peticiones. Espera unos segundos e intentalo de nuevo.',
        429
      );
    }

    if (!datosResponse.ok) {
      throw crearErrorAemet(`Error al obtener datos de AEMET: ${datosResponse.status}`);
    }

    const texto = await parseAemetTexto(datosResponse);

    if (!texto || texto.trim().length === 0) {
      throw crearErrorAemet('No hay datos disponibles para esta consulta');
    }

    return texto;
  });
}

function normalizarCodigoProvincia(codigo) {
  const limpio = String(codigo || '').trim();
  return limpio.padStart(2, '0');
}

function getProvincias() {
  return PROVINCIAS;
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

async function getMunicipiosPorProvincia(codigoProvincia) {
  const codigo = normalizarCodigoProvincia(codigoProvincia);
  const municipios = await getMunicipios();
  return municipios.filter((municipio) => municipio.codigo.startsWith(codigo));
}

function obtenerEstadoCieloItem(item) {
  if (!item) {
    return 'Sin datos';
  }

  const codigo = Number(item.value);
  return item.descripcion || ESTADOS_CIELO[codigo] || `Estado ${item.value}`;
}

function obtenerEstadoCielo(dia) {
  if (!dia.estadoCielo || dia.estadoCielo.length === 0) {
    return 'Sin datos';
  }

  const periodo = seleccionarPeriodo(dia.estadoCielo);
  return obtenerEstadoCieloItem(periodo);
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
    tipo: 'diaria',
    nombre: municipio.nombre,
    provincia: municipio.provincia || '',
    elaborado: municipio.elaborado || null,
    dias
  };
}

function obtenerValorPorPeriodo(items, periodo) {
  if (!items || items.length === 0) {
    return null;
  }

  const item = items.find((entry) => coincidenPeriodoHorario(entry.periodo, periodo));
  if (!item) {
    return null;
  }

  if (item.value !== undefined && item.value !== '') {
    return Number(item.value);
  }

  return null;
}

function obtenerVientoPorPeriodo(items, periodo) {
  if (!items || items.length === 0) {
    return { direccion: 'Sin datos', velocidad: null };
  }

  const item = items.find((entry) => coincidenPeriodoHorario(entry.periodo, periodo));
  if (!item) {
    return { direccion: 'Sin datos', velocidad: null };
  }

  return {
    direccion: item.direccion || 'Sin datos',
    velocidad: item.velocidad !== undefined ? Number(item.velocidad) : null
  };
}

function transformarPrediccionHoraria(datos) {
  const municipio = Array.isArray(datos) ? datos[0] : datos;
  const diasRaw = extraerDiasPrediccion(municipio);

  if (!diasRaw || diasRaw.length === 0) {
    throw new Error('No se encontraron datos de prediccion horaria para este municipio');
  }

  const dias = diasRaw.map((dia) => {
    const horas = obtenerPeriodosHorarios(dia).map((periodo) => {
      const estadoItem = Array.isArray(dia.estadoCielo)
        ? dia.estadoCielo.find((item) => coincidenPeriodoHorario(item.periodo, periodo))
        : null;
      const viento = obtenerVientoPorPeriodo(dia.viento, periodo);

      return {
        hora: String(periodo).padStart(2, '0'),
        temperatura: obtenerValorPorPeriodo(dia.temperatura, periodo),
        estadoCielo: obtenerEstadoCieloItem(estadoItem),
        probPrecipitacion: obtenerValorPorPeriodo(dia.probPrecipitacion, periodo),
        vientoDireccion: viento.direccion,
        vientoVelocidad: viento.velocidad
      };
    });

    return {
      fecha: dia.fecha,
      horas
    };
  });

  return {
    tipo: 'horaria',
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

async function getPrediccionMunicipioHoraria(codigo) {
  const datos = await fetchAemet(`/prediccion/especifica/municipio/horaria/${codigo}`);
  return transformarPrediccionHoraria(datos);
}

async function getPrediccionProvincia(codigo) {
  const codigoProvincia = normalizarCodigoProvincia(codigo);
  const nombre = obtenerNombreProvincia(codigoProvincia);

  if (!nombre) {
    throw new Error('Codigo de provincia no valido');
  }

  const hoy = await fetchAemetTexto(`/prediccion/provincia/hoy/${codigoProvincia}`);
  await sleep(500);
  const manana = await fetchAemetTexto(`/prediccion/provincia/manana/${codigoProvincia}`);

  return {
    tipo: 'provincia-texto',
    codigo: codigoProvincia,
    nombre,
    hoy,
    manana
  };
}

module.exports = {
  fetchAemet,
  fetchAemetTexto,
  getProvincias,
  getMunicipios,
  getMunicipiosPorProvincia,
  getPrediccionMunicipio,
  getPrediccionMunicipioHoraria,
  getPrediccionProvincia,
  seleccionarPeriodo,
  extraerDiasPrediccion,
  transformarPrediccion,
  transformarPrediccionHoraria,
  normalizarCodigoMunicipio,
  normalizarCodigoEntrada,
  normalizarCodigoProvincia,
  limpiarCacheMunicipios
};
