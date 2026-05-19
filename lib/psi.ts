import type { PSIResult } from './types';

const PSI_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export async function runPSI(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PSIResult | null> {
  const params = new URLSearchParams({ url, strategy, key: process.env.PSI_API_KEY! });
  // URLSearchParams doesn't support multiple same-key values cleanly, append manually
  for (const cat of ['performance', 'accessibility', 'best-practices', 'seo']) {
    params.append('category', cat);
  }

  const res = await fetch(`${PSI_BASE}?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  const cats = data.lighthouseResult?.categories;
  const auds = data.lighthouseResult?.audits;

  if (!cats || !auds) return null;

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
  };
}
