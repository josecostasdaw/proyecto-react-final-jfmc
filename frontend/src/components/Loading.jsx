function Loading({ mensaje = 'Cargando datos...' }) {
  return (
    <div className="feedback feedback--loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{mensaje}</p>
    </div>
  );
}

export default Loading;
