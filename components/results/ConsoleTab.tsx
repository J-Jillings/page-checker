'use client';

import { useState } from 'react';
import type { CheckResults, ConsoleError } from '@/lib/types';

function ErrorList({ errors, label }: { errors: ConsoleError[]; label: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
          padding: '12px 20px', borderBottom: open ? '1px solid var(--border)' : 'none',
          display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', fontFamily: 'var(--font-mono)',
        }}
      >
        <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '10px', color: 'var(--muted)' }}>▶</span>
        <span style={{ flex: 1, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
          {label}
        </span>
        <span style={{
          fontSize: '10px', padding: '1px 8px', borderRadius: '10px',
          background: errors.length > 0 ? 'rgba(255,51,102,0.15)' : 'rgba(0,255,150,0.12)',
          color: errors.length > 0 ? 'var(--red)' : 'var(--green)',
          border: `1px solid ${errors.length > 0 ? 'rgba(255,51,102,0.3)' : 'rgba(0,255,150,0.3)'}`,
        }}>
          {errors.length} error{errors.length !== 1 ? 's' : ''}
        </span>
      </button>

      {open && (
        <div style={{ padding: '16px 20px' }}>
          {errors.length === 0 ? (
            <div style={{ color: 'var(--green)', fontSize: '13px' }}>✓ No console errors</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {errors.map((e, i) => (
                <li key={i} style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.2)' }}>
                  <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '11px', wordBreak: 'break-all', lineHeight: 1.6 }}>
                    {e.text}
                  </div>
                  {(e.url || e.line != null) && (
                    <div style={{ marginTop: '6px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {e.url && (
                        <span style={{ fontSize: '10px', color: 'var(--accent2)', fontFamily: 'var(--font-mono)', opacity: 0.8, wordBreak: 'break-all' }}>
                          📄 {e.url}
                        </span>
                      )}
                      {e.line != null && (
                        <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                          line {e.line}{e.column != null ? `:${e.column}` : ''}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function ConsoleTab({ results }: { results: CheckResults }) {
  if (results.mode === 'health') {
    return <ErrorList errors={results.consoleErrors} label="Console Errors" />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <ErrorList errors={results.consoleErrors.a} label="Live" />
      <ErrorList errors={results.consoleErrors.b} label="Test" />
    </div>
  );
}
