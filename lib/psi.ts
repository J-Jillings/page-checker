import type { PSIResult, PSIAudit } from './types';

const PSI_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export async function runPSI(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PSIResult | null> {
  const params = new URLSearchParams({ url, strategy, key: process.env.PSI_API_KEY! });
  for (const cat of ['performance', 'accessibility', 'best-practices', 'seo']) {
    params.append('category', cat);
  }

  const res = await fetch(`${PSI_BASE}?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  const cats = data.lighthouseResult?.categories;
  const auds = data.lighthouseResult?.audits;

  if (!cats || !auds) return null;

  const auditRefs: Array<{ id: string; group?: string }> = cats['performance']?.auditRefs ?? [];

  function getAuditGroup(group: string): PSIAudit[] {
    return auditRefs
      .filter(ref => ref.group === group)
      .map(ref => auds[ref.id])
      .filter((a): a is NonNullable<typeof a> => !!a && a.score !== null && a.score < 0.9)
      .map(a => ({
        id: a.id ?? '',
        title: a.title ?? '',
        description: (a.description ?? '').replace(/\[.*?\]\(.*?\)/g, '$1').replace(/`/g, ''),
        displayValue: a.displayValue,
        score: a.score,
      }));
  }

  return {
    scores: {
      performance:   Math.round((cats['performance']?.score    ?? 0) * 100),
      accessibility: Math.round((cats['accessibility']?.score  ?? 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
      seo:           Math.round((cats['seo']?.score            ?? 0) * 100),
    },
    vitals: {
      lcp: auds['largest-contentful-paint']?.displayValue ?? '—',
      cls: auds['cumulative-layout-shift']?.displayValue  ?? '—',
      tbt: auds['total-blocking-time']?.displayValue      ?? '—',
      fcp: auds['first-contentful-paint']?.displayValue   ?? '—',
      si:  auds['speed-index']?.displayValue              ?? '—',
    },
    opportunities: getAuditGroup('load-opportunities'),
    diagnostics:   getAuditGroup('diagnostics'),
  };
}
