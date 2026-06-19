function NoResults({ mensaje = 'No se encontraron datos para esta busqueda' }) {
  return (
    <div className="feedback feedback--empty" role="status">
      <p>{mensaje}</p>
    </div>
  );
}

export default NoResults;
