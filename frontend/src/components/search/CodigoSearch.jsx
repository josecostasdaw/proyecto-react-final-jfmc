import { useId, useState } from 'react';

function CodigoSearch({ onSearch, disabled }) {
  const [codigo, setCodigo] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');
  const inputId = useId();

  function handleSubmit(event) {
    event.preventDefault();
    setErrorValidacion('');

    const limpio = codigo.trim();

    if (!limpio) {
      setErrorValidacion('Introduce un codigo de municipio');
      return;
    }

    if (!/^\d{5}$/.test(limpio)) {
      setErrorValidacion('El codigo debe tener exactamente 5 digitos');
      return;
    }

    onSearch({
      modo: 'codigo',
      codigo: limpio,
      etiqueta: `Codigo ${limpio}`
    });
  }

  return (
    <form className="search-mode-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor={inputId}>Codigo de municipio (5 digitos)</label>
        <div className="input-group">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            className="input-group-field"
            placeholder="Ej: 30016"
            value={codigo}
            onChange={(event) => {
              setCodigo(event.target.value.replace(/\D/g, '').slice(0, 5));
              setErrorValidacion('');
            }}
            disabled={disabled}
          />
          <button type="submit" className="input-group-btn" disabled={disabled || codigo.length !== 5}>
            <span className="input-group-btn-text input-group-btn-text--full">Consultar tiempo</span>
            <span className="input-group-btn-text input-group-btn-text--short">Buscar</span>
          </button>
        </div>
        <p className="input-group-hint">Ejemplo: 30016 (Cartagena), 28079 (Madrid)</p>
      </div>

      {errorValidacion && <p className="form-error">{errorValidacion}</p>}
    </form>
  );
}

export default CodigoSearch;
