const MODOS = [
  { id: 'municipio', label: 'Municipio' },
  { id: 'codigo', label: 'Codigo' },
  { id: 'provincia', label: 'Provincia' }
];

function SearchModeTabs({ modo, onChange, disabled }) {
  return (
    <div className="search-mode-tabs" role="tablist" aria-label="Tipo de busqueda">
      {MODOS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={modo === item.id}
          className={`search-mode-tab${modo === item.id ? ' search-mode-tab--active' : ''}`}
          onClick={() => onChange(item.id)}
          disabled={disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default SearchModeTabs;
