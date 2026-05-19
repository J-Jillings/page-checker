'use client';

import type { CheckResults } from '@/lib/types';

function ErrorList({ errors, label }: { errors: string[]; label: string }) {
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label} ({errors.length} error{errors.length !== 1 ? 's' : ''})
      </div>
      <div style={{ padding: '16px 20px' }}>
        {errors.length === 0
          ? <div style={{ color: 'var(--green)', fontSize: '13px' }}>✓ No console errors</div>
          : <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {errors.map((e, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '11px', wordBreak: 'break-all', lineHeight: 1.5 }}>{e}</li>
              ))}
            </ul>
        }
      </div>
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
