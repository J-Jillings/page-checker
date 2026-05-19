'use client';

import { useState } from 'react';
import type { CheckResults, PSIResult, PSIAudit } from '@/lib/types';

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

function scoreColor(score: number | null) {
  if (score === null) return 'var(--muted)';
  return score >= 0.9 ? 'var(--green)' : score >= 0.5 ? 'var(--amber)' : 'var(--red)';
}

function AuditList({ audits, title, emptyMsg }: { audits: PSIAudit[]; title: string; emptyMsg: string }) {
  const [open, setOpen] = useState(false);

  if (audits.length === 0) {
    return (
      <div style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--green)' }}>
        ✓ {emptyMsg}
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface2)', border: 'none',
          cursor: 'pointer', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text)',
        }}
      >
        <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '10px' }}>▶</span>
        <span style={{ flex: 1 }}>{title}</span>
        <span style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '10px', background: 'rgba(255,155,61,0.15)', color: 'var(--amber)', border: '1px solid rgba(255,155,61,0.3)' }}>
          {audits.length} {audits.length === 1 ? 'item' : 'items'}
        </span>
      </button>
      {open && (
        <div style={{ background: 'var(--surface)' }}>
          {audits.map((a, i) => (
            <div key={a.id} style={{ padding: '12px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: scoreColor(a.score), flexShrink: 0, marginTop: '5px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {a.title}
                  {a.displayValue && (
                    <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{a.displayValue}</span>
                  )}
                </div>
                {a.description && (
                  <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>{a.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PSIPanel({ psi, label }: { psi: PSIResult | null; label?: string }) {
  if (!psi) return <p style={{ color: 'var(--muted)', padding: '16px 0', fontSize: '13px' }}>PageSpeed Insights data unavailable.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {label ? `Scores — ${label}` : 'Scores (mobile)'}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {tableHeader(['Category', 'Score'])}
            <tbody>
              {SCORE_LABELS.map(({ key, label: catLabel }) => (
                <tr key={key}>
                  <td style={{ padding: '9px 12px', fontSize: '13px' }}>{catLabel}</td>
                  <td style={{ padding: '9px 12px' }}>{scoreBadge(psi.scores[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Core Web Vitals</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {tableHeader(['Metric', 'Value'])}
            <tbody>
              {VITAL_LABELS.map(({ key, label: vitLabel }) => (
                <tr key={key}>
                  <td style={{ padding: '9px 12px', fontSize: '13px' }}>{vitLabel}</td>
                  <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{psi.vitals[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(psi.opportunities.length > 0 || psi.diagnostics.length > 0) && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Improvement Areas
          </div>
          <div style={{ padding: '12px' }}>
            <AuditList
              audits={psi.opportunities}
              title="⚡ Load Opportunities"
              emptyMsg="No load opportunity improvements found"
            />
            <AuditList
              audits={psi.diagnostics}
              title="🔧 Diagnostics"
              emptyMsg="No diagnostic issues found"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function PageSpeedTab({ results }: { results: CheckResults }) {
  if (results.mode === 'health') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <PSIPanel psi={results.psi} />
        <div style={{ fontSize: '11px', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          Scores from Google PageSpeed Insights (mobile strategy). May differ slightly from a local Lighthouse run.
        </div>
      </div>
    );
  }

  // Compare mode — side-by-side
  const psiA = results.psi.a;
  const psiB = results.psi.b;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Score comparison table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Scores — Live vs Test</div>
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
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Core Web Vitals — Live vs Test</div>
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

      {/* Improvement areas per URL */}
      {(psiA || psiB) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[{ psi: psiA, label: 'Live' }, { psi: psiB, label: 'Test' }].map(({ psi, label }) => (
            <div key={label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Improvement Areas — {label}
              </div>
              {psi ? (
                <div style={{ padding: '12px' }}>
                  <AuditList audits={psi.opportunities} title="⚡ Load Opportunities" emptyMsg="No opportunities found" />
                  <AuditList audits={psi.diagnostics}   title="🔧 Diagnostics"        emptyMsg="No diagnostics found" />
                </div>
              ) : (
                <p style={{ padding: '16px', color: 'var(--muted)', fontSize: '12px', margin: 0 }}>Unavailable</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: '11px', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        Scores from Google PageSpeed Insights (mobile strategy). May differ slightly from a local Lighthouse run.
      </div>
    </div>
  );
}
