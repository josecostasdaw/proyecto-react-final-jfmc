const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Backend - Aplicacion Meteorologica AEMET',
    version: '1.0.0',
    endpoints: {
      '/api/municipios': 'Lista de municipios (disponible en fase 2)',
      '/api/tiempo/municipio/:codigo': 'Prediccion por municipio (disponible en fase 2)'
    }
  });
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
