'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem('theme');
    const initialTheme: Theme = saved === 'dark' ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    window.localStorage.setItem('theme', nextTheme);
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={toggleTheme}>
      {theme === 'light' ? 'Dark mode' : 'Light mode'}
    </button>
  );
}
