import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getMunicipios } from '../../services/api';

const MIN_CARACTERES = 2;
const MAX_SUGERENCIAS = 10;

function MunicipioSearch({ provincias, provinciaFiltro, onProvinciaFiltroChange, onSearch, disabled }) {
  const [municipios, setMunicipios] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  const inputRef = useRef(null);
  const listboxId = useId();
  const inputId = useId();
  const provinciaId = useId();

  useEffect(() => {
    async function cargarMunicipios() {
      setCargandoLista(true);
      setErrorLista('');

      try {
        const lista = await getMunicipios(provinciaFiltro || undefined);
        const ordenados = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        setMunicipios(ordenados);
        setMunicipioSeleccionado(null);
        setTextoBusqueda('');
      } catch {
        setErrorLista('No se pudo cargar la lista de municipios.');
        setMunicipios([]);
      } finally {
        setCargandoLista(false);
      }
    }

    cargarMunicipios();
  }, [provinciaFiltro]);

  const sugerencias = useMemo(() => {
    const texto = textoBusqueda.trim().toLowerCase();

    if (texto.length < MIN_CARACTERES) {
      return [];
    }

    return municipios
      .filter((municipio) => municipio.nombre.toLowerCase().includes(texto))
      .slice(0, MAX_SUGERENCIAS);
  }, [municipios, textoBusqueda]);

  function ejecutarBusqueda(municipio) {
    if (disabled || !municipio) {
      return;
    }

    onSearch({
      modo: 'municipio',
      codigo: municipio.codigo,
      etiqueta: municipio.nombre
    });
  }

  function seleccionarMunicipio(municipio) {
    setMunicipioSeleccionado(municipio);
    setTextoBusqueda(municipio.nombre);
    setMostrarSugerencias(false);
    setIndiceActivo(-1);
    setErrorValidacion('');
    ejecutarBusqueda(municipio);
  }

  function limpiarSeleccion() {
    setMunicipioSeleccionado(null);
    setTextoBusqueda('');
    setMostrarSugerencias(false);
    setIndiceActivo(-1);
    setErrorValidacion('');
    inputRef.current?.focus();
  }

  function handleInputChange(event) {
    const valor = event.target.value;
    setTextoBusqueda(valor);
    setMostrarSugerencias(true);
    setIndiceActivo(-1);
    setErrorValidacion('');

    if (municipioSeleccionado && valor !== municipioSeleccionado.nombre) {
      setMunicipioSeleccionado(null);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' && sugerencias.length > 0) {
      event.preventDefault();
      setMostrarSugerencias(true);
      setIndiceActivo((prev) => (prev < sugerencias.length - 1 ? prev + 1 : 0));
      return;
    }

    if (event.key === 'ArrowUp' && sugerencias.length > 0) {
      event.preventDefault();
      setMostrarSugerencias(true);
      setIndiceActivo((prev) => (prev > 0 ? prev - 1 : sugerencias.length - 1));
      return;
    }

    if (event.key === 'Enter' && indiceActivo >= 0 && sugerencias.length > 0) {
      event.preventDefault();
      seleccionarMunicipio(sugerencias[indiceActivo]);
    }

    if (event.key === 'Escape') {
      setMostrarSugerencias(false);
      setIndiceActivo(-1);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrorValidacion('');

    if (!municipioSeleccionado) {
      setErrorValidacion('Selecciona un municipio de la lista antes de buscar');
      return;
    }

    ejecutarBusqueda(municipioSeleccionado);
  }

  const textoTrim = textoBusqueda.trim();
  const listaVisible = mostrarSugerencias && textoTrim.length >= MIN_CARACTERES;

  if (errorLista) {
    return <p className="form-error">{errorLista}</p>;
  }

  return (
    <form className="search-mode-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor={provinciaId}>Filtrar por provincia (opcional)</label>
        <select
          id={provinciaId}
          className="form-select"
          value={provinciaFiltro}
          onChange={(event) => onProvinciaFiltroChange(event.target.value)}
          disabled={disabled || cargandoLista}
        >
          <option value="">Todas las provincias</option>
          {provincias.map((provincia) => (
            <option key={provincia.codigo} value={provincia.codigo}>
              {provincia.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor={inputId}>Buscar municipio</label>
        <div
          className="input-group combobox"
          role="combobox"
          aria-expanded={listaVisible && sugerencias.length > 0}
          aria-haspopup="listbox"
          aria-owns={listboxId}
        >
          <span className="input-group-addon input-group-addon--start" aria-hidden="true">
            &#128269;
          </span>

          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="input-group-field"
            placeholder="Ej: Cartagena, Madrid, Valencia..."
            value={textoBusqueda}
            onChange={handleInputChange}
            onFocus={() => {
              if (textoTrim.length >= MIN_CARACTERES) {
                setMostrarSugerencias(true);
              }
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setTimeout(() => setMostrarSugerencias(false), 150);
            }}
            disabled={disabled || cargandoLista}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={
              indiceActivo >= 0 ? `${listboxId}-option-${indiceActivo}` : undefined
            }
          />

          {textoBusqueda && (
            <button
              type="button"
              className="input-group-addon input-group-clear"
              onClick={limpiarSeleccion}
              disabled={disabled || cargandoLista}
              aria-label="Limpiar busqueda"
            >
              &#10005;
            </button>
          )}

          <button
            type="submit"
            className="input-group-btn"
            disabled={disabled || cargandoLista || !municipioSeleccionado}
          >
            <span className="input-group-btn-text input-group-btn-text--full">Consultar tiempo</span>
            <span className="input-group-btn-text input-group-btn-text--short">Buscar</span>
          </button>

          {listaVisible && sugerencias.length > 0 && (
            <ul id={listboxId} className="combobox-suggestions" role="listbox">
              {sugerencias.map((municipio, index) => (
                <li
                  key={municipio.codigo}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={indiceActivo === index}
                  className={`combobox-suggestion${indiceActivo === index ? ' combobox-suggestion--active' : ''}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    seleccionarMunicipio(municipio);
                  }}
                  onMouseEnter={() => setIndiceActivo(index)}
                >
                  {municipio.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>

        {cargandoLista && <p className="input-group-hint">Cargando municipios...</p>}
        {!cargandoLista && !municipioSeleccionado && textoTrim.length === 0 && (
          <p className="input-group-hint">Escribe al menos 2 letras para buscar un municipio</p>
        )}
        {!cargandoLista && listaVisible && sugerencias.length === 0 && textoTrim.length >= MIN_CARACTERES && (
          <p className="input-group-hint input-group-hint--empty">No hay municipios que coincidan</p>
        )}
      </div>

      {errorValidacion && <p className="form-error">{errorValidacion}</p>}
    </form>
  );
}

export default MunicipioSearch;
