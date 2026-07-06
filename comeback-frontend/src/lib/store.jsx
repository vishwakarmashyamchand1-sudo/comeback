import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { auth } from './firebase.js';
import { onIdTokenChanged, signOut } from 'firebase/auth';

const STORAGE_KEY = 'comeback.onboarding.v1';

const initial = {
  isAuthenticated: false,
  token: null,
  step: 1,            // 1..5, then 'generating'
  dir: 'fwd',         // transition direction
  profile:    { name: '', gender: '', dob: '', heightCm: '', weightKg: '', targetWeight: '', targetDate: '' },
  background: { level: '', lastActive: '', daysPerWeek: '', time: '', location: '', strongest: '', weakest: '', baselineLifts: { chestPressKg: '', shoulderPressKg: '', squatKg: '', deadliftKg: '' } },
  goal:       { goal: '', event: '', urgency: '' },
  diet:       { type: '', restrictions: [], supplements: [] },
  health:     { injuries: [], conditions: [], avoid: '' },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const saved = JSON.parse(raw);
    return { ...initial, ...saved, isAuthenticated: false }; // Force login screen on every refresh
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
      let next;
      if (action.value === 'None') {
        // If user clicks "None", clear everything else and just toggle "None"
        next = arr.includes('None') ? [] : ['None'];
      } else {
        // If user clicks something else, remove "None" first, then toggle normally
        const withoutNone = arr.filter(v => v !== 'None');
        next = withoutNone.includes(action.value)
          ? withoutNone.filter(v => v !== action.value)
          : [...withoutNone, action.value];
      }
      return { ...state, [action.slice]: { ...state[action.slice], [action.field]: next } };
    }
    case 'login_success': 
      return { 
        ...state, 
        isAuthenticated: true, 
        token: action.token,
        profile: { ...(state.profile || {}), name: action.user?.name || state.profile?.name || '' }
      };
    case 'next':  return { ...state, step: action.step, dir: 'fwd' };
    case 'back':  return { ...state, step: action.step, dir: 'back' };
    case 'reset': return { ...initial };
    case 'logout': 
      try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
      return { ...initial };
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
    // Firebase automatically persists the session. We just listen for token changes.
    
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // Firebase automatically gets a fresh token right before the old one expires
        const freshToken = await user.getIdToken();
        dispatch({ type: 'login_success', token: freshToken });
      }
    });
    return unsub;
  }, []);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
