'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CheckForm } from '@/components/CheckForm';
import { ProgressPanel } from '@/components/ProgressPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import type { CheckResults } from '@/lib/types';

type AppState = 'idle' | 'running' | 'results';
type Mode = 'health' | 'compare';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [mode, setMode] = useState<Mode>('health');
  const [results, setResults] = useState<CheckResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runCheck(urlA: string, urlB?: string) {
    setError(null);
    setAppState('running');

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlA, urlB }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error ?? 'Check failed');

      setResults(data.results);
      setAppState('results');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setAppState('idle');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <ThemeToggle />
      </div>

      {appState === 'idle' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '560px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #070c1a 0%, #160824 50%, #070c1a 100%)',
              border: '1px solid var(--border)',
              borderRadius: '16px 16px 0 0',
              padding: '36px 36px 28px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 70% 50%, rgba(255,0,170,0.12) 0%, rgba(0,255,213,0.06) 60%, transparent 100%)',
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent2)', marginBottom: '8px' }}>
                  QA before it ships
                </div>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '36px', fontWeight: 800, background: 'linear-gradient(135deg, #ff00aa, #00ffd5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.5px', margin: 0 }}>
                  Page Checker
                </h1>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '28px 36px 32px', boxShadow: 'var(--glow-panel)' }}>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--red)', fontSize: '13px', marginBottom: '20px' }}>
                  {error}
                </div>
              )}
              <CheckForm mode={mode} onModeChange={setMode} onSubmit={runCheck} />
            </div>
          </div>
        </div>
      )}

      {appState === 'running' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          <ProgressPanel mode={mode} />
        </div>
      )}

      {appState === 'results' && results && (
        <ResultsPanel results={results} onNewCheck={() => { setResults(null); setAppState('idle'); }} />
      )}
    </div>
  );
}
