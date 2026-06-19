function PrediccionToggle({ prediccion, onChange, disabled }) {
  return (
    <div className="prediccion-toggle" role="group" aria-label="Tipo de prediccion">
      <button
        type="button"
        className={`prediccion-toggle-btn${prediccion === 'diaria' ? ' prediccion-toggle-btn--active' : ''}`}
        onClick={() => onChange('diaria')}
        disabled={disabled}
        aria-pressed={prediccion === 'diaria'}
      >
        Diaria
      </button>
      <button
        type="button"
        className={`prediccion-toggle-btn${prediccion === 'horaria' ? ' prediccion-toggle-btn--active' : ''}`}
        onClick={() => onChange('horaria')}
        disabled={disabled}
        aria-pressed={prediccion === 'horaria'}
      >
        Horaria
      </button>
    </div>
  );
}

export default PrediccionToggle;
