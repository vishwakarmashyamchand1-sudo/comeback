import React from 'react';
import { useOnboarding } from '../lib/store.jsx';
import {
  StatusBar, ObHeader, ProgressSteps, StepIntro, SectionLabel,
  OptionCard, PillGroup, PrimaryButton, TextField, SuffixField
} from '../components/UI.jsx';

const LEVELS = [
  { id: 'Returning',  icon: 'rotate-clockwise', bg: '#EDFCD2', color: '#3A7A0A', sub: 'Was active before, taking a break for a few months' },
  { id: 'Beginner',   icon: 'plant',            bg: '#E8E8F5', color: '#1A1A2E', sub: 'Never worked out consistently before' },
  { id: 'Active',     icon: 'flame',            bg: '#EDFCD2', color: '#3A7A0A', sub: 'Gym regular — working out consistently now', title: 'Currently active' },
];
const LAST = ['1–3 months ago', '3–6 months ago', '6–12 months ago', '1+ year ago'];
const TIMES = ['Morning', 'Evening', 'Flexible'];
const LOCATIONS = ['Full Gym', 'Home Gym', 'No Equipment'];

export default function Step2({ onNext, onBack, onSkip, dir }) {
  const { state, dispatch } = useOnboarding();
  const b = state.background;
  const set = value => dispatch({ type: 'patch', slice: 'background', value });
  const setLift = (lift, value) => set({ baselineLifts: { ...(b.baselineLifts || {}), [lift]: value } });

  const valid = b.level && b.daysPerWeek && b.time && b.location;

  return (
    <div className={`screen anim-${dir}`}>
      <ObHeader step={2} onBack={onBack} onSkip={onSkip} />
      <ProgressSteps current={2} />
      <StepIntro icon="barbell" tag="Fitness history"
        title="Your fitness<br>background"
        sub="Helps your coach set the right starting weights and intensity." />

      <SectionLabel>Where are you right now?</SectionLabel>
      {LEVELS.map(l => {
        const isSelected = b.level === l.id;
        const showLifts = isSelected && (l.id === 'Returning' || l.id === 'Active');
        
        return (
          <div key={l.id} style={{ marginBottom: 10 }}>
            <OptionCard 
              icon={l.icon} iconBg={l.bg} iconColor={l.color}
              title={l.title || l.id} sub={l.sub}
              selected={isSelected} 
              onClick={() => set({ level: l.id })} 
            />
            {showLifts && (
              <div className="anim-fwd" style={{ 
                marginTop: -12, 
                padding: '25px 20px 20px', 
                background: 'var(--c-navy-10)', 
                border: '2px solid var(--c-navy)', 
                borderTop: 'none',
                borderRadius: '0 0 var(--r-card) var(--r-card)'
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--c-navy)', marginBottom: 15 }}>
                  Baseline Lifts (Optional)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { id: 'chestPressKg', label: 'Chest Press' },
                    { id: 'shoulderPressKg', label: 'Shoulder Press' },
                    { id: 'squatKg', label: 'Squat' },
                    { id: 'deadliftKg', label: 'Deadlift' }
                  ].map(lift => (
                    <div key={lift.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text-primary)' }}>{lift.label}</div>
                      <div style={{ width: 110 }}>
                        <SuffixField 
                          value={b.baselineLifts?.[lift.id] || ''} 
                          onChange={v => setLift(lift.id, v)} 
                          placeholder="0" 
                          suffix="kg" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <SectionLabel>Last active (optional)</SectionLabel>
      <PillGroup options={LAST} value={b.lastActive} onChange={v => set({ lastActive: v })} />

      <SectionLabel>Where will you work out?</SectionLabel>
      <PillGroup options={LOCATIONS} value={b.location} onChange={v => set({ location: v })} />

      <SectionLabel>Days per week</SectionLabel>
      <div className="days-grid">
        {[2, 3, 4, 5, 6].map(n => (
          <div key={n} className={`day-chip ${b.daysPerWeek === n ? 'sel' : ''}`} onClick={() => set({ daysPerWeek: n })}>
            <div className="day-num">{n}</div>
            <div className="day-lbl">days</div>
          </div>
        ))}
      </div>

      <SectionLabel>Preferred time</SectionLabel>
      <PillGroup options={TIMES} value={b.time} onChange={v => set({ time: v })} />

      <SectionLabel>Strongest muscle (optional)</SectionLabel>
      <TextField value={b.strongest} onChange={v => set({ strongest: v })} placeholder="e.g. Chest, Legs" />

      <SectionLabel>Weakest muscle (optional)</SectionLabel>
      <TextField value={b.weakest} onChange={v => set({ weakest: v })} placeholder="e.g. Back, Arms" />

      <div className="cta">
        <PrimaryButton onClick={onNext} disabled={!valid}>
          Continue <i className="ti ti-arrow-right btn-icon" />
        </PrimaryButton>
      </div>
    </div>
  );
}
