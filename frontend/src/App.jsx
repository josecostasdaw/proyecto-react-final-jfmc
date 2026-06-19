import { useState } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import WeatherCard from './components/WeatherCard';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import NoResults from './components/NoResults';
import { getTiempoMunicipio } from './services/api';
import './App.css';

function App() {
  const [datosTiempo, setDatosTiempo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [sinResultados, setSinResultados] = useState(false);

  async function handleSearch(codigo) {
    setCargando(true);
    setError('');
    setSinResultados(false);
    setDatosTiempo(null);

    try {
      const datos = await getTiempoMunicipio(codigo);

      if (!datos.dias || datos.dias.length === 0) {
        setSinResultados(true);
        return;
      }

      setDatosTiempo(datos);
    } catch (err) {
      setError(err.message || 'No se pudo obtener la prediccion meteorologica');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <SearchForm onSearch={handleSearch} disabled={cargando} />

        {cargando && <Loading />}
        {error && <ErrorMessage mensaje={error} />}
        {sinResultados && <NoResults />}
        {!cargando && !error && !sinResultados && datosTiempo && (
          <WeatherCard datos={datosTiempo} />
        )}
      </main>
    </div>
  );
}

export default App;
