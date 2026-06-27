import React from 'react';
import { useOnboarding } from '../lib/store.jsx';
import {
  ObHeader, ProgressSteps, StepIntro, SectionLabel,
  OptionCard, CheckRow, Pill, PrimaryButton,
} from '../components/UI.jsx';

const DIETS = [
  { id: 'Vegetarian',      icon: 'leaf', bg: '#EDFCD2', color: '#3A7A0A', sub: 'No meat, no eggs' },
  { id: 'Eggetarian',      icon: 'egg',  bg: '#FFF4E6', color: '#D97706', sub: 'Vegetarian + eggs. No chicken or meat.' },
  { id: 'Non-vegetarian',  icon: 'meat', bg: '#FEF2F2', color: '#DC2626', sub: 'Chicken, fish, eggs — all fine' },
];
const RESTRICTIONS = [
  { id: 'No whey protein', sub: 'Prefer food-based protein only' },
  { id: 'No dairy',        sub: 'Lactose intolerant or preference' },
  { id: 'No gluten' },
  { id: 'Jain diet',       sub: 'No root vegetables' },
  {id:'None'},
];
const SUPPLEMENTS = ['Creatine', 'Vitamin D', 'Omega 3', 'Multivitamin', 'None'];

export default function Step4({ onNext, onBack, onSkip, dir }) {
  const { state, dispatch } = useOnboarding();
  const d = state.diet;
  const set = value => dispatch({ type: 'patch', slice: 'diet', value });
  const toggle = (field, value) => dispatch({ type: 'toggle', slice: 'diet', field, value });

   const valid = d.type && d.restrictions.length > 0 && d.supplements.length > 0;

  return (
    <div className={`screen anim-${dir}`}>
      <ObHeader step={4} onBack={onBack} onSkip={onSkip} />
      <ProgressSteps current={4} />
      <StepIntro icon="salad" tag="Diet"
        title="How do you eat?"
        sub="Your coach knows Indian food inside out. Be specific." />

      <SectionLabel>I eat</SectionLabel>
      {DIETS.map(o => (
        <OptionCard key={o.id} icon={o.icon} iconBg={o.bg} iconColor={o.color}
          title={o.id} sub={o.sub}
          selected={d.type === o.id} onClick={() => set({ type: o.id })} />
      ))}

      <SectionLabel>Any restrictions?</SectionLabel>
      <div>
        {RESTRICTIONS.map(r => (
          <CheckRow key={r.id} label={r.id} sub={r.sub}
            checked={d.restrictions.includes(r.id)}
            onClick={() => toggle('restrictions', r.id)} />
        ))}
      </div>

      <SectionLabel>Supplements you take (optional)</SectionLabel>
      <div className="pill-group">
        {SUPPLEMENTS.map(s => (
          <Pill key={s} label={s}
            selected={d.supplements.includes(s)}
            onClick={() => toggle('supplements', s)} />
        ))}
      </div>

      <div className="cta">
        <PrimaryButton onClick={onNext} disabled={!valid}>
          Continue <i className="ti ti-arrow-right btn-icon" />
        </PrimaryButton>
      </div>
    </div>
  );
}
