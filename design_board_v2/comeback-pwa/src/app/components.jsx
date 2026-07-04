import React from 'react';

// Small shared building blocks for the main app.

export function StatusBar({ time = '9:41', light = false }) {
  const c = light ? '#fff' : '#1A1A2E';
  return (
    <div className="status-bar">
      <span className="status-time" style={{ color: c }}>{time}</span>
      <div className="status-icons" style={{ color: c }}>
        <i className="ti ti-wifi" /><i className="ti ti-battery-2" />
      </div>
    </div>
  );
}

export function Wordmark() {
  return <div className="wm-sm"><span className="a">come</span><span className="b">back</span></div>;
}

export function Bar({ value, max, muted }) {
  const pct = Math.max(2, Math.min(100, Math.round((value / max) * 100)));
  return <div className="bar"><i className={muted ? 'muted' : ''} style={{ width: pct + '%' }} /></div>;
}

export function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'workout', icon: 'ti-barbell' },
    { id: 'diet', icon: 'ti-salad' },
    { id: 'coach', icon: 'ti-message-circle' },
    { id: 'progress', icon: 'ti-trending-up' },
  ];
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button key={t.id} className={`tab ${active === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          <i className={`ti ${t.icon}`} />
          <span className="tab-dot" />
        </button>
      ))}
    </div>
  );
}

// Simple top bar for pushed screens (back + title + optional right icon)
export function PushHeader({ title, onBack, right, onRight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
      <button className="icon-btn" onClick={onBack} aria-label="Back"><i className="ti ti-arrow-left" /></button>
      <span style={{ fontSize: 15, fontWeight: 500, color: '#1A1A2E' }}>{title}</span>
      {right
        ? <button className="icon-btn" onClick={onRight}><i className={`ti ${right}`} /></button>
        : <span style={{ width: 38 }} />}
    </div>
  );
}

export function CoachCard({ children, label = 'Your coach' }) {
  return (
    <div className="coach-card">
      <div className="coach-ico"><i className="ti ti-brain" /></div>
      <div><div className="coach-label">{label}</div><div className="coach-text">{children}</div></div>
    </div>
  );
}

export function Thumb({ size = 48, radius = 12, icon = 'ti-photo', style }) {
  return <div className="thumb" style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.36, ...style }}><i className={`ti ${icon}`} /></div>;
}

// Bottom sheet over a dimmed scrim. Children are the sheet body.
export function Sheet({ onClose, children, maxHeight = '82%' }) {
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" style={{ maxHeight }} onClick={e => e.stopPropagation()}>
        <div className="sheet-grab" />
        {children}
      </div>
    </div>
  );
}
