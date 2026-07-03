import React, { useState, useEffect } from 'react';
import { Bar, CoachCard, Thumb, PushHeader } from '../components.jsx';
import { nutrition, detectedMeal } from '../data.js';

/* ─────────────────────────── DIET TAB ────────────────────── */
export function Diet({ onLogMeal }) {
  const n = nutrition;
  const [water, setWater] = useState(n.water);
  const R = 74, C = 2 * Math.PI * R;
  const pct = Math.min(1, n.kcal / n.kcalTarget);

  return (
    <div className="app-body">
      <div className="screen-pad scroll">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-.02em', color: '#1A1A2E' }}>Today's nutrition</div>
          <div style={{ fontSize: 12, color: '#8A8A85' }}>Tue, 2 Jul</div>
        </div>

        {/* ring */}
        <div className="ring-wrap" style={{ marginBottom: 20 }}>
          <svg width="172" height="172" viewBox="0 0 172 172" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="86" cy="86" r={R} fill="none" stroke="#EDEDEA" strokeWidth="14" />
            <circle cx="86" cy="86" r={R} fill="none" stroke="#C8F25C" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} />
          </svg>
          <div className="ring-center">
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: '#1A1A2E' }}>{n.kcal.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#8A8A85' }}>of {n.kcalTarget.toLocaleString()} kcal</div>
            <div style={{ fontSize: 11, color: '#3A7A0A', marginTop: 3 }}>{n.kcalTarget - n.kcal} left</div>
          </div>
        </div>

        {/* macros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <Macro label="Protein" val={n.protein} target={n.proteinTarget} unit="g" max={n.proteinTarget} />
          <Macro label="Carbs" val={n.carbs} target={n.carbsTarget} unit="g" max={n.carbsTarget} muted />
          <Macro label="Fat" val={n.fat} target={n.fatTarget} unit="g" max={n.fatTarget} muted />
        </div>

        {/* water */}
        <div className="card" style={{ borderRadius: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 11 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>Water</span>
            <span style={{ fontSize: 12, color: '#8A8A85' }}>{water} / {n.waterTarget} glasses</span>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            {Array.from({ length: n.waterTarget }, (_, i) => (
              <i key={i} className={`ti ${i < water ? 'ti-glass-full' : 'ti-glass'}`}
                 style={{ fontSize: 22, color: i < water ? '#1A1A2E' : '#C8C8C4', cursor: 'pointer' }}
                 onClick={() => setWater(i + 1 === water ? i : i + 1)} />
            ))}
          </div>
        </div>

        {/* meals */}
        <div className="s-label" style={{ marginTop: 0 }}>Meals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {n.meals.map(m => (
            <div key={m.id} className="card" style={{ borderRadius: 14, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Thumb radius={11} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{m.type}</div><div style={{ fontSize: 12, color: '#8A8A85', marginTop: 1 }}>{m.items}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{m.kcal}</div><div style={{ fontSize: 11, color: '#8A8A85' }}>{m.protein}g P</div></div>
            </div>
          ))}
          <div onClick={onLogMeal} style={{ background: '#fff', border: '1.5px dashed #DDDDD9', borderRadius: 14, padding: 14, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', color: '#8A8A85', cursor: 'pointer' }}>
            <i className="ti ti-plus" style={{ fontSize: 16 }} /><span style={{ fontSize: 13, fontWeight: 500 }}>Log dinner</span>
          </div>
        </div>

        <div style={{ marginBottom: 4 }}><CoachCard>{n.tip}</CoachCard></div>
      </div>

      <div className="fab" onClick={onLogMeal}>
        <div className="fab-btn"><i className="ti ti-camera" /></div>
        <span className="fab-lbl">Log meal</span>
      </div>
    </div>
  );
}

function Macro({ label, val, target, unit, max, muted }) {
  return (
    <div className="card" style={{ flex: 1, borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 11, color: '#8A8A85', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 7 }}>{val}<span style={{ fontSize: 11, color: '#8A8A85', fontWeight: 400 }}>/{target}{unit}</span></div>
      <Bar value={val} max={max} muted={muted} />
    </div>
  );
}

/* ─────────────────────────── FOOD PHOTO ANALYSIS ─────────── */
export function FoodPhoto({ onBack, onConfirm }) {
  const [phase, setPhase] = useState('loading'); // loading | results
  const [mealType, setMealType] = useState('Dinner');

  useEffect(() => {
    const t = setTimeout(() => setPhase('results'), 2200);
    return () => clearTimeout(t);
  }, []);

  const confIcon = { high: <i className="ti ti-circle-check-filled" style={{ fontSize: 15, color: '#3A7A0A' }} />, medium: <span style={{ fontSize: 13, color: '#D97706', fontWeight: 600 }}>~</span>, low: <span style={{ fontSize: 13, color: '#8A8A85', fontWeight: 600 }}>?</span> };
  const totalK = detectedMeal.items.reduce((s, i) => s + i.kcal, 0);
  const totalP = detectedMeal.items.reduce((s, i) => s + i.protein, 0);

  if (phase === 'loading') {
    return (
      <div className="app-body" style={{ background: '#1A1A2E' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '52%', background: 'linear-gradient(135deg,#4A4A3A,#2A2A24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A6A5A', fontSize: 40 }}><i className="ti ti-photo" /></div>
        <div style={{ flex: 1 }} />
        <div style={{ background: '#F5F5F3', borderRadius: '28px 28px 0 0', padding: '26px 24px 40px', position: 'relative', zIndex: 2 }}>
          <div className="sheet-grab" style={{ margin: '0 auto 22px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EDFCD2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><i className="ti ti-brain" style={{ fontSize: 28, color: '#3A7A0A' }} /></div>
            <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-.02em', color: '#1A1A2E', marginBottom: 20 }}>Analysing your meal…</div>
            <svg width="180" height="34" viewBox="0 0 180 34" style={{ marginBottom: 18 }}><polyline points="6,17 40,17 52,5 64,29 76,17 110,17 122,9 134,25 146,17 174,17" fill="none" stroke="#C8F25C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pulse-dot" /></svg>
            <div style={{ fontSize: 13, color: '#8A8A85', lineHeight: 1.5 }}>Identifying ingredients, estimating portions…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-body">
      <PushHeader title="Detected meal" onBack={onBack} />
      <div className="screen-pad scroll" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#4A4A3A,#2A2A24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A6A5A', fontSize: 20, flex: 'none' }}><i className="ti ti-photo" /></div>
          <div style={{ fontSize: 12, color: '#8A8A85' }}>Tap any item to correct it</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(t => (
            <div key={t} className="pill" onClick={() => setMealType(t)} style={mealType === t ? { background: '#1A1A2E', borderColor: '#1A1A2E', color: '#C8F25C', fontWeight: 500 } : undefined}>{t}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          {detectedMeal.items.map(it => (
            <div key={it.name} className="card" style={{ borderRadius: 14, padding: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{it.name}</span>{confIcon[it.conf]}</div>
                <span style={{ fontSize: 12, color: '#8A8A85' }}>{it.qty}</span>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#8A8A85' }}><span>{it.kcal} kcal</span><span>{it.protein}g protein</span></div>
            </div>
          ))}
        </div>
        <div style={{ background: '#E8E8F5', borderRadius: 14, padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>Total</span>
          <span style={{ fontSize: 13, color: '#1A1A2E' }}>{totalK} kcal · {totalP}g protein</span>
        </div>
        <div style={{ fontSize: 12, color: '#8A8A85', lineHeight: 1.5, display: 'flex', gap: 7 }}><i className="ti ti-brain" style={{ color: '#3A7A0A', fontSize: 15, flex: 'none' }} /> {detectedMeal.tip}</div>
      </div>
      <div className="sticky-cta" style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onConfirm}>Confirm &amp; log</button>
        <button className="btn" style={{ flex: 'none', padding: '15px 18px', background: '#fff', border: '1.5px solid #1A1A2E', color: '#1A1A2E' }}>Edit</button>
      </div>
    </div>
  );
}
