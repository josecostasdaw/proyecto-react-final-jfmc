import { useEffect, useState } from 'react';
import { getProvincias } from '../services/api';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import SearchModeTabs from './search/SearchModeTabs';
import PrediccionToggle from './search/PrediccionToggle';
import MunicipioSearch from './search/MunicipioSearch';
import CodigoSearch from './search/CodigoSearch';
import ProvinciaSearch from './search/ProvinciaSearch';

function SearchForm({ onSearch, disabled, prediccion, onPrediccionChange }) {
  const [modo, setModo] = useState('municipio');
  const [provincias, setProvincias] = useState([]);
  const [provinciaFiltro, setProvinciaFiltro] = useState('');
  const [cargandoProvincias, setCargandoProvincias] = useState(true);
  const [errorProvincias, setErrorProvincias] = useState('');

  useEffect(() => {
    async function cargarProvincias() {
      try {
        const lista = await getProvincias();
        setProvincias(lista);
      } catch {
        setErrorProvincias('No se pudo cargar la lista de provincias.');
      } finally {
        setCargandoProvincias(false);
      }
    }

    cargarProvincias();
  }, []);

  function handleModoChange(nuevoModo) {
    setModo(nuevoModo);
    setProvinciaFiltro('');
  }

  function handleSearchRequest(params) {
    onSearch({
      ...params,
      prediccion: params.modo === 'provincia' ? null : prediccion
    });
  }

  if (cargandoProvincias) {
    return <Loading mensaje="Cargando datos de busqueda..." />;
  }

  if (errorProvincias) {
    return <ErrorMessage mensaje={errorProvincias} />;
  }

  const mostrarPrediccion = modo === 'municipio' || modo === 'codigo';

  return (
    <section className="search-form">
      <SearchModeTabs modo={modo} onChange={handleModoChange} disabled={disabled} />

      {mostrarPrediccion && (
        <div className="form-group">
          <span className="form-label">Tipo de prediccion</span>
          <PrediccionToggle
            prediccion={prediccion}
            onChange={onPrediccionChange}
            disabled={disabled}
          />
        </div>
      )}

      {modo === 'municipio' && (
        <MunicipioSearch
          provincias={provincias}
          provinciaFiltro={provinciaFiltro}
          onProvinciaFiltroChange={setProvinciaFiltro}
          onSearch={handleSearchRequest}
          disabled={disabled}
        />
      )}

      {modo === 'codigo' && (
        <CodigoSearch onSearch={handleSearchRequest} disabled={disabled} />
      )}

      {modo === 'provincia' && (
        <ProvinciaSearch
          provincias={provincias}
          onSearch={handleSearchRequest}
          disabled={disabled}
        />
      )}
    </section>
  );
}

export default SearchForm;
