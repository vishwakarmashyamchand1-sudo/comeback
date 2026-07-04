import React from 'react';
import { PushHeader } from '../components.jsx';
import { profile } from '../data.js';

export function Profile({ onBack }) {
  const p = profile;
  const planRows = [
    { icon: 'ti-target', label: 'Goal', value: p.goal },
    { icon: 'ti-calendar-week', label: 'Training schedule', value: p.schedule },
    { icon: 'ti-salad', label: 'Diet & restrictions', value: p.diet },
  ];
  const appRows = [
    { icon: 'ti-bell', label: 'Notifications & reminders' },
    { icon: 'ti-users', label: 'Circle & privacy', hint: 'Chart visible' },
    { icon: 'ti-heart-rate-monitor', label: 'Connected apps & wearables' },
    { icon: 'ti-help-circle', label: 'Help & support' },
  ];

  return (
    <div className="app-body">
      <PushHeader title="Profile" onBack={onBack} />
      <div className="screen-pad scroll" style={{ paddingTop: 0 }}>
        {/* identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
          <div className="avatar navy" style={{ width: 76, height: 76, fontSize: 28, marginBottom: 12, position: 'relative' }}>
            {p.initials}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#C8F25C', color: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, border: '3px solid #F5F5F3' }}><i className="ti ti-pencil" /></div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1A1A2E' }}>{p.name}</div>
          <div style={{ fontSize: 13, color: '#8A8A85', marginTop: 2 }}>{p.place} · Member since {p.since}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span className="badge green" style={{ padding: '5px 12px' }}>🔥 {p.streak}-day streak</span>
            <span className="badge neutral" style={{ padding: '5px 12px' }}>{p.level}</span>
          </div>
        </div>

        {/* body stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[[p.weight, 'kg', 'Weight'], [p.height, 'cm', 'Height'], [p.bmi, '', 'BMI']].map(([v, u, l]) => (
            <div key={l} className="card" style={{ flex: 1, borderRadius: 14, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E' }}>{v}<span style={{ fontSize: 11, color: '#8A8A85', fontWeight: 400 }}>{u}</span></div>
              <div style={{ fontSize: 11, color: '#8A8A85', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* plan & goals */}
        <div className="s-label" style={{ marginTop: 0 }}>Plan &amp; goals</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          {planRows.map((r, i) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderBottom: i < planRows.length - 1 ? '1px solid #EDEDEA' : 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#E8E8F5', color: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flex: 'none' }}><i className={`ti ${r.icon}`} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, color: '#1A1A2E' }}>{r.label}</div><div style={{ fontSize: 12, color: '#8A8A85', marginTop: 1 }}>{r.value}</div></div>
              <i className="ti ti-chevron-right" style={{ color: '#8A8A85', fontSize: 17 }} />
            </div>
          ))}
        </div>

        {/* app settings */}
        <div className="s-label">App</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          {appRows.map((r, i) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderBottom: i < appRows.length - 1 ? '1px solid #EDEDEA' : 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#E8E8F5', color: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flex: 'none' }}><i className={`ti ${r.icon}`} /></div>
              <div style={{ flex: 1, fontSize: 14, color: '#1A1A2E' }}>{r.label}</div>
              {r.hint && <span style={{ fontSize: 11, color: '#8A8A85', marginRight: 6 }}>{r.hint}</span>}
              <i className="ti ti-chevron-right" style={{ color: '#8A8A85', fontSize: 17 }} />
            </div>
          ))}
        </div>

        <button className="btn" style={{ background: '#fff', border: '1.5px solid #DDDDD9', color: '#8A8A85' }}><i className="ti ti-logout" /> Sign out</button>
      </div>
    </div>
  );
}
