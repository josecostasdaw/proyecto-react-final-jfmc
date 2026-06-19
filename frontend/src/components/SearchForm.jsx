import { useEffect, useState } from 'react';
import { getMunicipios } from '../services/api';

function SearchForm({ onSearch, disabled }) {
  const [municipios, setMunicipios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState('');

  useEffect(() => {
    async function cargarMunicipios() {
      try {
        const lista = await getMunicipios();
        const ordenados = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        setMunicipios(ordenados);
      } catch (error) {
        setErrorLista('No se pudo cargar la lista de municipios');
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
    if (codigoSeleccionado) {
      onSearch(codigoSeleccionado);
    }
  }

  if (cargandoLista) {
    return <p className="info-message">Cargando municipios...</p>;
  }

  if (errorLista) {
    return <p className="error-message">{errorLista}</p>;
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="filtro">Buscar municipio</label>
        <input
          id="filtro"
          type="text"
          placeholder="Escribe el nombre del municipio"
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="municipio">Selecciona un municipio</label>
        <select
          id="municipio"
          value={codigoSeleccionado}
          onChange={(event) => setCodigoSeleccionado(event.target.value)}
        >
          <option value="">-- Elige un municipio --</option>
          {municipiosFiltrados.map((municipio) => (
            <option key={municipio.codigo} value={municipio.codigo}>
              {municipio.nombre} ({municipio.codigo})
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={disabled || !codigoSeleccionado}>
        Consultar tiempo
      </button>
    </form>
  );
}

export default SearchForm;
