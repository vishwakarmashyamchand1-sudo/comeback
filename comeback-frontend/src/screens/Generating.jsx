import React, { useEffect, useState, useRef } from 'react';
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
  const [apiDone, setApiDone] = useState(false);
  const fetched = useRef(false);
  const name = state.profile.name || 'there';

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    
    // 1. Fire off the backend AI generation
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/onboarding/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({})
    }).then(res => res.json())
      .then(data => {
        console.log("AI Generation complete:", data);
        setApiDone(true);
      })
      .catch(err => {
        console.error("AI Generation failed:", err);
        setApiDone(true); // proceed anyway on failure to show fallback
      });
  }, [state.token]);

  useEffect(() => {
    // 2. Control the fake animation, but wait for apiDone before finishing
    if (active >= STEPS.length) {
      if (apiDone) {
        const t = setTimeout(onDone, 900);
        return () => clearTimeout(t);
      }
      return; // wait here until apiDone becomes true
    }
    const t = setTimeout(() => setActive(a => a + 1), 1100);
    return () => clearTimeout(t);
  }, [active, apiDone, onDone]);

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
          {state.profile?.fitnessLevel === 'beginner' 
            ? "We're starting from scratch. We'll focus on form, build a solid foundation, and safely scale up your strength."
            : state.profile?.fitnessLevel === 'active'
            ? "You're already active, so we'll fine-tune your routine and push your limits to maximize your gains."
            : "You're returning, not starting over. We'll ease back in for two weeks, then push. No ego lifts, no injuries — just steady progress."
          }
        </div>
      </div>
    </div>
  );
}
