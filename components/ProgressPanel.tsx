'use client';

import { useEffect, useState } from 'react';

interface Props {
  mode: 'health' | 'compare';
}

const steps = [
  { id: 'connect',   label: 'Connecting to browser' },
  { id: 'screens',   label: 'Taking screenshots (Mobile, Tablet, Desktop)' },
  { id: 'layout',    label: 'Analysing layout' },
  { id: 'console',   label: 'Checking console errors' },
  { id: 'links',     label: 'Auditing links' },
  { id: 'psi',       label: 'Running PageSpeed Insights' },
];

const STEP_DURATIONS = [3000, 12000, 10000, 6000, 20000, 20000];

export function ProgressPanel({ mode }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let step = 0;
    const advance = () => {
      if (step < steps.length - 1) {
        step++;
        setCurrentStep(step);
        setTimeout(advance, STEP_DURATIONS[step]);
      }
    };
    const t = setTimeout(advance, STEP_DURATIONS[0]);
    return () => clearTimeout(t);
  }, []);

  function stepIcon(i: number) {
    if (i < currentStep) return <span style={{ color: 'var(--green)' }}>✓</span>;
    if (i === currentStep) return <span className="spin" style={{ display: 'inline-block', color: 'var(--accent)' }}>⟳</span>;
    return <span style={{ color: 'var(--border)' }}>·</span>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '480px' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--glow-panel)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #070c1a 0%, #160824 50%, #070c1a 100%)',
          padding: '24px 28px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 700, background: 'linear-gradient(135deg, #ff00aa, #00ffd5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Running {mode === 'health' ? 'Health Check' : 'Comparison'}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>This may take 60–120 seconds</div>
        </div>

        {/* Steps */}
        <div style={{ padding: '20px 28px' }}>
          {steps.map((step, i) => (
            <div key={step.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: i > currentStep ? 0.4 : 1,
              transition: 'opacity 0.3s',
            }}>
              <span style={{ width: '20px', textAlign: 'center', fontSize: '16px' }}>
                {stepIcon(i)}
              </span>
              <span style={{
                fontSize: '13px',
                color: i === currentStep ? 'var(--text)' : i < currentStep ? 'var(--muted)' : 'var(--muted)',
                fontWeight: i === currentStep ? 700 : 400,
              }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>
            PageSpeed Insights runs separately from Google&apos;s servers — this is what makes it free. Takes ~20 seconds.
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.6 }}>
            First run may take a few seconds to connect to Steel&apos;s browser.
          </div>
          {mode === 'compare' && (
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.6 }}>
              Comparison mode runs two browser sessions sequentially to stay within free tier limits.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
