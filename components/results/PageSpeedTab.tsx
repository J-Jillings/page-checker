'use client';

import type { CheckResults, PSIResult } from '@/lib/types';

function scoreBadge(score: number) {
  const color = score >= 90 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, background: `color-mix(in srgb, ${color} 15%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}>
      {score}
    </span>
  );
}

function delta(a: number | null, b: number | null) {
  if (a === null || b === null) return null;
  const d = b - a;
  if (d === 0) return <span style={{ color: 'var(--muted)', fontSize: '11px' }}>—</span>;
  return <span style={{ color: d > 0 ? 'var(--green)' : 'var(--red)', fontSize: '11px', marginLeft: '6px' }}>{d > 0 ? `▲${d}` : `▼${Math.abs(d)}`}</span>;
}

const SCORE_LABELS: Array<{ key: keyof PSIResult['scores']; label: string }> = [
  { key: 'performance',   label: 'Performance' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'bestPractices', label: 'Best Practices' },
  { key: 'seo',           label: 'SEO' },
];

const VITAL_LABELS: Array<{ key: keyof PSIResult['vitals']; label: string }> = [
  { key: 'lcp', label: 'LCP — Largest Contentful Paint' },
  { key: 'cls', label: 'CLS — Cumulative Layout Shift' },
  { key: 'tbt', label: 'TBT — Total Blocking Time' },
  { key: 'fcp', label: 'FCP — First Contentful Paint' },
  { key: 'si',  label: 'SI — Speed Index' },
];

const tableHeader = (cols: string[]) => (
  <thead>
    <tr>
      {cols.map(c => (
        <th key={c} style={{ textAlign: 'left', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{c}</th>
      ))}
    </tr>
  </thead>
);

export function PageSpeedTab({ results }: { results: CheckResults }) {
  if (results.mode === 'health') {
    const psi = results.psi;
    if (!psi) return <p style={{ color: 'var(--muted)', padding: '24px 0' }}>PageSpeed Insights data unavailable.</p>;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Scores (mobile)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {tableHeader(['Category', 'Score'])}
            <tbody>
              {SCORE_LABELS.map(({ key, label }) => (
                <tr key={key}>
                  <td style={{ padding: '9px 12px', fontSize: '13px' }}>{label}</td>
                  <td style={{ padding: '9px 12px' }}>{scoreBadge(psi.scores[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Core Web Vitals</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {tableHeader(['Metric', 'Value'])}
            <tbody>
              {VITAL_LABELS.map(({ key, label }) => (
                <tr key={key}>
                  <td style={{ padding: '9px 12px', fontSize: '13px' }}>{label}</td>
                  <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{psi.vitals[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ gridColumn: '1 / -1', fontSize: '11px', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          Scores are from Google PageSpeed Insights (mobile strategy). Results may differ slightly from a local Lighthouse run.
        </div>
      </div>
    );
  }

  // Compare mode
  const psiA = results.psi.a;
  const psiB = results.psi.b;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Scores — Live vs Test</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {tableHeader(['Category', 'Live', 'Test'])}
            <tbody>
              {SCORE_LABELS.map(({ key, label }) => (
                <tr key={key}>
                  <td style={{ padding: '9px 12px', fontSize: '13px' }}>{label}</td>
                  <td style={{ padding: '9px 12px' }}>{psiA ? scoreBadge(psiA.scores[key]) : '—'}</td>
                  <td style={{ padding: '9px 12px' }}>
                    {psiB ? scoreBadge(psiB.scores[key]) : '—'}
                    {psiA && psiB && delta(psiA.scores[key], psiB.scores[key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Core Web Vitals — Live vs Test</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {tableHeader(['Metric', 'Live', 'Test'])}
            <tbody>
              {VITAL_LABELS.map(({ key, label }) => (
                <tr key={key}>
                  <td style={{ padding: '9px 12px', fontSize: '13px' }}>{label}</td>
                  <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{psiA?.vitals[key] ?? '—'}</td>
                  <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{psiB?.vitals[key] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        Scores are from Google PageSpeed Insights (mobile strategy). Results may differ slightly from a local Lighthouse run.
      </div>
    </div>
  );
}
