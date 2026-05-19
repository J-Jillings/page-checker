import type { CheckResults, LayoutResult, PSIResult, LinkResult, BreakpointLayout } from './types';

const BREAKPOINTS = ['Mobile', 'Tablet', 'Desktop'] as const;

function scoreColor(score: number) {
  if (score >= 90) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function scoreBadge(score: number) {
  const c = scoreColor(score);
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700;background:${c}20;color:${c};border:1px solid ${c}40">${score}</span>`;
}

function sevIcon(sev: string) {
  return sev === 'error' ? '🔴' : sev === 'warning' ? '🟡' : '🔵';
}

const BASE_STYLES = `
<style>
:root{--bg:#0a0e1a;--surface:#111827;--surface2:#1a2235;--border:#1f2d45;--text:#e2e8f0;--muted:#64748b;--accent:#38bdf8;--accent2:#a78bfa;--green:#22c55e;--amber:#f59e0b;--red:#ef4444}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:'Space Mono',monospace;font-size:13px;line-height:1.6}
.report-header{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%);border-bottom:1px solid var(--border);padding:40px;position:relative;overflow:hidden}
.report-header::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(56,189,248,0.08) 0%,transparent 70%)}
.report-header h1{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:#fff;position:relative;margin-bottom:4px}
.subtitle{color:var(--accent);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;position:relative}
.url-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:900px;position:relative}
.url-box{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 16px}
.url-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
.url-val{color:var(--accent);font-size:12px;word-break:break-all}
.url-box.test .url-val{color:#a78bfa}
.meta{color:var(--muted);font-size:11px;margin-top:14px;position:relative}
.summary-strip{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--border)}
.s-item{padding:20px 24px;border-right:1px solid var(--border)}
.s-item:last-child{border-right:none}
.s-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:4px}
.s-val{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;line-height:1}
.tab-nav{display:flex;border-bottom:1px solid var(--border);background:var(--surface);padding:0 40px;position:sticky;top:0;z-index:100}
.tab-btn{background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);cursor:pointer;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px;padding:14px 20px;text-transform:uppercase}
.tab-btn.active{color:var(--accent);border-bottom-color:var(--accent)}
.tab-panel{display:none;padding:40px;max-width:1600px;margin:0 auto}
.tab-panel.active{display:block}
.bp-section{margin-bottom:50px;border:1px solid var(--border);border-radius:12px;overflow:hidden}
.bp-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:var(--surface2);border-bottom:1px solid var(--border)}
.bp-header h2{font-family:'Syne',sans-serif;font-size:18px;font-weight:700}
.ss-grid{display:grid;grid-template-columns:1fr 1fr 1fr}
.ss-col{border-right:1px solid var(--border)}
.ss-col:last-child{border-right:none}
.ss-col-label{padding:8px 14px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);background:var(--surface)}
.ss-col img{width:100%;display:block;max-height:500px;object-fit:cover;object-position:top}
.subsection{padding:16px 20px;border-top:1px solid var(--border)}
.subsection h4{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);padding:7px 10px;border-bottom:1px solid var(--border)}
td{padding:7px 10px;border-bottom:1px solid rgba(31,45,69,0.5);font-size:12px;vertical-align:top}
tr:last-child td{border-bottom:none}
.mono{font-family:'Space Mono',monospace}
.all-good{padding:14px 20px;color:var(--green);font-size:13px}
.lh-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
.lh-card{background:var(--surface2);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.lh-card-header{padding:12px 20px;border-bottom:1px solid var(--border);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
.console-grid,.links-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.panel-card{background:var(--surface2);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.panel-card-header{padding:12px 20px;border-bottom:1px solid var(--border);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
.panel-card-body{padding:16px 20px}
.err-list{list-style:none}
.err-list li{padding:7px 0;border-bottom:1px solid var(--border);color:var(--red);font-size:11px;word-break:break-all}
.section-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:24px}
.delta-pos{color:var(--green);font-size:11px;margin-left:6px}
.delta-neg{color:var(--red);font-size:11px;margin-left:6px}
.src-live{display:inline-block;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(56,189,248,0.15);color:#38bdf8}
.src-test{display:inline-block;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(167,139,250,0.15);color:#a78bfa}
a{color:var(--accent)}
</style>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
`;

export function generateReportHTML(results: CheckResults): string {
  const now = new Date(results.timestamp).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });

  if (results.mode === 'health') {
    return generateSoloReport(results, now);
  }
  return generateCompareReport(results, now);
}

