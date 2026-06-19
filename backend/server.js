const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getMunicipios, getPrediccionMunicipio } = require('./services/aemetService');

const app = express();
const PORT = process.env.PORT || 3040;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Backend - Aplicacion Meteorologica AEMET',
    version: '1.0.0',
    endpoints: {
      'GET /api/municipios': 'Lista de municipios de Espana',
      'GET /api/tiempo/municipio/:codigo': 'Prediccion diaria por codigo de municipio (ej: 30016)'
    }
  });
});

app.get('/api/municipios', async (req, res) => {
  try {
    const municipios = await getMunicipios();

    res.json({
      success: true,
      total: municipios.length,
      data: municipios
    });
  } catch (error) {
    console.error('Error en /api/municipios:', error.message);
    res.status(500).json({
      success: false,
      error: 'No se pudo obtener la lista de municipios'
    });
  }
});

app.get('/api/tiempo/municipio/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

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
    console.error('Error en /api/tiempo/municipio:', error.message);
    res.status(500).json({
      success: false,
      error: 'No se pudo obtener la prediccion meteorologica'
    });
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
