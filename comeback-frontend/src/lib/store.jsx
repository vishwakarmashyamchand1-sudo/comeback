import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { auth } from './firebase.js';
import { onIdTokenChanged } from 'firebase/auth';

const STORAGE_KEY = 'comeback.onboarding.v1';

const initial = {
  isAuthenticated: false,
  token: null,
  step: 1,            // 1..5, then 'generating'
  dir: 'fwd',         // transition direction
  profile:    { name: '', gender: '', dob: { d: '', m: '', y: '' }, heightCm: '', weightKg: '', targetWeight: '', targetDate: '' },
  background: { level: '', lastActive: '', daysPerWeek: '', time: '', location: '', strongest: '', weakest: '' },
  goal:       { goal: '', event: '', urgency: '' },
  diet:       { type: '', restrictions: [], supplements: [] },
  health:     { injuries: [], conditions: [], avoid: '' },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch { return initial; }
}

function reducer(state, action) {
  switch (action.type) {
    case 'patch': {
      // patch a slice: { slice:'profile', value:{...} }
      return { ...state, [action.slice]: { ...state[action.slice], ...action.value } };
    }
    case 'toggle': {
      // toggle a value in an array field within a slice
      const arr = state[action.slice][action.field];
      const next = arr.includes(action.value)
        ? arr.filter(v => v !== action.value)
        : [...arr, action.value];
      return { ...state, [action.slice]: { ...state[action.slice], [action.field]: next } };
    }
    case 'login_success': return { ...state, isAuthenticated: true, token: action.token };
    case 'next':  return { ...state, step: action.step, dir: 'fwd' };
    case 'back':  return { ...state, step: action.step, dir: 'back' };
    case 'reset': return { ...initial };
    default: return state;
  }
}

const Ctx = createContext(null);

export function OnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  // Persist on every change (Skip / refresh resume)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  // Listen to Firebase token refreshes in the background!
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // Firebase automatically gets a fresh token right before the old one expires
        const freshToken = await user.getIdToken();
        dispatch({ type: 'login_success', token: freshToken, user: { name: state.profile.name } });
      }
    });
    return unsub;
  }, [state.profile.name]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
