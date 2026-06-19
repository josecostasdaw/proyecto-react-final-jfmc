import { useId, useState } from 'react';

function ProvinciaSearch({ provincias, onSearch, disabled }) {
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');
  const selectId = useId();

  function handleSubmit(event) {
    event.preventDefault();
    setErrorValidacion('');

    if (!provinciaSeleccionada) {
      setErrorValidacion('Selecciona una provincia');
      return;
    }

    const provincia = provincias.find((item) => item.codigo === provinciaSeleccionada);

    onSearch({
      modo: 'provincia',
      codigo: provinciaSeleccionada,
      etiqueta: provincia ? provincia.nombre : provinciaSeleccionada
    });
  }

  return (
    <form className="search-mode-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor={selectId}>Seleccionar provincia</label>
        <div className="input-group">
          <select
            id={selectId}
            className="input-group-field form-select-inline"
            value={provinciaSeleccionada}
            onChange={(event) => {
              setProvinciaSeleccionada(event.target.value);
              setErrorValidacion('');
            }}
            disabled={disabled}
          >
            <option value="">Elige una provincia...</option>
            {provincias.map((provincia) => (
              <option key={provincia.codigo} value={provincia.codigo}>
                {provincia.nombre}
              </option>
            ))}
          </select>
          <button type="submit" className="input-group-btn" disabled={disabled || !provinciaSeleccionada}>
            <span className="input-group-btn-text input-group-btn-text--full">Consultar tiempo</span>
            <span className="input-group-btn-text input-group-btn-text--short">Buscar</span>
          </button>
        </div>
        <p className="input-group-hint">Prediccion textual oficial de AEMET (hoy y manana)</p>
      </div>

      {errorValidacion && <p className="form-error">{errorValidacion}</p>}
    </form>
  );
}

export default ProvinciaSearch;
