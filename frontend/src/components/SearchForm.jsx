import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getMunicipios } from '../services/api';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

const MIN_CARACTERES = 2;
const MAX_SUGERENCIAS = 10;

function SearchForm({ onSearch, disabled }) {
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

  const sugerencias = useMemo(() => {
    const texto = textoBusqueda.trim().toLowerCase();

    if (texto.length < MIN_CARACTERES) {
      return [];
    }

    return municipios
      .filter((municipio) => municipio.nombre.toLowerCase().includes(texto))
      .slice(0, MAX_SUGERENCIAS);
  }, [municipios, textoBusqueda]);

  function seleccionarMunicipio(municipio) {
    setMunicipioSeleccionado(municipio);
    setTextoBusqueda(municipio.nombre);
    setMostrarSugerencias(false);
    setIndiceActivo(-1);
    setErrorValidacion('');
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

  function handleInputFocus() {
    if (textoBusqueda.trim().length >= MIN_CARACTERES) {
      setMostrarSugerencias(true);
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
      return;
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

    onSearch(municipioSeleccionado.codigo);
  }

  const textoTrim = textoBusqueda.trim();
  const listaVisible = mostrarSugerencias && textoTrim.length >= MIN_CARACTERES;

  function renderHint() {
    if (municipioSeleccionado) {
      return null;
    }

    if (textoTrim.length === 0) {
      return <p className="input-group-hint">Escribe al menos 2 letras para buscar un municipio</p>;
    }

    if (textoTrim.length < MIN_CARACTERES) {
      return <p className="input-group-hint">Escribe al menos 2 letras para ver sugerencias</p>;
    }

    if (listaVisible && sugerencias.length === 0) {
      return <p className="input-group-hint input-group-hint--empty">No hay municipios que coincidan con tu busqueda</p>;
    }

    return null;
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
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setTimeout(() => setMostrarSugerencias(false), 150);
            }}
            disabled={disabled}
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
              disabled={disabled}
              aria-label="Limpiar busqueda"
            >
              &#10005;
            </button>
          )}

          <button
            type="submit"
            className="input-group-btn"
            disabled={disabled || !municipioSeleccionado}
            aria-label="Consultar tiempo"
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

        {renderHint()}
      </div>

      {municipioSeleccionado && (
        <div className="combobox-selected" role="status">
          <span className="combobox-selected-label">Vas a consultar:</span>
          <strong>{municipioSeleccionado.nombre}</strong>
        </div>
      )}

      {errorValidacion && <p className="form-error">{errorValidacion}</p>}
    </form>
  );
}

export default SearchForm;