function generateSoloReport(results: import('./types').HealthCheckResults, now: string): string {
  const totalIssues = BREAKPOINTS.reduce((n, bp) => n + (results.layout[bp]?.issues?.length ?? 0), 0);
  const broken = results.links.filter(l => !l.ok).length;
  const psi = results.psi;

  const screenshotSections = BREAKPOINTS.map(bp => {
    const img = results.screenshots[bp] ?? '';
    const bpLayout = results.layout[bp];
    const issueRows = bpLayout?.issues?.map(i =>
      `<tr><td>${sevIcon(i.severity)}</td><td class="mono" style="font-size:11px;word-break:break-all">${i.element}</td><td style="font-size:11px;color:var(--muted)">${i.detail}</td></tr>`
    ).join('') ?? '';

    return `
<div class="bp-section">
  <div class="bp-header"><h2>${bp} <span style="color:var(--muted);font-size:13px;font-weight:400">${bp === 'Mobile' ? '375px' : bp === 'Tablet' ? '768px' : '1440px'}</span></h2>
  <span style="font-size:12px;color:${bpLayout.issues.length > 0 ? 'var(--amber)' : 'var(--green)'}">${bpLayout.issues.length} issue${bpLayout.issues.length !== 1 ? 's' : ''}</span></div>
  ${img ? `<img src="${img}" alt="${bp}" style="width:100%;display:block;max-height:600px;object-fit:cover;object-position:top">` : ''}
  ${issueRows ? `<div class="subsection"><h4>Layout Issues</h4><table><thead><tr><th></th><th>Element</th><th>Detail</th></tr></thead><tbody>${issueRows}</tbody></table></div>` : `<div class="all-good">✓ No layout issues</div>`}
</div>`;
  }).join('');

  const psiSection = psi ? `
<div class="lh-grid">
<div class="lh-card"><div class="lh-card-header">Scores (mobile)</div>
<table><thead><tr><th>Category</th><th>Score</th></tr></thead><tbody>
<tr><td>Performance</td><td>${scoreBadge(psi.scores.performance)}</td></tr>
<tr><td>Accessibility</td><td>${scoreBadge(psi.scores.accessibility)}</td></tr>
<tr><td>Best Practices</td><td>${scoreBadge(psi.scores.bestPractices)}</td></tr>
<tr><td>SEO</td><td>${scoreBadge(psi.scores.seo)}</td></tr>
</tbody></table></div>
<div class="lh-card"><div class="lh-card-header">Core Web Vitals</div>
<table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>
<tr><td>LCP — Largest Contentful Paint</td><td class="mono">${psi.vitals.lcp}</td></tr>
<tr><td>CLS — Cumulative Layout Shift</td><td class="mono">${psi.vitals.cls}</td></tr>
<tr><td>TBT — Total Blocking Time</td><td class="mono">${psi.vitals.tbt}</td></tr>
<tr><td>FCP — First Contentful Paint</td><td class="mono">${psi.vitals.fcp}</td></tr>
<tr><td>SI — Speed Index</td><td class="mono">${psi.vitals.si}</td></tr>
</tbody></table></div>
</div>` : '<p style="color:var(--muted)">PageSpeed Insights data unavailable.</p>';

  const consoleSection = results.consoleErrors.length === 0
    ? '<div class="panel-card"><div class="panel-card-header">Console</div><div class="panel-card-body all-good">✓ No console errors</div></div>'
    : `<div class="panel-card"><div class="panel-card-header">Console Errors (${results.consoleErrors.length})</div><div class="panel-card-body"><ul class="err-list">${results.consoleErrors.map(e => `<li>${e.text}${e.url ? ` <span style="opacity:0.6;font-size:10px">${e.url}${e.line != null ? ':' + e.line : ''}</span>` : ''}</li>`).join('')}</ul></div></div>`;

  const linksSection = broken === 0
    ? '<div class="panel-card"><div class="panel-card-header">Links</div><div class="panel-card-body all-good">✓ No broken links</div></div>'
    : `<div class="panel-card"><div class="panel-card-header">Broken Links (${broken} of ${results.links.length})</div><table><thead><tr><th>Status</th><th>URL</th><th>Text</th></tr></thead><tbody>${results.links.filter(l => !l.ok).map(l => `<tr><td style="color:var(--red);font-weight:700">${l.status}</td><td class="mono" style="font-size:11px;word-break:break-all"><a href="${l.href}">${l.href}</a></td><td style="font-size:12px;color:var(--muted)">${l.text || '—'}</td></tr>`).join('')}</tbody></table></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page Check — ${results.urlA}</title>${BASE_STYLES}</head><body>
<div class="report-header">
  <div class="subtitle">Page Checker // Health Check Report</div>
  <h1>${results.urlA}</h1>
  <div class="meta">Generated ${now}</div>
</div>
<div class="summary-strip">
  <div class="s-item"><span class="s-label">Layout Issues</span><span class="s-val" style="color:${totalIssues === 0 ? 'var(--green)' : totalIssues < 5 ? 'var(--amber)' : 'var(--red)'}">${totalIssues}</span></div>
  <div class="s-item"><span class="s-label">Console Errors</span><span class="s-val" style="color:${results.consoleErrors.length === 0 ? 'var(--green)' : 'var(--red)'}">${results.consoleErrors.length}</span></div>
  <div class="s-item"><span class="s-label">Broken Links</span><span class="s-val" style="color:${broken === 0 ? 'var(--green)' : 'var(--red)'}">${broken}</span></div>
  <div class="s-item"><span class="s-label">PSI Performance</span><span class="s-val" style="color:${psi ? scoreColor(psi.scores.performance) : 'var(--muted)'}">${psi ? psi.scores.performance : '—'}</span></div>
</div>
<nav class="tab-nav">
  <button class="tab-btn active" onclick="showTab('visual',this)">Visual</button>
  <button class="tab-btn" onclick="showTab('psi',this)">PageSpeed</button>
  <button class="tab-btn" onclick="showTab('console',this)">Console</button>
  <button class="tab-btn" onclick="showTab('links',this)">Links</button>
</nav>
<div id="tab-visual" class="tab-panel active">${screenshotSections}</div>
<div id="tab-psi" class="tab-panel">${psiSection}</div>
<div id="tab-console" class="tab-panel">${consoleSection}</div>
<div id="tab-links" class="tab-panel">${linksSection}</div>
<script>function showTab(n,btn){document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.getElementById('tab-'+n).classList.add('active');btn.classList.add('active')}</script>
</body></html>`;
}

