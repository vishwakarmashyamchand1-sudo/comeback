import React, { useState } from 'react';
import App from './App.jsx';
import AppShell from './app/AppShell.jsx';
import { OnboardingProvider } from './lib/store.jsx';

const KEY = 'comeback.onboarded';

// Top-level phase switch: onboarding flow → main app.
export default function Root() {
  const [phase, setPhase] = useState(() => (localStorage.getItem(KEY) === '1' ? 'app' : 'onboarding'));

  const enterApp = () => {
    try { localStorage.setItem(KEY, '1'); } catch {}
    setPhase('app');
  };

  return (
    <OnboardingProvider>
      {phase === 'app' ? <AppShell /> : <App onEnterApp={enterApp} />}
    </OnboardingProvider>
  );
}
