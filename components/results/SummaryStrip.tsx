'use client';

import type { CheckResults, LayoutResult } from '@/lib/types';

function countLayoutIssues(layout: LayoutResult): number {
  return (['Mobile', 'Tablet', 'Desktop'] as const).reduce(
    (n, bp) => n + (layout[bp]?.issues?.length ?? 0), 0
  );
}

function scoreColor(score: number) {
  if (score >= 90) return 'var(--green)';
  if (score >= 50) return 'var(--amber)';
  return 'var(--red)';
}

interface CardProps {
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}

function Card({ label, value, color, sub }: CardProps) {
  return (
    <div style={{
      padding: '20px 24px',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 700, lineHeight: 1, color }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}

export function SummaryStrip({ results }: { results: CheckResults }) {
  if (results.mode === 'health') {
    const issues = countLayoutIssues(results.layout);
    const errCount = results.consoleErrors.length;
    const broken = results.links.filter(l => !l.ok).length;
    const perfScore = results.psi?.scores.performance ?? null;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border)' }}>
        <Card label="Layout Issues"  value={issues}   color={issues === 0 ? 'var(--green)' : issues < 5 ? 'var(--amber)' : 'var(--red)'} />
        <Card label="Console Errors" value={errCount}  color={errCount === 0 ? 'var(--green)' : 'var(--red)'} />
        <Card label="Broken Links"   value={broken}    color={broken === 0 ? 'var(--green)' : 'var(--red)'} />
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>PSI Performance</div>
          {perfScore !== null
            ? <div style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 700, lineHeight: 1, color: scoreColor(perfScore) }}>{perfScore}</div>
            : <div style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 700, lineHeight: 1, color: 'var(--muted)' }}>—</div>
          }
        </div>
      </div>
    );
  }

  // Compare mode
  const issuesA = countLayoutIssues(results.layout.a);
  const issuesB = countLayoutIssues(results.layout.b);
  const totalIssues = issuesA + issuesB;
  const errA = results.consoleErrors.a.length;
  const errB = results.consoleErrors.b.length;
  const brokenA = results.links.a.filter(l => !l.ok).length;
  const brokenB = results.links.b.filter(l => !l.ok).length;
  const perfA = results.psi.a?.scores.performance ?? null;
  const perfB = results.psi.b?.scores.performance ?? null;
  const perfDelta = perfA !== null && perfB !== null ? perfB - perfA : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border)' }}>
      <Card label="Layout Issues"  value={totalIssues} color={totalIssues === 0 ? 'var(--green)' : totalIssues < 5 ? 'var(--amber)' : 'var(--red)'} sub={`Live:${issuesA} / Test:${issuesB}`} />
      <Card label="Console Errors" value={`${errA}/${errB}`} color={(errA + errB) === 0 ? 'var(--green)' : 'var(--red)'} sub="Live / Test" />
      <Card label="Broken Links"   value={`${brokenA}/${brokenB}`} color={(brokenA + brokenB) === 0 ? 'var(--green)' : 'var(--red)'} sub="Live / Test" />
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>PSI Perf (Test)</div>
        {perfB !== null
          ? <>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 700, lineHeight: 1, color: scoreColor(perfB) }}>{perfB}</div>
              {perfDelta !== null && (
                <div style={{ fontSize: '12px', color: perfDelta > 0 ? 'var(--green)' : perfDelta < 0 ? 'var(--red)' : 'var(--muted)' }}>
                  {perfDelta > 0 ? `▲${perfDelta}` : perfDelta < 0 ? `▼${Math.abs(perfDelta)}` : '—'} vs live
                </div>
              )}
            </>
          : <div style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 700, lineHeight: 1, color: 'var(--muted)' }}>—</div>
        }
      </div>
    </div>
  );
}
