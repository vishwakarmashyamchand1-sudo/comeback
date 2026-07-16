import React from 'react';
import { useOnboarding } from '../lib/store.jsx';
import {
  ObHeader, ProgressSteps, StepIntro, SectionLabel,
  OptionCard, SuffixField, TextField, PillGroup, PrimaryButton,
} from '../components/UI.jsx';

const GOALS = [
  { id: 'Lose fat',           icon: 'flame',   bg: '#FFF4E6', color: '#D97706', sub: 'Burn the extra weight, feel lighter and more confident' },
  { id: 'Build muscle',       icon: 'barbell', bg: '#EDFCD2', color: '#3A7A0A', sub: 'Get stronger and add visible muscle mass' },
  { id: 'Fitness & energy',   icon: 'heart',   bg: '#E8E8F5', color: '#1A1A2E', sub: 'Feel active, less tired, and generally healthier' },
];
const URGENCY = ['Relaxed', 'Moderate', 'Intensive'];

export default function Step3({ onNext, onBack, onSkip, dir }) {
  const { state, dispatch } = useOnboarding();
  const g = state.goal;
  const set = value => dispatch({ type: 'patch', slice: 'goal', value });

    const valid = g.goal && g.urgency;

  return (
    <div className={`screen anim-${dir}`}>
      <ObHeader step={3} onBack={onBack} onSkip={onSkip} />
      <ProgressSteps current={3} />
      <StepIntro icon="target" tag="Your goal"
        title="What are you<br>working towards?"
        sub="Be honest — your coach will never judge." />

      {GOALS.map(o => (
        <OptionCard key={o.id} variant="goal" icon={o.icon} iconBg={o.bg} iconColor={o.color}
          title={o.id} sub={o.sub}
          selected={g.goal === o.id} onClick={() => set({ goal: o.id })} />
      ))}


      <SectionLabel>Any specific event motivating you? <span style={{opacity: 0.5, fontWeight: 400}}>(optional)</span></SectionLabel>
      <TextField value={g.event} onChange={v => set({ event: v })} placeholder="e.g. Wedding anniversary — July 1" />

      <SectionLabel>Urgency</SectionLabel>
      <PillGroup options={URGENCY} value={g.urgency} onChange={v => set({ urgency: v })} />

      <div className="cta">
        <PrimaryButton onClick={onNext} disabled={!valid}>
          Continue <i className="ti ti-arrow-right btn-icon" />
        </PrimaryButton>
      </div>
    </div>
  );
}
