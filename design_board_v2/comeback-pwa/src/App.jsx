import React, { useState } from 'react';
import { useOnboarding } from './lib/store.jsx';
import { StatusBar } from './components/UI.jsx';
import Step1 from './screens/Step1.jsx';
import Step2 from './screens/Step2.jsx';
import Step3 from './screens/Step3.jsx';
import Step4 from './screens/Step4.jsx';
import Step5 from './screens/Step5.jsx';
import Generating from './screens/Generating.jsx';

export default function App({ onEnterApp }) {
  const { state, dispatch } = useOnboarding();
  const { step, dir } = state;
  const [done, setDone] = useState(false);

  const go = next => dispatch({ type: next > step ? 'next' : 'back', step: next });
  const next = () => (step < 5 ? go(step + 1) : dispatch({ type: 'next', step: 'generating' }));
  const back = () => {
    if (step === 'generating') return dispatch({ type: 'back', step: 5 });
    if (step > 1) go(step - 1);
  };
  const skip = () => next();

  const props = { onNext: next, onBack: back, onSkip: skip, dir };

  let screen;
  if (step === 'generating') {
    screen = done
      ? <PlanReady onEnterApp={onEnterApp} onRestart={() => { dispatch({ type: 'reset' }); setDone(false); }} />
      : <Generating onDone={() => setDone(true)} />;
  } else {
    screen = {
      1: <Step1 {...props} />,
      2: <Step2 {...props} />,
      3: <Step3 {...props} />,
      4: <Step4 {...props} />,
      5: <Step5 {...props} />,
    }[step];
  }

  const dark = step === 'generating';

  return (
    <div className="app-shell" style={dark ? { background: '#1A1A2E' } : undefined}>
      {!dark && <StatusBar />}
      {screen}
    </div>
  );
}

// Lightweight success state shown after the generating animation.
function PlanReady({ onRestart, onEnterApp }) {
  const { state } = useOnboarding();
  const name = state.profile.name || 'there';
  return (
    <div className="gen-screen">
      <div style={{ marginBottom: 28 }}>
        <svg width="72" height="72" viewBox="0 0 60 60" fill="none">
          <rect width="60" height="60" rx="16" fill="#C8F25C" />
          <polyline points="18,31 27,40 43,21" fill="none" stroke="#1A1A2E"
            strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="gen-title">Your plan is ready, {name}</div>
      <div className="gen-sub">12-week comeback plan · 4 days / week<br />Tailored to your goals, gym and health.</div>
      <div style={{ width: '100%', marginTop: 8 }}>
        <button className="btn btn-lime" onClick={onEnterApp}>
          Let's go <i className="ti ti-arrow-right btn-icon" />
        </button>
        <button className="btn" style={{ marginTop: 10, background: 'transparent', color: '#8A8AAA', borderColor: '#ffffff1A' }} onClick={onRestart}>
          Start over
        </button>
      </div>
    </div>
  );
}
