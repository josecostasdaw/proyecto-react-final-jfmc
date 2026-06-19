import { useState } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import WeatherCard from './components/WeatherCard';
import HourlyForecast from './components/HourlyForecast';
import ProvinciaForecast from './components/ProvinciaForecast';
import WeatherChart from './components/WeatherChart';
import SearchHistory from './components/SearchHistory';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import NoResults from './components/NoResults';
import useTheme from './hooks/useTheme';
import useSearchHistory from './hooks/useSearchHistory';
import {
  getTiempoMunicipio,
  getTiempoMunicipioHoraria,
  getTiempoProvincia
} from './services/api';
import './App.css';

function App() {
  const { esOscuro, toggleTema } = useTheme();
  const { obtenerHistorial, anadirEntrada, limpiarHistorial } = useSearchHistory();

  const [datosTiempo, setDatosTiempo] = useState(null);
  const [tipoResultado, setTipoResultado] = useState(null);
  const [prediccion, setPrediccion] = useState('diaria');
  const [diaSeleccionado, setDiaSeleccionado] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [sinResultados, setSinResultados] = useState(false);
  const [historial, setHistorial] = useState(() => obtenerHistorial());

  async function ejecutarBusqueda(params) {
    const { modo, codigo, etiqueta, prediccion: prediccionBusqueda } = params;

    setCargando(true);
    setError('');
    setSinResultados(false);
    setDatosTiempo(null);
    setTipoResultado(null);
    setDiaSeleccionado(0);

    try {
      let datos;
      let tipo;

      if (modo === 'provincia') {
        datos = await getTiempoProvincia(codigo);
        tipo = 'provincia-texto';

        if (!datos.hoy && !datos.manana) {
          setSinResultados(true);
          return;
        }
      } else if (prediccionBusqueda === 'horaria') {
        datos = await getTiempoMunicipioHoraria(codigo);
        tipo = 'horaria';

        if (!datos.dias || datos.dias.length === 0) {
          setSinResultados(true);
          return;
        }
      } else {
        datos = await getTiempoMunicipio(codigo);
        tipo = 'diaria';

        if (!datos.dias || datos.dias.length === 0) {
          setSinResultados(true);
          return;
        }
      }

      setDatosTiempo(datos);
      setTipoResultado(tipo);

      const historialActualizado = anadirEntrada({
        modo,
        codigo,
        etiqueta,
        prediccion: prediccionBusqueda
      });
      setHistorial(historialActualizado);
    } catch (err) {
      setError(err.message || 'No se pudo obtener la prediccion meteorologica');
    } finally {
      setCargando(false);
    }
  }

  function handleSearch(params) {
    return ejecutarBusqueda(params);
  }

  function handleHistorialSelect(entrada) {
    if (entrada.prediccion && entrada.prediccion !== prediccion) {
      setPrediccion(entrada.prediccion);
    }

    return ejecutarBusqueda({
      modo: entrada.modo,
      codigo: entrada.codigo,
      etiqueta: entrada.etiqueta,
      prediccion: entrada.prediccion
    });
  }

  function handleLimpiarHistorial() {
    limpiarHistorial();
    setHistorial([]);
  }

  const mostrarGrafica = datosTiempo && (tipoResultado === 'diaria' || tipoResultado === 'horaria');

  return (
    <div className="app">
      <Header esOscuro={esOscuro} onToggleTema={toggleTema} />

      <main className="main-content">
        <SearchForm
          onSearch={handleSearch}
          disabled={cargando}
          prediccion={prediccion}
          onPrediccionChange={setPrediccion}
        />

        <SearchHistory
          historial={historial}
          onSelect={handleHistorialSelect}
          onClear={handleLimpiarHistorial}
        />

        {cargando && <Loading />}
        {error && <ErrorMessage mensaje={error} />}
        {sinResultados && <NoResults />}

        {!cargando && !error && !sinResultados && datosTiempo && tipoResultado === 'diaria' && (
          <WeatherCard datos={datosTiempo} />
        )}

        {!cargando && !error && !sinResultados && datosTiempo && tipoResultado === 'horaria' && (
          <HourlyForecast datos={datosTiempo} onDiaChange={setDiaSeleccionado} />
        )}

        {!cargando && !error && !sinResultados && datosTiempo && tipoResultado === 'provincia-texto' && (
          <ProvinciaForecast datos={datosTiempo} />
        )}

        {!cargando && !error && !sinResultados && mostrarGrafica && (
          <WeatherChart
            datos={datosTiempo}
            tipo={tipoResultado}
            diaSeleccionado={diaSeleccionado}
          />
        )}
      </main>
    </div>
  );
}

export default App;
