'use client';

import { useState } from 'react';

interface Props {
  mode: 'health' | 'compare';
  onModeChange: (mode: 'health' | 'compare') => void;
  onSubmit: (urlA: string, urlB?: string) => void;
}

const inputStyle = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: '13px',
  fontFamily: 'var(--font-mono)',
  transition: 'border-color 0.2s',
};

export function CheckForm({ mode, onModeChange, onSubmit }: Props) {
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!urlA.trim()) return;
    onSubmit(urlA.trim(), mode === 'compare' ? urlB.trim() || undefined : undefined);
  }

  const pillBase = {
    padding: '6px 18px',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.15s',
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => onModeChange('health')}
          style={{
            ...pillBase,
            background: mode === 'health' ? 'rgba(255,0,170,0.15)' : 'transparent',
            color: mode === 'health' ? 'var(--accent)' : 'var(--muted)',
            borderColor: mode === 'health' ? 'var(--accent)' : 'var(--border)',
            fontWeight: mode === 'health' ? 700 : 400,
            boxShadow: mode === 'health' ? 'var(--glow-accent)' : 'none',
          }}
        >
          Health Check
        </button>
        <button
          type="button"
          onClick={() => onModeChange('compare')}
          style={{
            ...pillBase,
            background: mode === 'compare' ? 'rgba(0,255,213,0.15)' : 'transparent',
            color: mode === 'compare' ? 'var(--accent2)' : 'var(--muted)',
            borderColor: mode === 'compare' ? 'var(--accent2)' : 'var(--border)',
            fontWeight: mode === 'compare' ? 700 : 400,
            boxShadow: mode === 'compare' ? 'var(--glow-teal)' : 'none',
          }}
        >
          Comparison
        </button>
      </div>

      {/* URL inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
            {mode === 'compare' ? 'Live URL' : 'URL'}
          </label>
          <input
            type="url"
            placeholder="https://example.com"
            value={urlA}
            onChange={e => setUrlA(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {mode === 'compare' && (
          <div>
            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
              Test URL
            </label>
            <input
              type="url"
              placeholder="https://staging.example.com"
              value={urlB}
              onChange={e => setUrlB(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #ff00aa, #cc0088)',
          border: '1px solid #ff00aa',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          letterSpacing: '1.5px',
          transition: 'opacity 0.15s, box-shadow 0.15s',
          boxShadow: '0 0 12px rgba(255,0,170,0.4)',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,170,0.65)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.boxShadow = '0 0 12px rgba(255,0,170,0.4)'; }}
      >
        RUN CHECK
      </button>
    </form>
  );
}
