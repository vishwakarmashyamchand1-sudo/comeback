import React, { useEffect, useState } from 'react';
import { useOnboarding } from '../lib/store.jsx';

const STEPS = [
  { label: 'Analysing your profile',        icon: 'user' },
  { label: 'Matching exercises to your gym', icon: 'barbell' },
  { label: 'Working around your injuries',   icon: 'shield-check' },
  { label: 'Building your nutrition plan',   icon: 'salad' },
  { label: 'Finalising week 1',              icon: 'calendar' },
];

export default function Generating({ onDone }) {
  const { state } = useOnboarding();
  const [active, setActive] = useState(0);
  const name = state.profile.name || 'there';

  useEffect(() => {
    if (active >= STEPS.length) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActive(a => a + 1), 1100);
    return () => clearTimeout(t);
  }, [active, onDone]);

  return (
    <div className="gen-screen">
      <div className="pulse-dot" style={{ marginBottom: 32 }}>
        <svg width="64" height="64" viewBox="0 0 60 60" fill="none">
          <rect width="60" height="60" rx="16" fill="#ffffff10" />
          <polyline points="10,34 22,34 28,18 34,46 40,34 50,34" fill="none"
            stroke="#C8F25C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="gen-title">Building your comeback, {name}</div>
      <div className="gen-sub">This takes a moment. Your coach is<br />tailoring everything to you.</div>

      <div className="gen-steps">
        {STEPS.map((s, i) => {
          const status = i < active ? 'done' : i === active ? 'active' : 'wait';
          return (
            <div key={s.label} className={`gen-step ${status}`}>
              <div className="gen-step-ico">
                {status === 'done'
                  ? <i className="ti ti-check" />
                  : status === 'active'
                    ? <div className="spinner" />
                    : <i className={`ti ti-${s.icon}`} />}
              </div>
              <div className="gen-step-lbl">{s.label}</div>
              <div className="gen-step-status">
                {status === 'done' ? <i className="ti ti-check" /> : status === 'active' ? '…' : ''}
              </div>
            </div>
          );
        })}
      </div>

      <div className="gen-coach-note">
        <div className="gen-note-label">From your coach</div>
        <div className="gen-note-text">
          You're returning, not starting over. We'll ease back in for two weeks,
          then push. No ego lifts, no injuries — just steady progress.
        </div>
      </div>
    </div>
  );
}
