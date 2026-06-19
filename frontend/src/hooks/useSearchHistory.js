const STORAGE_KEY = 'meteo-historial';
const MAX_ENTRADAS = 10;

function crearId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function leerHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarHistorial(entradas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
}

function claveEntrada(entrada) {
  return `${entrada.modo}|${entrada.codigo}|${entrada.prediccion || 'texto'}`;
}

function useSearchHistory() {
  function obtenerHistorial() {
    return leerHistorial();
  }

  function anadirEntrada(entrada) {
    const actual = leerHistorial();
    const nueva = {
      id: crearId(),
      modo: entrada.modo,
      codigo: entrada.codigo,
      etiqueta: entrada.etiqueta,
      prediccion: entrada.prediccion || null,
      fecha: new Date().toISOString()
    };

    const filtradas = actual.filter((item) => claveEntrada(item) !== claveEntrada(nueva));
    const actualizadas = [nueva, ...filtradas].slice(0, MAX_ENTRADAS);
    guardarHistorial(actualizadas);
    return actualizadas;
  }

  function limpiarHistorial() {
    guardarHistorial([]);
    return [];
  }

  return {
    obtenerHistorial,
    anadirEntrada,
    limpiarHistorial
  };
}

export default useSearchHistory;
