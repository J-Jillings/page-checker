'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'neon' | 'calm'>('neon');

  useEffect(() => {
    const saved = localStorage.getItem('page-checker-theme') as 'neon' | 'calm' | null;
    if (saved) apply(saved);
  }, []);

  function apply(t: 'neon' | 'calm') {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t === 'calm' ? 'calm' : '');
    localStorage.setItem('page-checker-theme', t);
  }

  return (
    <button
      onClick={() => apply(theme === 'neon' ? 'calm' : 'neon')}
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        borderRadius: '8px',
        padding: '6px 14px',
        fontSize: '12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
      }}
    >
      {theme === 'neon' ? '⚡ Neon' : '🌤 Calm'}
    </button>
  );
}
