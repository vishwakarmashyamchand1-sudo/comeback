import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '../lib/store.jsx';
import { API_URL } from '../lib/api.js';

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
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function processOnboarding() {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        };

        // Step 1: Profile
        setActive(0);
        await fetch(`${API_URL}/api/onboarding/profile`, {
          method: 'PATCH', headers,
          body: JSON.stringify({
            step_number: 1,
            data: {
              gender: state.profile.gender,
              heightCm: state.profile.heightCm,
              currentWeightKg: state.profile.weightKg,
              targetWeightKg: state.profile.targetWeight,
              targetDate: state.profile.targetDate,
              dateOfBirth: state.profile.dob
            }
          })
        });

        // Step 2: Background
        setActive(1);
        await fetch(`${API_URL}/api/onboarding/profile`, {
          method: 'PATCH', headers,
          body: JSON.stringify({
            step_number: 2,
            data: {
              fitnessLevel: state.background.level,
              lastActivePeriod: state.background.lastActive,
              equipmentAccess: state.background.location,
              daysPerWeek: state.background.daysPerWeek,
              preferredTime: state.background.time,
              strongestMuscle: state.background.strongest,
              weakestMuscle: state.background.weakest
            }
          })
        });

        // Step 3: Goal
        setActive(2);
        await fetch(`${API_URL}/api/onboarding/profile`, {
          method: 'PATCH', headers,
          body: JSON.stringify({
            step_number: 3,
            data: {
              primaryGoal: state.goal.goal,
              motivationEvent: state.goal.event,
              urgencyLevel: state.goal.urgency
            }
          })
        });

        // Step 4: Diet
        setActive(3);
        await fetch(`${API_URL}/api/onboarding/profile`, {
          method: 'PATCH', headers,
          body: JSON.stringify({
            step_number: 4,
            data: {
              dietType: state.diet.type,
              foodRestrictions: state.diet.restrictions,
              supplementsTaken: state.diet.supplements
            }
          })
        });

        // Step 5: Health & Finalise AI Plan
        setActive(4);
        await fetch(`${API_URL}/api/onboarding/profile`, {
          method: 'PATCH', headers,
          body: JSON.stringify({
            step_number: 5,
            data: {
              injuries: state.health.injuries,
              medicalConditions: state.health.conditions,
              exercisesToAvoid: state.health.avoid
            }
          })
        });

        // Complete Onboarding - Triggers Gemini AI Generation!
        const res = await fetch(`${API_URL}/api/onboarding/complete`, {
          method: 'POST', headers,
          body: JSON.stringify({})
        });
        
        if (!res.ok) throw new Error('Failed to generate AI plan');

        setActive(5); // all done
        setTimeout(onDone, 900);

      } catch (err) {
        console.error('Onboarding Error:', err);
        // Fallback or show error
        setActive(5);
        setTimeout(onDone, 1000);
      }
    }

    processOnboarding();
  }, [state, onDone]);

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
