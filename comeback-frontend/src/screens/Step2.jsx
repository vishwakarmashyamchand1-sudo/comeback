import React from 'react';
import { useOnboarding } from '../lib/store.jsx';
import {
  StatusBar, ObHeader, ProgressSteps, StepIntro, SectionLabel,
  OptionCard, PillGroup, PrimaryButton,TextField
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

  const valid = b.level && b.daysPerWeek && b.time && b.location;

  return (
    <div className={`screen anim-${dir}`}>
      <ObHeader step={2} onBack={onBack} onSkip={onSkip} />
      <ProgressSteps current={2} />
      <StepIntro icon="barbell" tag="Fitness history"
        title="Your fitness<br>background"
        sub="Helps your coach set the right starting weights and intensity." />

      <SectionLabel>Where are you right now?</SectionLabel>
      {LEVELS.map(l => (
        <OptionCard key={l.id} icon={l.icon} iconBg={l.bg} iconColor={l.color}
          title={l.title || l.id} sub={l.sub}
          selected={b.level === l.id} onClick={() => set({ level: l.id })} />
      ))}

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
