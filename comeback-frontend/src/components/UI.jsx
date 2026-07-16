// Shared onboarding primitives — one file, small focused components.
import React from 'react';

export function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-time">9:41</span>
      <div className="status-icons">
        <i className="ti ti-wifi" />
        <i className="ti ti-battery-2" />
      </div>
    </div>
  );
}

export function ProgressSteps({ current, total = 5 }) {
  return (
    <div className="progress-steps" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const cls = n < current ? 'done' : n === current ? 'active' : '';
        return <div key={n} className={`progress-step ${cls}`} />;
      })}
    </div>
  );
}

export function ObHeader({ step, onBack, onSkip, canSkip = true }) {
  return (
    <div className="ob-header">
      {onBack 
        ? <button className="back-btn" onClick={onBack} aria-label="Back"><i className="ti ti-arrow-left" /></button>
        : <span style={{ width: 28 }} />
      }
      <span className="step-counter">Step {step} of 5</span>
      {canSkip
        ? <button className="skip-btn" onClick={onSkip}>Skip</button>
        : <span style={{ width: 28 }} />}
    </div>
  );
}

export function StepIntro({ icon, tag, title, sub }) {
  return (
    <>
      {tag && <div className="step-tag"><i className={`ti ti-${icon}`} /> {tag}</div>}
      <div className="ob-q-title" dangerouslySetInnerHTML={{ __html: title }} />
      {sub && <div className="ob-q-sub">{sub}</div>}
    </>
  );
}

export function SectionLabel({ children }) {
  return <div className="s-label">{children}</div>;
}

export function TextField({ value, onChange, placeholder, type = 'text', error, hint, hintOk, style, autoComplete, readOnly, min, max }) {
  const isDate = type === 'date';
  
  return (
    <div style={{ position: 'relative' }}>
      <input
        className={`input ${value ? 'filled' : ''} ${error ? 'error' : ''} ${readOnly ? 'readonly' : ''} ${isDate && !value ? 'date-empty' : ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange && onChange(e.target.value)}
        style={style}
        autoComplete={autoComplete}
        readOnly={readOnly}
        min={min}
        max={max}
      />
      {isDate && (
        <i className="ti ti-calendar" style={{ 
          position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', 
          color: 'var(--c-text-muted)', fontSize: 18, pointerEvents: 'none' 
        }} />
      )}
      {error
        ? <div className="err-text"><i className="ti ti-alert-circle" /> {error}</div>
        : hint ? <div className={`hint ${hintOk ? 'ok' : ''}`}>{hint}</div> : null}
    </div>
  );
}

export function SuffixField({ value, onChange, placeholder, suffix, error }) {
  return (
    <div className={`input-suffix ${value ? 'filled' : ''} ${error ? 'error' : ''}`}>
      <input type="number" inputMode="numeric" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} />
      <span className="input-sfx">{suffix}</span>
    </div>
  );
}

export function Pill({ label, selected, onClick }) {
  return (
    <button className={`pill ${selected ? 'sel' : ''}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}

export function PillGroup({ options, value, onChange }) {
  return (
    <div className="pill-group">
      {options.map(o => (
        <Pill key={o} label={o} selected={value === o} onClick={() => onChange(o)} />
      ))}
    </div>
  );
}

export function OptionCard({ icon, iconBg, iconColor, title, sub, selected, onClick, variant }) {
  return (
    <div className={`opt-card ${variant === 'goal' ? 'goal-card' : ''} ${selected ? 'sel' : ''}`} onClick={onClick}>
      <div className="opt-icon" style={{ background: iconBg, color: iconColor }}>
        <i className={`ti ti-${icon}`} />
      </div>
      <div className="opt-body">
        <div className="opt-title">{title}</div>
        {sub && <div className="opt-sub">{sub}</div>}
      </div>
      <div className="opt-check"><i className="ti ti-check" /></div>
    </div>
  );
}

export function CheckRow({ label, sub, checked, onClick }) {
  return (
    <div className="chk-row" onClick={onClick}>
      <div className={`chk-box ${checked ? 'chk' : ''}`}><i className="ti ti-check" /></div>
      <div>
        <div className="chk-lbl">{label}</div>
        {sub && <div className="chk-sub">{sub}</div>}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, lime }) {
  return (
    <button className={`btn ${lime ? 'btn-lime' : 'btn-primary'}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function FilterDropdown({ icon, value, onChange, options, placeholder }) {
  return (
    <div className="filter-dropdown-wrapper">
      {icon && <i className={`ti ti-${icon} filter-icon`} />}
      <select 
        className={`filter-select ${icon ? 'has-icon' : ''}`} 
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        <option value="All" disabled hidden>{placeholder || "Select..."}</option>
        {options.map(o => (
          <option key={o} value={o}>{o === 'All' ? `All ${placeholder ? placeholder.replace('Search ', '').replace('...', '') : ''}` : o}</option>
        ))}
      </select>
      <i className="ti ti-chevron-down filter-chevron" />
    </div>
  );
}
