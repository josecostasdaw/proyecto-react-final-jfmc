# Aplicacion Meteorologica - React + AEMET

Proyecto integrador DWEC: aplicacion web que consulta informacion meteorologica de Espana mediante la API de AEMET.

## Arquitectura

```
React (frontend) -> Express (backend) -> API AEMET -> Express -> React
```

El frontend nunca se comunica directamente con AEMET. La clave API solo existe en el backend.

## Requisitos

- Node.js 18 o superior
- npm
- Clave API de [OpenData AEMET](https://opendata.aemet.es/)

## Estructura del proyecto

```
proyecto-react-final-jfmc/
├── backend/          # Servidor Express + integracion AEMET
├── frontend/         # Aplicacion React (Vite)
├── docs/             # Enunciado, especificaciones y memoria
└── README.md
```

## Instalacion rapida (backend)

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tu AEMET_API_KEY
npm run dev
```

El servidor estara disponible en `http://localhost:3000`.

## Documentacion

- [Enunciado del proyecto](docs/enunciado.pdf)
- [Especificaciones de la plantilla](docs/Especificaciones.pdf)
- Memoria del proyecto: `docs/memoria.md` (disponible al finalizar el proyecto)
