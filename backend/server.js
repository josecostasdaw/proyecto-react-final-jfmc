const express = require('express');
const cors = require('cors');
require('dotenv').config();

const {
  getProvincias,
  getMunicipios,
  getMunicipiosPorProvincia,
  getPrediccionMunicipio,
  getPrediccionMunicipioHoraria,
  getPrediccionProvincia,
  normalizarCodigoEntrada,
  normalizarCodigoProvincia
} = require('./services/aemetService');

const app = express();
const PORT = process.env.PORT || 3040;

function responderError(res, ruta, error, mensajeGenerico) {
  console.error(`Error en ${ruta}:`, error.message);
  const status = error.statusCode || 500;

  res.status(status).json({
    success: false,
    error: status === 429 ? error.message : mensajeGenerico
  });
}

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Backend - Aplicacion Meteorologica AEMET',
    version: '1.0.0',
    endpoints: {
      'GET /api/provincias': 'Lista de provincias de Espana',
      'GET /api/municipios': 'Lista de municipios (filtro opcional: ?provincia=30)',
      'GET /api/tiempo/municipio/:codigo': 'Prediccion diaria por codigo de municipio (ej: 30016)',
      'GET /api/tiempo/municipio/:codigo/horaria': 'Prediccion horaria por codigo de municipio',
      'GET /api/tiempo/provincia/:codigo': 'Prediccion textual hoy y manana por provincia (ej: 30)'
    }
  });
});

app.get('/api/provincias', (req, res) => {
  try {
    const provincias = getProvincias();

    res.json({
      success: true,
      total: provincias.length,
      data: provincias
    });
  } catch (error) {
    console.error('Error en /api/provincias:', error.message);
    res.status(500).json({
      success: false,
      error: 'No se pudo obtener la lista de provincias'
    });
  }
});

app.get('/api/municipios', async (req, res) => {
  try {
    const { provincia } = req.query;
    let municipios;

    if (provincia) {
      const codigoProvincia = normalizarCodigoProvincia(provincia);

      if (!/^\d{2}$/.test(codigoProvincia)) {
        return res.status(400).json({
          success: false,
          error: 'El codigo de provincia debe tener 2 digitos'
        });
      }

      municipios = await getMunicipiosPorProvincia(codigoProvincia);
    } else {
      municipios = await getMunicipios();
    }

    res.json({
      success: true,
      total: municipios.length,
      data: municipios
    });
  } catch (error) {
    responderError(res, '/api/municipios', error, 'No se pudo obtener la lista de municipios');
  }
});

app.get('/api/tiempo/municipio/:codigo/horaria', async (req, res) => {
  try {
    const codigo = normalizarCodigoEntrada(req.params.codigo);

    if (!codigo || !/^\d{5}$/.test(codigo)) {
      return res.status(400).json({
        success: false,
        error: 'El codigo de municipio debe tener 5 digitos'
      });
    }

    const prediccion = await getPrediccionMunicipioHoraria(codigo);

    if (!prediccion.dias || prediccion.dias.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron datos meteorologicos horarios para este municipio'
      });
    }

    res.json({
      success: true,
      data: prediccion
    });
  } catch (error) {
    responderError(res, '/api/tiempo/municipio/horaria', error, 'No se pudo obtener la prediccion horaria');
  }
});

app.get('/api/tiempo/municipio/:codigo', async (req, res) => {
  try {
    const codigo = normalizarCodigoEntrada(req.params.codigo);

    if (!codigo || !/^\d{5}$/.test(codigo)) {
      return res.status(400).json({
        success: false,
        error: 'El codigo de municipio debe tener 5 digitos'
      });
    }

    const prediccion = await getPrediccionMunicipio(codigo);

    if (!prediccion.dias || prediccion.dias.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron datos meteorologicos para este municipio'
      });
    }

    res.json({
      success: true,
      data: prediccion
    });
  } catch (error) {
    responderError(res, '/api/tiempo/municipio', error, 'No se pudo obtener la prediccion meteorologica');
  }
});

app.get('/api/tiempo/provincia/:codigo', async (req, res) => {
  try {
    const codigo = normalizarCodigoProvincia(req.params.codigo);

    if (!/^\d{2}$/.test(codigo)) {
      return res.status(400).json({
        success: false,
        error: 'El codigo de provincia debe tener 2 digitos'
      });
    }

    const prediccion = await getPrediccionProvincia(codigo);

    res.json({
      success: true,
      data: prediccion
    });
  } catch (error) {
    responderError(res, '/api/tiempo/provincia', error, 'No se pudo obtener la prediccion provincial');
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
