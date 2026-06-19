import { useEffect, useState } from 'react';
import { getMunicipios } from '../services/api';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

function SearchForm({ onSearch, disabled }) {
  const [municipios, setMunicipios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  useEffect(() => {
    async function cargarMunicipios() {
      try {
        const lista = await getMunicipios();
        const ordenados = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        setMunicipios(ordenados);
      } catch {
        setErrorLista('No se pudo cargar la lista de municipios. Comprueba que el backend este activo.');
      } finally {
        setCargandoLista(false);
      }
    }

    cargarMunicipios();
  }, []);

  const municipiosFiltrados = municipios
    .filter((municipio) => municipio.nombre.toLowerCase().includes(filtro.toLowerCase()))
    .slice(0, 100);

  function handleSubmit(event) {
    event.preventDefault();
    setErrorValidacion('');

    if (!codigoSeleccionado) {
      setErrorValidacion('Debes seleccionar un municipio antes de buscar');
      return;
    }

    onSearch(codigoSeleccionado);
  }

  if (cargandoLista) {
    return <Loading mensaje="Cargando lista de municipios..." />;
  }

  if (errorLista) {
    return <ErrorMessage mensaje={errorLista} />;
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="filtro">Buscar municipio</label>
        <input
          id="filtro"
          type="text"
          placeholder="Escribe el nombre del municipio"
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label htmlFor="municipio">Selecciona un municipio</label>
        <select
          id="municipio"
          value={codigoSeleccionado}
          onChange={(event) => {
            setCodigoSeleccionado(event.target.value);
            setErrorValidacion('');
          }}
          disabled={disabled}
          required
        >
          <option value="">-- Elige un municipio --</option>
          {municipiosFiltrados.map((municipio) => (
            <option key={municipio.codigo} value={municipio.codigo}>
              {municipio.nombre} ({municipio.codigo})
            </option>
          ))}
        </select>
        {filtro && municipiosFiltrados.length === 0 && (
          <p className="form-hint">No hay municipios que coincidan con tu busqueda</p>
        )}
      </div>

      {errorValidacion && <p className="form-error">{errorValidacion}</p>}

      <button type="submit" disabled={disabled || !codigoSeleccionado}>
        Consultar tiempo
      </button>
    </form>
  );
}

export default SearchForm;
