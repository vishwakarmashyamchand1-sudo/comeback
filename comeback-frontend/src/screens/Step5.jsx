import React from 'react';
import { useOnboarding } from '../lib/store.jsx';
import {
  ObHeader, ProgressSteps, StepIntro, SectionLabel,
  CheckRow, TextField, PrimaryButton,
} from '../components/UI.jsx';

const INJURIES = [
  { id: 'Plantar fasciitis', icon: 'shoe-off' },
  { id: 'Knee pain',         icon: 'urgent' },
  { id: 'Lower back',        icon: 'spine' },
  { id: 'Shoulder',          icon: 'hand-stop' },
  { id: 'Elbow / wrist',     icon: 'arm' },
  { id: 'Neck',              icon: 'e-passport' },
  { id: 'None' }, // Add this!
];
const CONDITIONS = [
  { id: 'Diabetes (Type 1 or 2)' },
  { id: 'Hypertension' },
  { id: 'Thyroid condition' },
  { id: 'Heart condition', sub: 'Doctor clearance recommended' },
  { id: 'None' }, // Add this!
];

export default function Step5({ onNext, onBack, onSkip, dir }) {
  const { state, dispatch } = useOnboarding();
  const h = state.health;
  const set = value => dispatch({ type: 'patch', slice: 'health', value });
  const toggle = (field, value) => dispatch({ type: 'toggle', slice: 'health', field, value });


  const valid = h.injuries.length > 0 && h.conditions.length > 0;

  return (
    <div className={`screen anim-${dir}`}>
      <ObHeader step={5} onBack={onBack} onSkip={onSkip} />
      <ProgressSteps current={5} />
      <StepIntro icon="stethoscope" tag="Health"
        title="Any injuries or<br>health conditions?"
        sub="Your coach will never suggest exercises that can hurt you." />

      <SectionLabel>Injuries (select all that apply)</SectionLabel>
      <div className="inj-grid">
        {INJURIES.map(i => (
          <div key={i.id} className={`inj-card ${h.injuries.includes(i.id) ? 'sel' : ''}`}
            onClick={() => toggle('injuries', i.id)}>
            <i className={`ti ti-${i.icon} inj-ico`} />
            <div className="inj-lbl">{i.id}</div>
          </div>
        ))}
      </div>

      <SectionLabel>Medical conditions (optional)</SectionLabel>
      <div>
        {CONDITIONS.map(c => (
          <CheckRow key={c.id} label={c.id} sub={c.sub}
            checked={h.conditions.includes(c.id)}
            onClick={() => toggle('conditions', c.id)} />
        ))}
      </div>

      <SectionLabel>Any exercises to avoid?</SectionLabel>
      <TextField value={h.avoid} onChange={v => set({ avoid: v })}
        placeholder="e.g. No running, no jumping (optional)" />

      <div className="cta">
        <PrimaryButton onClick={onNext}disabled={!valid}>
          Build my plan <i className="ti ti-arrow-right btn-icon" />
        </PrimaryButton>
      </div>
    </div>
  );
}