function generateCompareReport(results: import('./types').CompareCheckResults, now: string): string {
  const totalIssues = BREAKPOINTS.reduce((n, bp) =>
    n + (results.layout.a[bp]?.issues?.length ?? 0) + (results.layout.b[bp]?.issues?.length ?? 0), 0);
  const brokenA = results.links.a.filter(l => !l.ok).length;
  const brokenB = results.links.b.filter(l => !l.ok).length;
  const psiA = results.psi.a;
  const psiB = results.psi.b;

  const screenshotSections = BREAKPOINTS.map(bp => {
    const imgA = results.screenshots.a[bp] ?? '';
    const imgB = results.screenshots.b[bp] ?? '';
    const diff = results.screenshots.diff[bp];
    const pct = diff ? parseFloat(diff.diffPercentage) : 0;
    const pctColor = pct > 5 ? '#ef4444' : pct > 1 ? '#f59e0b' : '#22c55e';
    const layoutDiffs = results.layout.diffs[bp] ?? [];
    const issuesA = results.layout.a[bp]?.issues ?? [];
    const issuesB = results.layout.b[bp]?.issues ?? [];
    const allIssues = [...issuesA.map(i => ({ ...i, src: 'Live' })), ...issuesB.map(i => ({ ...i, src: 'Test' }))];

    const diffRows = layoutDiffs.map(d =>
      `<tr><td class="mono" style="font-size:11px;word-break:break-all">${d.element}</td><td class="mono" style="font-size:11px">${d.a.w}×${d.a.h} <span style="color:var(--muted)">top:${d.a.top}</span></td><td class="mono" style="font-size:11px">${d.b.w}×${d.b.h} <span style="color:var(--muted)">top:${d.b.top}</span></td><td class="mono" style="font-size:11px;color:var(--red)">${d.wDiff > 0 ? `±${d.wDiff}w ` : ''}${d.hDiff > 0 ? `±${d.hDiff}h ` : ''}${d.yDiff > 20 ? `±${d.yDiff}y` : ''}</td></tr>`
    ).join('');

    const issueRows = allIssues.map(i =>
      `<tr><td>${sevIcon(i.severity)}</td><td><span class="${i.src === 'Live' ? 'src-live' : 'src-test'}">${i.src}</span></td><td class="mono" style="font-size:11px;word-break:break-all">${i.element}</td><td style="font-size:11px;color:var(--muted)">${i.detail}</td></tr>`
    ).join('');

    return `
<div class="bp-section">
  <div class="bp-header"><h2>${bp} <span style="color:var(--muted);font-size:13px;font-weight:400">${bp === 'Mobile' ? '375px' : bp === 'Tablet' ? '768px' : '1440px'}</span></h2>
  <span style="font-size:13px;font-weight:700;color:${pctColor}">Pixel diff: ${diff?.diffPercentage ?? '—'}%</span></div>
  <div class="ss-grid">
    <div class="ss-col"><div class="ss-col-label">Live</div>${imgA ? `<img src="${imgA}" alt="Live ${bp}">` : ''}</div>
    <div class="ss-col"><div class="ss-col-label">Test</div>${imgB ? `<img src="${imgB}" alt="Test ${bp}">` : ''}</div>
    <div class="ss-col"><div class="ss-col-label">Diff (red = changed)</div>${diff ? `<img src="${diff.diffBase64}" alt="Diff ${bp}">` : ''}</div>
  </div>
  ${diffRows ? `<div class="subsection"><h4>Element Size & Position Changes</h4><table><thead><tr><th>Element</th><th>Live (w×h)</th><th>Test (w×h)</th><th>Delta</th></tr></thead><tbody>${diffRows}</tbody></table></div>` : ''}
  ${issueRows ? `<div class="subsection"><h4>Layout Issues</h4><table><thead><tr><th></th><th>Source</th><th>Element</th><th>Detail</th></tr></thead><tbody>${issueRows}</tbody></table></div>` : `<div class="all-good">✓ No layout issues at this breakpoint</div>`}
</div>`;
  }).join('');

  function psiScoreRow(key: keyof PSIResult['scores'], label: string) {
    const a = psiA?.scores[key] ?? null;
    const b = psiB?.scores[key] ?? null;
    const d = a !== null && b !== null ? b - a : null;
    const deltaHtml = d === null ? '' : d > 0 ? `<span class="delta-pos">▲${d}</span>` : d < 0 ? `<span class="delta-neg">▼${Math.abs(d)}</span>` : '';
    return `<tr><td>${label}</td><td>${a !== null ? scoreBadge(a) : '—'}</td><td>${b !== null ? scoreBadge(b) : '—'} ${deltaHtml}</td></tr>`;
  }

  const psiSection = (psiA || psiB) ? `
<div class="lh-grid">
<div class="lh-card"><div class="lh-card-header">Scores — Live vs Test</div>
<table><thead><tr><th>Category</th><th>Live</th><th>Test</th></tr></thead><tbody>
${psiScoreRow('performance','Performance')}${psiScoreRow('accessibility','Accessibility')}${psiScoreRow('bestPractices','Best Practices')}${psiScoreRow('seo','SEO')}
</tbody></table></div>
<div class="lh-card"><div class="lh-card-header">Core Web Vitals — Live vs Test</div>
<table><thead><tr><th>Metric</th><th>Live</th><th>Test</th></tr></thead><tbody>
<tr><td>LCP</td><td class="mono">${psiA?.vitals.lcp ?? '—'}</td><td class="mono">${psiB?.vitals.lcp ?? '—'}</td></tr>
<tr><td>CLS</td><td class="mono">${psiA?.vitals.cls ?? '—'}</td><td class="mono">${psiB?.vitals.cls ?? '—'}</td></tr>
<tr><td>TBT</td><td class="mono">${psiA?.vitals.tbt ?? '—'}</td><td class="mono">${psiB?.vitals.tbt ?? '—'}</td></tr>
<tr><td>FCP</td><td class="mono">${psiA?.vitals.fcp ?? '—'}</td><td class="mono">${psiB?.vitals.fcp ?? '—'}</td></tr>
<tr><td>SI</td><td class="mono">${psiA?.vitals.si ?? '—'}</td><td class="mono">${psiB?.vitals.si ?? '—'}</td></tr>
</tbody></table></div>
</div>` : '<p style="color:var(--muted)">PageSpeed Insights data unavailable.</p>';

  function consoleCol(errors: import('./types').ConsoleError[], label: string) {
    return `<div class="panel-card"><div class="panel-card-header">${label} (${errors.length} error${errors.length !== 1 ? 's' : ''})</div><div class="panel-card-body">${errors.length === 0 ? '<div style="color:var(--green)">✓ No console errors</div>' : `<ul class="err-list">${errors.map(e => `<li>${e.text}${e.url ? ` <span style="opacity:0.6;font-size:10px">${e.url}${e.line != null ? ':' + e.line : ''}</span>` : ''}</li>`).join('')}</ul>`}</div></div>`;
  }

  function linksCol(links: LinkResult[], label: string) {
    const broken = links.filter(l => !l.ok);
    return `<div class="panel-card"><div class="panel-card-header">${label} — ${broken.length} broken of ${links.length}</div>${broken.length === 0 ? '<div class="all-good">✓ No broken links</div>' : `<table><thead><tr><th>Status</th><th>URL</th><th>Text</th></tr></thead><tbody>${broken.map(l => `<tr><td style="color:var(--red);font-weight:700">${l.status}</td><td class="mono" style="font-size:11px;word-break:break-all"><a href="${l.href}">${l.href}</a></td><td style="font-size:12px;color:var(--muted)">${l.text || '—'}</td></tr>`).join('')}</tbody></table>`}</div>`;
  }

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page Check — Live vs Test Comparison</title>${BASE_STYLES}</head><body>
<div class="report-header">
  <div class="subtitle">Page Checker // Comparison Report</div>
  <h1>Live vs Test</h1>
  <div class="url-pair">
    <div class="url-box"><div class="url-label">Live</div><div class="url-val">${results.urlA}</div></div>
    <div class="url-box test"><div class="url-label">Test</div><div class="url-val">${results.urlB}</div></div>
  </div>
  <div class="meta">Generated ${now}</div>
</div>
<div class="summary-strip">
  <div class="s-item"><span class="s-label">Layout Issues</span><span class="s-val" style="color:${totalIssues === 0 ? 'var(--green)' : totalIssues < 5 ? 'var(--amber)' : 'var(--red)'}">${totalIssues}</span></div>
  <div class="s-item"><span class="s-label">Console Errors</span><span class="s-val" style="color:${(results.consoleErrors.a.length + results.consoleErrors.b.length) === 0 ? 'var(--green)' : 'var(--red)'}">${results.consoleErrors.a.length}/${results.consoleErrors.b.length}</span></div>
  <div class="s-item"><span class="s-label">Broken Links</span><span class="s-val" style="color:${(brokenA + brokenB) === 0 ? 'var(--green)' : 'var(--red)'}">${brokenA}/${brokenB}</span></div>
  <div class="s-item"><span class="s-label">PSI Perf (Test)</span><span class="s-val" style="color:${psiB ? scoreColor(psiB.scores.performance) : 'var(--muted)'}">${psiB ? psiB.scores.performance : '—'}</span></div>
</div>
<nav class="tab-nav">
  <button class="tab-btn active" onclick="showTab('visual',this)">Visual</button>
  <button class="tab-btn" onclick="showTab('psi',this)">PageSpeed</button>
  <button class="tab-btn" onclick="showTab('console',this)">Console</button>
  <button class="tab-btn" onclick="showTab('links',this)">Links</button>
</nav>
<div id="tab-visual" class="tab-panel active">${screenshotSections}</div>
<div id="tab-psi" class="tab-panel">${psiSection}</div>
<div id="tab-console" class="tab-panel"><div class="console-grid">${consoleCol(results.consoleErrors.a,'Live')}${consoleCol(results.consoleErrors.b,'Test')}</div></div>
<div id="tab-links" class="tab-panel"><div class="links-grid">${linksCol(results.links.a,'Live')}${linksCol(results.links.b,'Test')}</div></div>
<script>function showTab(n,btn){document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.getElementById('tab-'+n).classList.add('active');btn.classList.add('active')}</script>
</body></html>`;
}
