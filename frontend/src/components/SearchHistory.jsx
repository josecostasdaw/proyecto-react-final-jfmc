function etiquetaModo(entrada) {
  if (entrada.modo === 'provincia') {
    return 'Provincia';
  }

  if (entrada.modo === 'codigo') {
    return 'Codigo';
  }

  return 'Municipio';
}

function etiquetaPrediccion(entrada) {
  if (entrada.modo === 'provincia') {
    return 'Texto AEMET';
  }

  return entrada.prediccion === 'horaria' ? 'Horaria' : 'Diaria';
}

function SearchHistory({ historial, onSelect, onClear }) {
  if (!historial || historial.length === 0) {
    return null;
  }

  return (
    <section className="search-history" aria-label="Historico de busquedas">
      <div className="search-history-header">
        <h2>Historico de busquedas</h2>
        <button type="button" className="search-history-clear" onClick={onClear}>
          Limpiar
        </button>
      </div>

      <ul className="search-history-list">
        {historial.map((entrada) => (
          <li key={entrada.id}>
            <button
              type="button"
              className="search-history-item"
              onClick={() => onSelect(entrada)}
            >
              <span className="search-history-title">{entrada.etiqueta}</span>
              <span className="search-history-meta">
                {etiquetaModo(entrada)} · {etiquetaPrediccion(entrada)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SearchHistory;
