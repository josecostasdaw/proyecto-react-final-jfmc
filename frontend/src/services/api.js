const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function handleResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('El servidor no respondio correctamente. Comprueba que el backend este activo.');
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Error en la consulta');
  }

  return data;
}

export async function getProvincias() {
  const response = await fetch(`${API_BASE}/provincias`);
  const data = await handleResponse(response);
  return data.data;
}

export async function getMunicipios(provincia) {
  const url = provincia
    ? `${API_BASE}/municipios?provincia=${encodeURIComponent(provincia)}`
    : `${API_BASE}/municipios`;
  const response = await fetch(url);
  const data = await handleResponse(response);
  return data.data;
}

export async function getTiempoMunicipio(codigo) {
  const response = await fetch(`${API_BASE}/tiempo/municipio/${codigo}`);
  const data = await handleResponse(response);
  return data.data;
}

export async function getTiempoMunicipioHoraria(codigo) {
  const response = await fetch(`${API_BASE}/tiempo/municipio/${codigo}/horaria`);
  const data = await handleResponse(response);
  return data.data;
}

export async function getTiempoProvincia(codigo) {
  const response = await fetch(`${API_BASE}/tiempo/provincia/${codigo}`);
  const data = await handleResponse(response);
  return data.data;
}
