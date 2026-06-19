import { useState } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import WeatherCard from './components/WeatherCard';
import { getTiempoMunicipio } from './services/api';
import './App.css';

function App() {
  const [datosTiempo, setDatosTiempo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(codigo) {
    setCargando(true);
    setError('');
    setDatosTiempo(null);

    try {
      const datos = await getTiempoMunicipio(codigo);
      setDatosTiempo(datos);
    } catch (err) {
      setError(err.message || 'No se pudo obtener la prediccion');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <SearchForm onSearch={handleSearch} disabled={cargando} />

        {cargando && <p className="info-message">Cargando datos...</p>}
        {error && <p className="error-message">{error}</p>}
        {!cargando && !error && datosTiempo && <WeatherCard datos={datosTiempo} />}
      </main>
    </div>
  );
}

export default App;
