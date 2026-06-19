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
├── package.json      # Scripts de ayuda en la raiz
└── README.md
```

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/josecostasdaw/proyecto-react-final-jfmc.git
cd proyecto-react-final-jfmc
```

### 2. Instalar dependencias

```bash
npm install
npm run install:all
```

O manualmente:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configurar variables de entorno

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env` y anadir tu clave AEMET:

```env
PORT=3040
AEMET_API_KEY=tu_clave_real_aqui
```

**Importante:** No subas el archivo `.env` a Git.

## Ejecucion

**Opcion rapida (backend + frontend a la vez):**

```bash
npm run dev
```

**O en dos terminales separadas:**

**Terminal 1 - Backend:**

```bash
npm run dev:backend
```

Servidor en `http://localhost:3040`

**Terminal 2 - Frontend:**

```bash
npm run dev:frontend
```

Aplicacion en `http://localhost:5173`

> Si necesitas otro puerto, cambia `PORT` en `backend/.env` y actualiza el proxy en `frontend/vite.config.js`.

## Produccion

Para compilar el frontend:

```bash
npm run build:frontend
```

Si el frontend y el backend estan en dominios distintos, configura `frontend/.env`:

```env
VITE_API_BASE=http://localhost:3040/api
```

## Endpoints del backend

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Informacion de la API |
| GET | `/api/provincias` | Lista de provincias (codigo INE) |
| GET | `/api/municipios` | Lista de municipios (`?provincia=30` opcional) |
| GET | `/api/tiempo/municipio/:codigo` | Prediccion diaria (ej: 30016) |
| GET | `/api/tiempo/municipio/:codigo/horaria` | Prediccion horaria por municipio |
| GET | `/api/tiempo/provincia/:codigo` | Prediccion textual hoy y manana (ej: 30) |

## Funcionalidades

- Tres modos de busqueda: municipio (combobox), codigo INE y provincia
- Prediccion diaria y horaria para municipios
- Filtro de municipios por provincia
- Historico de busquedas (localStorage, max. 10)
- Graficas SVG de temperaturas (diaria y horaria)
- Estados de carga, error y sin resultados
- Diseno responsive (movil y escritorio)
- Iconos meteorologicos segun estado del cielo
- Modo oscuro con preferencia guardada

## Documentacion

- [Enunciado del proyecto](docs/enunciado.pdf)
- [Especificaciones de la plantilla](docs/Especificaciones.pdf)
- [Memoria del proyecto (Markdown)](docs/memoria.md)
- [Memoria del proyecto (PDF)](docs/memoria.pdf)

## Autor

Proyecto realizado por Jose Francisco Martinez Costas - 2o DAM (DWEC)
