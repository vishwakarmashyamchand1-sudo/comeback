import React, { useState, useEffect } from 'react';
import { PushHeader } from '../components.jsx';
import { useOnboarding } from '../../lib/store.jsx';
import { auth } from '../../lib/firebase.js';
import { signOut } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function Profile({ onBack }) {
  const { state } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!state.token) return;
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const json = await res.json();
        if (res.ok && json.success && json.user) {
          const d = json.user;
          
          // Calculate BMI
          let bmiStr = '--';
          if (d.heightCm && d.currentWeightKg) {
            const h = d.heightCm / 100;
            const bmi = d.currentWeightKg / (h * h);
            bmiStr = bmi.toFixed(1);
          }

          // Format Month Year
          const createdDate = new Date(d.createdAt || Date.now());
          const since = createdDate.toLocaleString('default', { month: 'short', year: 'numeric' });

          // Format Goal
          let targetMonth = '';
          if (d.targetDate) {
            targetMonth = ' by ' + new Date(d.targetDate).toLocaleString('default', { month: 'short' });
          }
          const goalStr = `${d.primaryGoal || 'Get Fit'}${d.targetWeightKg ? ` · ${d.targetWeightKg}kg` : ''}${targetMonth}`;

          // Format Schedule
          const schedStr = `${d.daysPerWeek || 3} days / week · ${d.preferredTime || 'Flexible'}`;

          // Format Diet
          let dietStr = d.dietType || 'Any diet';
          if (d.foodRestrictions && d.foodRestrictions.length > 0) {
            dietStr += ` · ${d.foodRestrictions.join(', ')}`;
          }

          setP({
            name: d.name || 'User',
            initials: (d.name || 'U').charAt(0).toUpperCase(),
            place: 'Earth', // Add location if supported later
            since,
            streak: d.currentWeekNumber || 1, // Example metric mapping
            level: d.fitnessLevel || 'Beginner',
            weight: d.currentWeightKg || '--',
            height: d.heightCm || '--',
            bmi: bmiStr,
            goal: goalStr,
            schedule: schedStr.toLowerCase(),
            diet: dietStr.toLowerCase()
          });
        } else {
          setError(json.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError('Network error loading profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [state.token]);

  if (loading || !p) {
    return (
      <div className="app-body">
        <PushHeader title="Profile" onBack={onBack} />
        <div className="screen-pad scroll" style={{ paddingTop: 0, textAlign: 'center', marginTop: 40, color: '#8A8A85' }}>
          {error ? (
            <div style={{ color: '#E53E3E' }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 24, marginBottom: 8 }} />
              <div>{error}</div>
            </div>
          ) : (
            'Loading profile...'
          )}
          <br /><br />
          <button className="btn" style={{ background: '#fff', border: '1.5px solid #DDDDD9', color: '#8A8A85', marginTop: 20 }} onClick={async () => {
            try { await signOut(auth); } catch (e) {}
            localStorage.clear();
            window.location.reload();
          }}>
            <i className="ti ti-logout" /> Sign in again
          </button>
        </div>
      </div>
    );
  }

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
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1A1A2E', textTransform: 'capitalize' }}>{p.name}</div>
          <div style={{ fontSize: 13, color: '#8A8A85', marginTop: 2 }}>Member since {p.since}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span className="badge green" style={{ padding: '5px 12px' }}>🔥 {p.streak}-week streak</span>
            <span className="badge neutral" style={{ padding: '5px 12px', textTransform: 'capitalize' }}>{p.level}</span>
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
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, color: '#1A1A2E' }}>{r.label}</div><div style={{ fontSize: 12, color: '#8A8A85', marginTop: 1, textTransform: 'capitalize' }}>{r.value}</div></div>
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

        <button className="btn" style={{ background: '#fff', border: '1.5px solid #DDDDD9', color: '#8A8A85' }} onClick={async () => {
          try { await signOut(auth); } catch (e) {}
          localStorage.removeItem('comeback.onboarded');
          localStorage.removeItem('hasCompletedOnboarding');
          localStorage.removeItem('comeback.onboarding.v1');
          window.location.reload();
        }}>
          <i className="ti ti-logout" /> Sign out
        </button>
      </div>
    </div>
  );
}
