'use client';

import type { CheckResults, LinkResult } from '@/lib/types';

function LinkTable({ links, label }: { links: LinkResult[]; label: string }) {
  const broken = links.filter(l => !l.ok);

  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label} — {broken.length} broken of {links.length} checked
      </div>
      {broken.length === 0
        ? <div style={{ padding: '16px 20px', color: 'var(--green)', fontSize: '13px' }}>✓ No broken links</div>
        : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Status', 'URL', 'Link Text'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {broken.map((link, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--red)', fontSize: '12px', whiteSpace: 'nowrap' }}>{link.status}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', wordBreak: 'break-all' }}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{link.href}</a>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--muted)' }}>{link.text || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
      }
    </div>
  );
}

export function LinksTab({ results }: { results: CheckResults }) {
  if (results.mode === 'health') {
    return <LinkTable links={results.links} label="Links" />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <LinkTable links={results.links.a} label="Live" />
      <LinkTable links={results.links.b} label="Test" />
    </div>
  );
}
