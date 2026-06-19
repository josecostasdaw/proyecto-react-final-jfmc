function Header({ esOscuro, onToggleTema }) {
  return (
    <header className="header">
      <div className="header-top">
        <div>
          <h1>MeteoEspana</h1>
          <p className="header-subtitle">Consulta el tiempo en tu municipio</p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTema}
          aria-label={esOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {esOscuro ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

export default Header;
