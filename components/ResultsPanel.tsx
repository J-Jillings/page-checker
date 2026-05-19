'use client';

import { useState } from 'react';
import { SummaryStrip } from './results/SummaryStrip';
import { VisualTab } from './results/VisualTab';
import { PageSpeedTab } from './results/PageSpeedTab';
import { ConsoleTab } from './results/ConsoleTab';
import { LinksTab } from './results/LinksTab';
import { generateReportHTML } from '@/lib/reportHTML';
import type { CheckResults } from '@/lib/types';

type Tab = 'visual' | 'pagespeed' | 'console' | 'links';

interface Props {
  results: CheckResults;
  onNewCheck: () => void;
}

export function ResultsPanel({ results, onNewCheck }: Props) {
  const [tab, setTab] = useState<Tab>('visual');

  function downloadReport() {
    const html = generateReportHTML(results);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `page-check-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabBtnStyle = (active: boolean) => ({
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '1px',
    padding: '14px 20px',
    textTransform: 'uppercase' as const,
    transition: 'all 0.15s',
  });

  return (
    <div>
      {/* Results header */}
      <div style={{
        background: 'linear-gradient(135deg, #070c1a 0%, #160824 50%, #070c1a 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '28px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 40px rgba(255,0,170,0.12)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 800, background: 'linear-gradient(135deg, #ff00aa, #00ffd5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {results.mode === 'health' ? 'Health Check Results' : 'Comparison Results'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
            {results.mode === 'health'
              ? results.urlA
              : `${results.urlA} vs ${results.urlB}`
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={downloadReport}
            style={{
              padding: '8px 18px',
              background: 'transparent',
              border: '1px solid var(--accent)',
              borderRadius: '8px',
              color: 'var(--accent)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              boxShadow: 'var(--glow-accent)',
            }}
          >
            Download Report
          </button>
          <button
            onClick={onNewCheck}
            style={{
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #ff00aa, #cc0088)',
              border: '1px solid #ff00aa',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              boxShadow: 'var(--glow-accent)',
            }}
          >
            New Check
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <SummaryStrip results={results} />

      {/* Tab nav */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '0 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {(['visual', 'pagespeed', 'console', 'links'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabBtnStyle(tab === t)}>
            {t === 'pagespeed' ? 'PageSpeed' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {tab === 'visual'     && <VisualTab     results={results} />}
        {tab === 'pagespeed'  && <PageSpeedTab  results={results} />}
        {tab === 'console'    && <ConsoleTab    results={results} />}
        {tab === 'links'      && <LinksTab      results={results} />}
      </div>
    </div>
  );
}
