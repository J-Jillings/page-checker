'use client';

import type { CheckResults } from '@/lib/types';

const BREAKPOINTS = ['Mobile', 'Tablet', 'Desktop'] as const;

function severityIcon(sev: string) {
  return sev === 'error' ? '🔴' : sev === 'warning' ? '🟡' : '🔵';
}

export function VisualTab({ results }: { results: CheckResults }) {
  if (results.mode === 'health') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {BREAKPOINTS.map(bp => {
          const img = results.screenshots[bp];
          const bpLayout = results.layout[bp];

          return (
            <div key={bp} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  {bp} <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 400 }}>
                    {bp === 'Mobile' ? '375px' : bp === 'Tablet' ? '768px' : '1440px'}
                  </span>
                </h3>
                <span style={{ fontSize: '12px', color: bpLayout.issues.length > 0 ? 'var(--amber)' : 'var(--green)' }}>
                  {bpLayout.issues.length} issue{bpLayout.issues.length !== 1 ? 's' : ''}
                </span>
              </div>

              {img && <img src={img} alt={`${bp} screenshot`} style={{ width: '100%', display: 'block', maxHeight: '600px', objectFit: 'cover', objectPosition: 'top' }} />}

              {bpLayout.issues.length > 0 && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Layout Issues</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['', 'Element', 'Detail'].map(h => (
                          <th key={h} style={{ textAlign: 'left', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bpLayout.issues.map((issue, i) => (
                        <tr key={i}>
                          <td style={{ padding: '7px 8px', fontSize: '14px' }}>{severityIcon(issue.severity)}</td>
                          <td style={{ padding: '7px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text)', wordBreak: 'break-all' }}>{issue.element}</td>
                          <td style={{ padding: '7px 8px', fontSize: '11px', color: 'var(--muted)' }}>{issue.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Compare mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {BREAKPOINTS.map(bp => {
        const imgA   = results.screenshots.a[bp];
        const imgB   = results.screenshots.b[bp];
        const diff   = results.screenshots.diff[bp];
        const pct    = diff ? parseFloat(diff.diffPercentage) : 0;
        const pctColor = pct > 5 ? 'var(--red)' : pct > 1 ? 'var(--amber)' : 'var(--green)';
        const layoutDiffs = results.layout.diffs[bp] ?? [];
        const issuesA = results.layout.a[bp]?.issues ?? [];
        const issuesB = results.layout.b[bp]?.issues ?? [];

        return (
          <div key={bp} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                {bp} <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 400 }}>
                  {bp === 'Mobile' ? '375px' : bp === 'Tablet' ? '768px' : '1440px'}
                </span>
              </h3>
              <span style={{ fontSize: '13px', fontWeight: 700, color: pctColor }}>Pixel diff: {diff?.diffPercentage ?? '—'}%</span>
            </div>

            {/* 3-col screenshot grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              {[
                { label: 'Live', img: imgA },
                { label: 'Test', img: imgB },
                { label: 'Diff (red = changed)', img: diff?.diffBase64 },
              ].map(({ label, img }) => (
                <div key={label} style={{ borderRight: label !== 'Diff (red = changed)' ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ padding: '8px 14px', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>{label}</div>
                  {img
                    ? <img src={img} alt={label} style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover', objectPosition: 'top' }} />
                    : <div style={{ padding: '24px', color: 'var(--muted)', fontStyle: 'italic', fontSize: '12px' }}>Unavailable</div>
                  }
                </div>
              ))}
            </div>

            {/* Layout diffs table */}
            {layoutDiffs.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Element Size & Position Changes</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Element', 'Live (w×h)', 'Test (w×h)', 'Delta'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {layoutDiffs.map((d, i) => (
                      <tr key={i}>
                        <td style={{ padding: '7px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{d.element}</td>
                        <td style={{ padding: '7px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{d.a.w}×{d.a.h} <span style={{ color: 'var(--muted)' }}>top:{d.a.top}</span></td>
                        <td style={{ padding: '7px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{d.b.w}×{d.b.h} <span style={{ color: 'var(--muted)' }}>top:{d.b.top}</span></td>
                        <td style={{ padding: '7px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>
                          {d.wDiff > 0 ? `±${d.wDiff}w ` : ''}{d.hDiff > 0 ? `±${d.hDiff}h ` : ''}{d.yDiff > 20 ? `±${d.yDiff}y` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Issues from both */}
            {(issuesA.length > 0 || issuesB.length > 0) && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Layout Issues</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['', 'Source', 'Element', 'Detail'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...issuesA.map(i => ({ ...i, src: 'Live' })), ...issuesB.map(i => ({ ...i, src: 'Test' }))].map((issue, i) => (
                      <tr key={i}>
                        <td style={{ padding: '7px 8px', fontSize: '14px' }}>{severityIcon(issue.severity)}</td>
                        <td style={{ padding: '7px 8px' }}>
                          <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: issue.src === 'Live' ? 'rgba(56,189,248,0.15)' : 'rgba(167,139,250,0.15)', color: issue.src === 'Live' ? 'var(--accent)' : 'var(--accent2)' }}>{issue.src}</span>
                        </td>
                        <td style={{ padding: '7px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{issue.element}</td>
                        <td style={{ padding: '7px 8px', fontSize: '11px', color: 'var(--muted)' }}>{issue.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
