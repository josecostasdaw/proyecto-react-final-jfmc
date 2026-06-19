import { useEffect, useState } from 'react';

const THEME_KEY = 'meteo-theme';

function useTheme() {
  const [tema, setTema] = useState(() => {
    const guardado = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', guardado);
    return guardado;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem(THEME_KEY, tema);
  }, [tema]);

  function toggleTema() {
    setTema((actual) => (actual === 'light' ? 'dark' : 'light'));
  }

  return { tema, toggleTema, esOscuro: tema === 'dark' };
}

export default useTheme;
