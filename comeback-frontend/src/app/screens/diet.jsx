import React, { useState, useEffect, useRef } from 'react';
import { Bar, CoachCard, Thumb, PushHeader } from '../components.jsx';
import { detectedMeal } from '../data.js';
import { useOnboarding } from '../../lib/store.jsx';

/* ─────────────────────────── DIET TAB ────────────────────── */
export function Diet({ onLogMeal }) {
  const { state } = useOnboarding();
  const [dietData, setDietData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 800;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onLogMeal(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input so same file can be selected again
  };

  useEffect(() => {
    async function fetchDiet() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/diet/today`, {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        setDietData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchTip() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/diet/tip`, {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const tipData = await res.json();
        if (tipData.tip) {
          setDietData(prev => prev ? { 
            ...prev, 
            dietLog: { ...(prev.dietLog || {}), dailyCoachTip: tipData.tip } 
          } : prev);
        }
      } catch (err) {
        console.error("Failed to fetch tip:", err);
      }
    }

    if (state.token) {
      fetchDiet();
      fetchTip();
    }
  }, [state.token]);

  const handleSetWater = async (glasses) => {
    // Optimistic update
    setDietData(prev => prev ? { ...prev, runningTotals: { ...prev.runningTotals, waterGlasses: glasses } } : prev);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/diet/water`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
        body: JSON.stringify({ glasses })
      });
    } catch (err) {
      console.error("Failed to update water", err);
    }
  };

  if (loading) {
    return (
      <div className="app-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderTopColor: '#C8F25C' }} />
      </div>
    );
  }

  const dietLog = dietData?.dietLog;
  const totals = dietData?.runningTotals || { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, waterGlasses: 0 };
  const targets = dietData?.targets || { dailyCalorieTarget: 2000, dailyProteinTarget: 130 };
  const meals = dietLog?.meals || [];

  const kcalTarget = targets.dailyCalorieTarget;
  const pTarget = targets.dailyProteinTarget;
  
  // Derive carbs/fat targets since backend only has calorie & protein targets
  const remainingKcalAfterProtein = Math.max(0, kcalTarget - (pTarget * 4));
  const fatTarget = Math.round((kcalTarget * 0.25) / 9) || 65;
  const carbsTarget = Math.round((remainingKcalAfterProtein - (fatTarget * 9)) / 4) || 250;

  const R = 74, C = 2 * Math.PI * R;
  const pct = Math.min(1, totals.calories / kcalTarget) || 0;
  
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const waterTarget = 8;
  const water = totals.waterGlasses;

  return (
    <div className="app-body">
      <div className="screen-pad scroll">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-.02em', color: '#1A1A2E' }}>Today's nutrition</div>
          <div style={{ fontSize: 12, color: '#8A8A85' }}>{currentDate}</div>
        </div>

        {/* ring */}
        <div className="ring-wrap" style={{ marginBottom: 20 }}>
          <svg width="172" height="172" viewBox="0 0 172 172" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="86" cy="86" r={R} fill="none" stroke="#EDEDEA" strokeWidth="14" />
            <circle cx="86" cy="86" r={R} fill="none" stroke="#C8F25C" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} />
          </svg>
          <div className="ring-center">
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: '#1A1A2E' }}>{Math.round(totals.calories).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#8A8A85' }}>of {kcalTarget.toLocaleString()} kcal</div>
            <div style={{ fontSize: 11, color: '#3A7A0A', marginTop: 3 }}>{Math.max(0, kcalTarget - totals.calories)} left</div>
          </div>
        </div>

        {/* macros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <Macro label="Protein" val={Math.round(totals.proteinG)} target={pTarget} unit="g" max={pTarget} />
          <Macro label="Carbs" val={Math.round(totals.carbsG)} target={carbsTarget} unit="g" max={carbsTarget} muted />
          <Macro label="Fat" val={Math.round(totals.fatG)} target={fatTarget} unit="g" max={fatTarget} muted />
        </div>

        {/* water */}
        <div className="card" style={{ borderRadius: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 11 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>Water</span>
            <span style={{ fontSize: 12, color: '#8A8A85' }}>{water} / {waterTarget} glasses</span>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            {Array.from({ length: waterTarget }, (_, i) => (
              <i key={i} className={`ti ${i < water ? 'ti-glass-full' : 'ti-glass'}`}
                 style={{ fontSize: 22, color: i < water ? '#1A1A2E' : '#C8C8C4', cursor: 'pointer' }}
                 onClick={() => handleSetWater(i + 1 === water ? i : i + 1)} />
            ))}
          </div>
        </div>

        {/* meals */}
        <div className="s-label" style={{ marginTop: 0 }}>Meals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {meals.length > 0 ? (
            meals.map(m => (
              <div key={m._id} className="card" style={{ borderRadius: 14, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt="meal" style={{ width: 44, height: 44, borderRadius: 11, objectFit: 'cover' }} />
                ) : (
                  <Thumb radius={11} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', textTransform: 'capitalize' }}>{m.mealType}</div>
                  <div style={{ fontSize: 12, color: '#8A8A85', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                    {m.items?.map(it => it.name).join(', ') || 'Logged meal'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{Math.round(m.totalCalories)}</div>
                  <div style={{ fontSize: 11, color: '#8A8A85' }}>{Math.round(m.totalProteinG)}g P</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#8A8A85', fontSize: 13, padding: '16px 0' }}>No meals logged yet</div>
          )}
          
          <label style={{ background: '#fff', border: '1.5px dashed #DDDDD9', borderRadius: 14, padding: 14, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', color: '#8A8A85', cursor: 'pointer' }}>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <i className="ti ti-plus" style={{ fontSize: 16 }} /><span style={{ fontSize: 13, fontWeight: 500 }}>Log meal</span>
          </label>
        </div>

        <div style={{ marginBottom: 4 }}>
          <CoachCard>{dietLog?.dailyCoachTip || "Log your first meal today to get a personalized nutrition tip from your coach!"}</CoachCard>
        </div>
      </div>

      <label className="fab" style={{ cursor: 'pointer', margin: 0 }}>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
        <div className="fab-btn"><i className="ti ti-camera" /></div>
        <span className="fab-lbl">Log meal</span>
      </label>
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
export function FoodPhoto({ photo, onBack, onConfirm }) {
  const { state } = useOnboarding();
  const [phase, setPhase] = useState('loading'); // loading | results
  
  const hour = new Date().getHours();
  const defaultMeal = hour < 11 ? 'Breakfast' : hour < 16 ? 'Lunch' : hour < 19 ? 'Snack' : 'Dinner';
  const [mealType, setMealType] = useState(defaultMeal);
  
  const [detectedMeal, setDetectedMeal] = useState({ items: [], tip: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPhase('results');
      return;
    }

    async function analyze() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/diet/analyze-photo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({ photo, mealType: defaultMeal })
        });
        const data = await res.json();
        
        if (!res.ok) {
          alert(`AI Error: ${data.message || 'Analysis failed'}`);
          return;
        }

        if (data && data.items) {
          setDetectedMeal({
            items: data.items.map(it => ({
              name: it.name,
              qty: it.quantityG + 'g',
              kcal: it.calories,
              protein: it.proteinG,
              carbs: it.carbsG || 0,
              fat: it.fatG || 0,
              conf: (it.confidence || 'high').toLowerCase()
            })),
            tip: data.oneTip || ''
          });
        }
      } catch (e) {
        console.error("AI Analysis failed:", e);
        alert("Failed to connect to AI for analysis.");
      } finally {
        setPhase('results');
      }
    }
    
    analyze();
  }, [photo]);

  const handleConfirm = async () => {
    if (detectedMeal.items.length === 0) {
      onConfirm();
      return;
    }
    
    try {
      const itemsPayload = detectedMeal.items.map(it => ({
        name: it.name,
        quantityG: parseInt(it.qty) || 0,
        calories: it.kcal,
        proteinG: it.protein,
        carbsG: it.carbs || 0,
        fatG: it.fat || 0
      }));

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/diet/log-meal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ 
          mealType: mealType.toLowerCase(), 
          items: itemsPayload,
          aiTip: detectedMeal.tip
        })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        alert(`Failed to log meal to server: ${errText}`);
        return;
      }

      onConfirm();
    } catch (e) {
      console.error("Failed to log meal:", e);
      onConfirm();
    }
  };

  const handleItemChange = (index, field, value) => {
    setDetectedMeal(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const confIcon = { high: <i className="ti ti-circle-check-filled" style={{ fontSize: 15, color: '#3A7A0A' }} />, medium: <span style={{ fontSize: 13, color: '#D97706', fontWeight: 600 }}>~</span>, low: <span style={{ fontSize: 13, color: '#8A8A85', fontWeight: 600 }}>?</span> };
  const totalK = detectedMeal.items.reduce((s, i) => s + i.kcal, 0);
  const totalP = detectedMeal.items.reduce((s, i) => s + i.protein, 0);

  const bgStyle = photo ? { backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(135deg,#4A4A3A,#2A2A24)' };

  if (phase === 'loading') {
    return (
      <div className="app-body" style={{ background: '#1A1A2E' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '52%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A6A5A', fontSize: 40, ...bgStyle }}>{!photo && <i className="ti ti-photo" />}</div>
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
    <div className="app-body" style={{ background: '#F5F5F3' }}>
      <PushHeader title="Detected meal" onBack={onBack} />
      <div className="screen-pad scroll" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A6A5A', fontSize: 20, flex: 'none', ...bgStyle }}>{!photo && <i className="ti ti-photo" />}</div>

        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(t => (
            <div key={t} className="pill" onClick={() => setMealType(t)} style={mealType === t ? { background: '#1A1A2E', borderColor: '#1A1A2E', color: '#C8F25C', fontWeight: 500 } : undefined}>{t}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          {detectedMeal.items.map((it, idx) => (
            <div key={idx} className="card" style={{ borderRadius: 14, padding: 13 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={it.name} onChange={(e) => handleItemChange(idx, 'name', e.target.value)} style={{ flex: 1, background: '#F5F5F3', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1A1A2E', outline: 'none' }} placeholder="Item name" />
                    <input type="text" value={it.qty} onChange={(e) => handleItemChange(idx, 'qty', e.target.value)} style={{ width: 70, background: '#F5F5F3', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1A1A2E', outline: 'none' }} placeholder="Qty" />
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="number" value={it.kcal} onChange={(e) => handleItemChange(idx, 'kcal', parseInt(e.target.value) || 0)} style={{ width: 70, background: '#F5F5F3', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1A1A2E', outline: 'none' }} /> <span style={{ fontSize: 12, color: '#8A8A85' }}>kcal</span>
                    <input type="number" value={it.protein} onChange={(e) => handleItemChange(idx, 'protein', parseInt(e.target.value) || 0)} style={{ width: 70, background: '#F5F5F3', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1A1A2E', outline: 'none', marginLeft: 8 }} /> <span style={{ fontSize: 12, color: '#8A8A85' }}>g protein</span>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{it.name}</span>{confIcon[it.conf]}</div>
                    <span style={{ fontSize: 12, color: '#8A8A85' }}>{it.qty}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#8A8A85' }}><span>{it.kcal} kcal</span><span>{it.protein}g protein</span></div>
                </>
              )}
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
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm}>Confirm &amp; log</button>
        <button className="btn" style={{ flex: 'none', padding: '15px 18px', background: isEditing ? '#1A1A2E' : '#fff', border: '1.5px solid #1A1A2E', color: isEditing ? '#C8F25C' : '#1A1A2E' }} onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Done' : 'Edit'}</button>
      </div>
    </div>
  );
}
