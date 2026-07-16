import React from 'react';
import { useOnboarding } from '../lib/store.jsx';
import { calcAge, calcBMI, bmiBand, validateNum } from '../lib/derive.js';
import {
  StatusBar, ObHeader, ProgressSteps, StepIntro, SectionLabel,
  TextField, SuffixField, PrimaryButton,
} from '../components/UI.jsx';

export default function Step1({ onNext, onBack, onSkip, dir }) {
  const { state, dispatch } = useOnboarding();
  const p = state.profile || {};
  const set = value => dispatch({ type: 'patch', slice: 'profile', value });
  const todayStr = new Date().toISOString().split('T')[0];

  const age = calcAge(p.dob);
  const bmi = calcBMI(p.heightCm, p.weightKg);
  const band = bmiBand(bmi);

  const hErr = validateNum('heightCm', p.heightCm);
  const wErr = validateNum('weightKg', p.weightKg);

  const valid =
    (p.name || '').trim() && p.gender && age != null &&
    p.heightCm && p.weightKg && !hErr && !wErr &&
    p.targetWeight && p.targetDate;

  return (
    <div className={`screen anim-${dir}`}>
      <ObHeader step={1} onBack={onBack} onSkip={onSkip} canSkip={false} />
      <ProgressSteps current={1} />
      <StepIntro icon="ruler" tag="About you"
        title="Let's start with<br>the basics"
        sub="Your coach needs this to build the right plan for you." />

      <SectionLabel>Your name</SectionLabel>
      <TextField value={p.name || ''} onChange={v => set({ name: v })} 
        placeholder="Enter your name" />

      <SectionLabel>Gender</SectionLabel>
      <div className="gender-row">
        {[['Male', 'gender-male'], ['Female', 'gender-female']].map(([g, ic]) => (
          <div key={g} className={`gender-card ${p.gender === g ? 'sel' : ''}`} onClick={() => set({ gender: g })}>
            <i className={`ti ti-${ic} gender-icon`} />
            <span className="gender-lbl">{g}</span>
          </div>
        ))}
      </div>

      <SectionLabel>Date of birth</SectionLabel>
      <div style={{ marginBottom: 4 }}>
        <TextField type="date" value={p.dob} onChange={v => set({ dob: v })} max={todayStr} placeholder="Select date" />
      </div>
      <div className={`hint ${age != null ? 'ok' : ''}`}>
        {age != null ? `Age: ${age} years` : 'Used to calculate your daily calorie target'}
      </div>

      <SectionLabel>Height &amp; current weight</SectionLabel>
      <div className="input-row col2">
        <SuffixField value={p.heightCm} onChange={v => set({ heightCm: v })} placeholder="170" suffix="cm" error={!!hErr} />
        <SuffixField value={p.weightKg} onChange={v => set({ weightKg: v })} placeholder="79" suffix="kg" error={!!wErr} />
      </div>
      {(hErr || wErr) && <div className="err-text"><i className="ti ti-alert-circle" /> {hErr || wErr}</div>}

      <SectionLabel>Target weight &amp; date</SectionLabel>
      <div className="input-row col2">
        <SuffixField value={p.targetWeight} onChange={v => set({ targetWeight: v })} placeholder="70" suffix="kg" />
        <TextField type="date" value={p.targetDate} onChange={v => set({ targetDate: v })} min={todayStr} placeholder="Select date" />
      </div>

      {band && (
        <div className="bmi-strip" style={{ marginTop: 12 }}>
          <div className="bmi-ico"><i className="ti ti-activity" /></div>
          <div style={{ flex: 1 }}>
            <div className="bmi-val">BMI {bmi}</div>
            <div className="bmi-lbl">Calculated from your details</div>
          </div>
          <span className={`bmi-badge ${band.tone}`}>{band.label}</span>
        </div>
      )}

      <div className="cta">
        <PrimaryButton onClick={onNext} disabled={!valid}>
          Continue <i className="ti ti-arrow-right btn-icon" />
        </PrimaryButton>
      </div>
    </div>
  );
}
