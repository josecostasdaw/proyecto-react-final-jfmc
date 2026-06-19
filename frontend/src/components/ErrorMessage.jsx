function ErrorMessage({ mensaje }) {
  if (!mensaje) {
    return null;
  }

  return (
    <div className="feedback feedback--error" role="alert">
      <p>{mensaje}</p>
    </div>
  );
}

export default ErrorMessage;
