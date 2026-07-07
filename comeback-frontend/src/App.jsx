import React, { useState } from 'react';
import { useOnboarding } from './lib/store.jsx';
import { StatusBar } from './components/UI.jsx';
import Step1 from './screens/Step1.jsx';
import Step2 from './screens/Step2.jsx';
import Step3 from './screens/Step3.jsx';
import Step4 from './screens/Step4.jsx';
import Step5 from './screens/Step5.jsx';
import Generating from './screens/Generating.jsx';
import Auth from './screens/Auth.jsx';

import { API_URL } from './lib/api.js';

export default function App({ onEnterApp }) {
  const { state, dispatch } = useOnboarding();
    React.useEffect(() => {
    // Wait until they are authenticated before jumping!
    if (state.isAuthenticated && localStorage.getItem('hasCompletedOnboarding') === 'true') {
      if (onEnterApp) onEnterApp();
      else dispatch({ type: 'next', step: 'dashboard' });
    }
  }, [state.isAuthenticated, dispatch, onEnterApp]);
  const { step, dir } = state;
  const [done, setDone] = useState(false);

  const go = next => dispatch({ type: next > step ? 'next' : 'back', step: next });
  
  const next = async () => {
    const slices = { 1: 'profile', 2: 'background', 3: 'goal', 4: 'diet', 5: 'health' };
    const sliceKey = slices[step];

    if (state.isAuthenticated) {
      try {
        if (sliceKey) {
          let payloadData = {};
          const localData = state[sliceKey];
          
          if (step === 1) {
            payloadData = {
              heightCm: localData.heightCm,
              currentWeightKg: localData.weightKg,
              targetWeightKg: localData.targetWeight,
              targetDate: localData.targetDate,
              dateOfBirth: localData.dob ? new Date(localData.dob).toISOString() : null,
              gender: localData.gender
            };
          } else if (step === 2) {
            payloadData = {
              fitnessLevel: localData.level,
              lastActivePeriod: localData.lastActive,
              equipmentAccess: localData.location,
              daysPerWeek: localData.daysPerWeek,
              preferredTime: localData.time,
              strongestMuscle: localData.strongest,
              weakestMuscle: localData.weakest,
              baselineLifts: localData.baselineLifts
            };
          } else if (step === 3) {
            payloadData = {
              primaryGoal: localData.goal,
              motivationEvent: localData.event,
              urgencyLevel: localData.urgency
            };
          } else if (step === 4) {
            payloadData = {
              dietType: localData.type,
              foodRestrictions: localData.restrictions,
              supplementsTaken: localData.supplements
            };
          } else if (step === 5) {
            payloadData = {
              injuries: localData.injuries,
              conditions: localData.conditions,
              exercisesToAvoid: localData.avoid,
              doctorClearance: localData.conditions.includes('Heart condition') // Derived from conditions
            };
          }

          await fetch(`${API_URL}/api/onboarding/profile`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ step_number: step, data: payloadData })
          });
        }
      } catch (err) {
        console.error("API sync failed", err);
      }
    }
    
    step < 5 ? go(step + 1) : dispatch({ type: 'next', step: 'generating' });
  };
  const back = () => {
    if (step === 'generating') return dispatch({ type: 'back', step: 5 });
    if (step > 1) go(step - 1);
     if (step === 1) return dispatch({ type: 'reset' });
  };
  const skip = () => next();

  const props = { onNext: next, onBack: back, onSkip: skip, dir };

  let screen;
  
  if (!state.isAuthenticated) {
    screen = <Auth />;
  } else if (step === 'generating') {
    screen = done
      ? <PlanReady onRestart={() => { dispatch({ type: 'reset' }); setDone(false); }} 
      onContinue={() => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        if (onEnterApp) onEnterApp();
        else dispatch({ type: 'next', step: 'dashboard' });}} />
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

  const dark = step === 'generating' || !state.isAuthenticated;

  return (
    <div className="app-shell" style={dark ? { background: '#1A1A2E' } : undefined}>
      {screen}
    </div>
  );
}

// Lightweight success state shown after the generating animation.
function PlanReady({ onRestart, onContinue }) {
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
      <div className="gen-sub">Week 1 comeback plan · {state.profile?.daysPerWeek || 4} days / week<br />Tailored to your goals, gym and health.</div>
      <div style={{ width: '100%', marginTop: 8 }}>
        <button className="btn btn-lime" onClick={onContinue}>
          Let's go <i className="ti ti-arrow-right btn-icon" />
        </button>
        <button className="btn" style={{ marginTop: 10, background: 'transparent', color: '#8A8AAA', borderColor: '#ffffff1A' }} onClick={onRestart}>
          Start over
        </button>
      </div>
    </div>
  );
}
