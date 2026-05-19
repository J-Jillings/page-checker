'use client';

import { useState } from 'react';
import type { CheckResults, Issue } from '@/lib/types';

const BREAKPOINTS = ['Mobile', 'Tablet', 'Desktop'] as const;

const SEV_CONFIG = {
  error:   { icon: '🔴', label: 'Errors',   color: 'var(--red)'    },
  warning: { icon: '🟡', label: 'Warnings', color: 'var(--amber)'  },
  info:    { icon: '🔵', label: 'Info',     color: 'var(--accent2)' },
} as const;

const TYPE_LABELS: Record<Issue['type'], string> = {
  'img-broken':        'Broken Images',
  'img-collapsed':     'Collapsed Images',
  'img-no-dimensions': 'Missing Image Dimensions',
  'overflow':          'Viewport Overflow',
  'overlap':           'Element Overlap',
  'zero-size':         'Zero-Size Elements',
};

function Chevron({ open }: { open: boolean }) {
  return (
    <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '10px', marginRight: '6px' }}>
      ▶
    </span>
  );
}

function CollapsibleSection({ title, count, color, defaultOpen = true, children }: {
  title: string; count: number; color: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '8px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface2)',
          border: 'none', cursor: 'pointer', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text)',
        }}
      >
        <Chevron open={open} />
        <span style={{ flex: 1 }}>{title}</span>
        <span style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '10px', background: `color-mix(in srgb, ${color} 15%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}>
          {count}
        </span>
      </button>
      {open && (
        <div style={{ background: 'var(--surface)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function IssueTable({ issues, showSource }: { issues: Array<Issue & { src?: string }>; showSource?: boolean }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {issues.map((issue, i) => (
          <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            {showSource && (
              <td style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}>
                <span style={{
                  display: 'inline-block', padding: '1px 7px', borderRadius: '4px',
                  fontSize: '10px', fontWeight: 700,
                  background: issue.src === 'Live' ? 'rgba(255,0,170,0.15)' : 'rgba(0,255,213,0.12)',
                  color: issue.src === 'Live' ? 'var(--accent)' : 'var(--accent2)',
                }}>
                  {issue.src}
                </span>
              </td>
            )}
            <td style={{ padding: '7px 12px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text)', wordBreak: 'break-all', maxWidth: '280px' }}>
              {issue.element}
            </td>
            <td style={{ padding: '7px 12px', fontSize: '11px', color: 'var(--muted)', wordBreak: 'break-all' }}>
              {issue.detail}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GroupedIssues({ issues, showSource }: { issues: Array<Issue & { src?: string }>; showSource?: boolean }) {
  if (issues.length === 0) {
    return (
      <div style={{ padding: '16px 20px', color: 'var(--green)', fontSize: '13px' }}>
        ✓ No layout issues detected
      </div>
    );
  }

  const bySeverity = (['error', 'warning', 'info'] as const).map(sev => ({
    sev,
    items: issues.filter(i => i.severity === sev),
  })).filter(g => g.items.length > 0);

  return (
    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {bySeverity.map(({ sev, items }) => {
        const cfg = SEV_CONFIG[sev];
        const byType = Object.entries(TYPE_LABELS).map(([type, label]) => ({
          type: type as Issue['type'],
          label,
          items: items.filter(i => i.type === type),
        })).filter(g => g.items.length > 0);

        return (
          <CollapsibleSection
            key={sev}
            title={`${cfg.icon} ${cfg.label}`}
            count={items.length}
            color={cfg.color}
            defaultOpen={sev === 'error'}
          >
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {byType.map(({ type, label, items: typeItems }) => (
                <CollapsibleSection
                  key={type}
                  title={label}
                  count={typeItems.length}
                  color={cfg.color}
                  defaultOpen={true}
                >
                  <IssueTable issues={typeItems} showSource={showSource} />
                </CollapsibleSection>
              ))}
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}

const bpWidth = { Mobile: '375px', Tablet: '768px', Desktop: '1440px' } as const;

export function VisualTab({ results }: { results: CheckResults }) {
  if (results.mode === 'health') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {BREAKPOINTS.map(bp => {
          const bpLayout = results.layout[bp];
          const issueCount = bpLayout.issues.length;

          return (
            <div key={bp} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--glow-panel)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  {bp} <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 400 }}>{bpWidth[bp]}</span>
                </h3>
                <span style={{ fontSize: '12px', color: issueCount > 0 ? 'var(--amber)' : 'var(--green)' }}>
                  {issueCount} issue{issueCount !== 1 ? 's' : ''}
                </span>
              </div>
              <GroupedIssues issues={bpLayout.issues} />
            </div>
          );
        })}
      </div>
    );
  }

  // Compare mode — screenshots + grouped issues
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {BREAKPOINTS.map(bp => {
        const imgA   = results.screenshots.a[bp];
        const imgB   = results.screenshots.b[bp];
        const diff   = results.screenshots.diff[bp];
        const pct    = diff ? parseFloat(diff.diffPercentage) : 0;
        const pctColor = pct > 5 ? 'var(--red)' : pct > 1 ? 'var(--amber)' : 'var(--green)';
        const layoutDiffs = results.layout.diffs[bp] ?? [];
        const issuesA = (results.layout.a[bp]?.issues ?? []).map(i => ({ ...i, src: 'Live' as const }));
        const issuesB = (results.layout.b[bp]?.issues ?? []).map(i => ({ ...i, src: 'Test' as const }));
        const allIssues = [...issuesA, ...issuesB];

        return (
          <div key={bp} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--glow-panel)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                {bp} <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 400 }}>{bpWidth[bp]}</span>
              </h3>
              <span style={{ fontSize: '13px', fontWeight: 700, color: pctColor }}>
                Pixel diff: {diff?.diffPercentage ?? '—'}%
              </span>
            </div>

            {/* 3-col screenshot grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              {[
                { label: 'Live', img: imgA },
                { label: 'Test', img: imgB },
                { label: 'Diff (red = changed)', img: diff?.diffBase64 },
              ].map(({ label, img }, idx) => (
                <div key={label} style={{ borderRight: idx < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ padding: '8px 14px', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>{label}</div>
                  {img
                    ? <img src={img} alt={label} style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover', objectPosition: 'top' }} />
                    : <div style={{ padding: '24px', color: 'var(--muted)', fontStyle: 'italic', fontSize: '12px' }}>Unavailable</div>
                  }
                </div>
              ))}
            </div>

            {/* Layout diffs */}
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

            {/* Grouped issues from both URLs */}
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <div style={{ padding: '10px 20px 0', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>Layout Issues</div>
              <GroupedIssues issues={allIssues} showSource />
            </div>
          </div>
        );
      })}
    </div>
  );
}
