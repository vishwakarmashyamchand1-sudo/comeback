import React, { useState, useEffect } from 'react';
import { Wordmark, Bar, CoachCard, Thumb, PushHeader, Sheet } from '../components.jsx';
import { todayWorkout, tomorrow, nutrition, circle, dayTypes } from '../data.js';
import { useOnboarding } from '../../lib/store.jsx';

/* ─────────────────────────── DASHBOARD (Workout tab home) ── */
export function Dashboard({ workout, done, onStart, onViewSummary, onOpenCircle, goDiet, onOpenProfile, onChangeDay, weeklyPlanSplit, onFocusChange }) {
  const { state } = useOnboarding();
  const userName = state.profile?.name || 'Athlete';
  const initial = userName.charAt(0).toUpperCase();

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const w = workout || todayWorkout; // fallback
  const [dayType, setDayType] = useState(w.sessionType || w.type || 'Full Body');
  const [dayOpen, setDayOpen] = useState(false);

  // Dynamically generate the title based on the selected dayType safely
  const safeDayType = (typeof dayType === 'string' && dayType.trim() !== '') ? dayType : 'Full Body';
  const dt = dayTypes.find(d => typeof d.name === 'string' && d.name.toLowerCase().includes(safeDayType.toLowerCase().split(' ')[0]));
  const dynamicTitle = dt 
    ? `${dt.name} — ${dt.muscles ? dt.muscles.replace(/ · /g, ' & ') : 'Rest Day'}`
    : safeDayType.charAt(0).toUpperCase() + safeDayType.slice(1);

  return (
    <div className="app-body">
      <div className="screen-pad scroll">
        <div className="app-top">
          <div>
            <div style={{ marginBottom: 10 }}><Wordmark /></div>
            <div className="greeting" style={{ textTransform: 'capitalize' }}>{greet}, {userName}</div>
            <div className="subtle">{currentDay} · Week {w.week} · Day {w.day}</div>
          </div>
          <div style={{ display: 'flex', gap: 9, flex: 'none' }}>
            <button className="icon-btn"><i className="ti ti-bell" />{!done && <span className="dot-red" />}</button>
            <button className="icon-btn" onClick={onOpenProfile} style={{ borderRadius: '50%', background: '#1A1A2E', color: '#C8F25C', border: 'none', fontSize: 14, fontWeight: 600 }}>{initial}</button>
          </div>
        </div>

        {/* workout card */}
        <div className="card-navy" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-barbell" style={{ color: '#C8F25C', fontSize: 18 }} />
              <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8A8AAA' }}>Today's workout</span>
            </div>
            {done
              ? <span className="badge green"><i className="ti ti-check" /> Done</span>
              : <span className="badge muted">Not started</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-.02em', color: '#fff' }}>{dynamicTitle}</div>
            {!done && (
              <div onClick={() => setDayOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none', background: '#ffffff14', borderRadius: 20, padding: '5px 10px', cursor: 'pointer' }}>
                <i className="ti ti-repeat" style={{ color: '#C8F25C', fontSize: 13 }} /><span style={{ fontSize: 11, fontWeight: 500, color: '#C8F25C' }}>Change</span>
              </div>
            )}
          </div>

          {done ? (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {[['47m', 'Duration', true], ['15/15', 'Sets done', false], ['1', 'New PR', true]].map(([v, l, lime]) => (
                  <div key={l} style={{ flex: 1, background: '#ffffff0D', borderRadius: 12, padding: 11 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: lime ? '#C8F25C' : '#fff' }}>{v}</div>
                    <div style={{ fontSize: 11, color: '#8A8AAA', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <button className="btn" style={{ background: '#ffffff14', color: '#fff', borderColor: 'transparent' }} onClick={onViewSummary}>View summary</button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                {w.exercises.filter(e => !e.wasSkipped).slice(0, 3).map((e, i) => (
                  <React.Fragment key={e.id || e.name}>
                    {i > 0 && <div className="rowline dark" />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#D8D8E4' }}>{e.name}</span><span style={{ color: '#8A8AAA' }}>{e.sets} × {e.reps}</span>
                    </div>
                  </React.Fragment>
                ))}
                <div style={{ fontSize: 12, color: '#6A6A8A', marginTop: 2 }}>+ {Math.max(0, w.exercises.filter(e => !e.wasSkipped).length - 3)} more · ~{w.durationMin} mins</div>
              </div>
              <button className="btn btn-lime" onClick={onStart}>Start workout <i className="ti ti-arrow-right btn-icon" /></button>
            </>
          )}
        </div>

        {/* nutrition strip */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="eyebrow">Nutrition</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={goDiet}><i className="ti ti-plus" /> Log meal</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Metric label="Calories" val={done ? '1,640' : '0'} target="2,000 kcal" value={done ? 1640 : 0} max={2000} />
            <Metric label="Protein" val={done ? '94' : '0'} target="130g" value={done ? 94 : 0} max={130} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#1A1A2E', fontWeight: 500 }}>Water</span><span style={{ color: '#8A8A85' }}>{done ? 6 : 0} / 8 glasses</span></div>
          </div>
        </div>

        {/* coach */}
        <div style={{ marginBottom: 14 }}>
          <CoachCard>{done ? 'Protein is 36g short. Add paneer or 2 eggs at dinner to close the gap.' : "Day 2 of your comeback. Ease in today — hit the planned weights, don't chase PRs yet."}</CoachCard>
        </div>

        {/* circle */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={onOpenCircle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
            <span className="eyebrow">Your circle today</span><i className="ti ti-chevron-right" style={{ color: '#8A8A85', fontSize: 16 }} />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {circle.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative' }}>
                  <div className={`avatar ${m.self ? 'navy' : 'soft'}`} style={{ width: 44, height: 44, fontSize: 15 }}>{m.initials}</div>
                  <span className={`status-dot ${m.status === 'went' ? 'went' : (m.self && !done ? 'no' : m.status === 'went' ? 'went' : 'no')}`} />
                </div>
                <span style={{ fontSize: 11, color: '#8A8A85' }}>{m.self ? 'You' : m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {dayOpen && <ChangeDaySheet current={dayType} weeklyPlanSplit={weeklyPlanSplit} onClose={() => setDayOpen(false)} onPick={(t, i) => { setDayType(t); setDayOpen(false); if (onFocusChange && i !== undefined) onFocusChange(i); }} />}
    </div>
  );
}

function Metric({ label, val, target, value, max }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{label}</span>
        <span style={{ color: '#8A8A85' }}>{val} / {target}</span>
      </div>
      <Bar value={value} max={max} />
    </div>
  );
}

/* ─────────────────────────── WORKOUT PLAN ────────────────── */
export function WorkoutPlan({ workout, weeklyPlanSplit, onBack, onStart, onAddExercise, refreshWorkout, isModifyMode }) {
  const { state } = useOnboarding();
  const w = workout || todayWorkout;
  const restDay = w.type === 'Rest';

  const [rows, setRows] = useState(() => w.exercises.map(e => ({ 
    ...e, 
    state: e.wasSkipped ? 'skipped' : (e.wasSubstituted ? 'sub' : (e.addedByUser ? 'added' : 'active')),
    was: e.substitutedFrom || e.was
  })));
  const [pickerFor, setPickerFor] = useState(null); // exercise id being substituted
  const [dayOpen, setDayOpen] = useState(false);
  const [dayType, setDayType] = useState(w.sessionType || w.type || 'Full Body');

  useEffect(() => {
    setRows(w.exercises.map(e => ({ 
      ...e, 
      state: e.wasSkipped ? 'skipped' : (e.wasSubstituted ? 'sub' : (e.addedByUser ? 'added' : 'active')),
      was: e.substitutedFrom || e.was
    })));
  }, [w.exercises]);

  const skipExercise = async (id) => {
    // Optimistic UI
    setRows(rs => rs.map(r => r.id === id ? { ...r, state: 'skipped' } : r));
    
    // Find index of the exercise in the array
    const exerciseIndex = rows.findIndex(r => r.id === id);
    
    // Save to backend if real workout
    if (w._id && state.token && exerciseIndex !== -1) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${w._id}/skip-exercise`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
          body: JSON.stringify({ exerciseIndex })
        });
        if (res.ok && refreshWorkout) refreshWorkout();
      } catch (err) {
        console.error("Failed to persist skip", err);
      }
    }
  };

  const restoreExercise = async (id) => {
    // Optimistic UI
    setRows(rs => rs.map(r => r.id === id ? { ...r, state: 'active' } : r));
    
    // Find index of the exercise in the array
    const exerciseIndex = rows.findIndex(r => r.id === id);
    
    // Save to backend if real workout
    if (w._id && state.token && exerciseIndex !== -1) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${w._id}/restore-exercise`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
          body: JSON.stringify({ exerciseIndex })
        });
        if (res.ok && refreshWorkout) refreshWorkout();
      } catch (err) {
        console.error("Failed to persist restore", err);
      }
    }
  };

  const remove = id => setRows(rs => rs.filter(r => r.id !== id));

  const substitute = async (id, name, newDbId) => {
    // Find index of the exercise in the array
    const exerciseIndex = rows.findIndex(r => r.id === id);
    
    // Optimistic UI
    setRows(rs => rs.map(r => r.id === id ? { ...r, state: 'sub', was: r.name, name, exerciseDbId: newDbId } : r));
    
    // Save to backend if real workout
    if (w._id && state.token && newDbId && exerciseIndex !== -1) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${w._id}/substitute-exercise`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
          body: JSON.stringify({ exerciseIndex, newExerciseId: newDbId })
        });
        if (res.ok && refreshWorkout) {
          refreshWorkout();
        }
      } catch (err) {
        console.error("Failed to persist substitution", err);
      }
    }
  };

  const activeCount = rows.filter(r => r.state !== 'skipped').length;

  if (restDay) {
    return (
      <div className="app-body">
        <PushHeader title={isModifyMode ? "Tomorrow's workout" : "Today's workout"} onBack={onBack} right="ti-calendar" />
        <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#E8E8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}><i className="ti ti-moon" style={{ fontSize: 40, color: '#1A1A2E' }} /></div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-.03em', color: '#1A1A2E', marginBottom: 8 }}>Rest day</div>
          <div style={{ fontSize: 14, color: '#8A8A85', lineHeight: 1.6, maxWidth: 250, marginBottom: 26 }}>Recovery is where the comeback happens. Your muscles rebuild today.</div>
          <div style={{ maxWidth: 300 }}><CoachCard>Take a 20-min walk and hit your protein. Push day is back tomorrow — come rested.</CoachCard></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-body">
      <PushHeader title={isModifyMode ? "Tomorrow's plan" : "Today's workout"} onBack={onBack} right="ti-calendar" />
      <div className="screen-pad scroll" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="badge green"><i className="ti ti-barbell" /> {dayType}</span>
          <div onClick={() => setDayOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #DDDDD9', borderRadius: 20, padding: '5px 11px', cursor: 'pointer' }}>
            <i className="ti ti-repeat" style={{ fontSize: 13, color: '#1A1A2E' }} /><span style={{ fontSize: 11, fontWeight: 500, color: '#1A1A2E' }}>Change day</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#8A8A85', margin: '0 0 16px' }}>Week {w.week} · {w.dow} · {activeCount} exercises</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(e => {
            if (e.state === 'skipped') {
              return (
                <div key={e.id} className="card" style={{ padding: 13, display: 'flex', gap: 12, alignItems: 'center', background: '#F5F5F3', opacity: .7 }}>
                  <Thumb style={{ color: '#C8C8C4' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#8A8A85', textDecoration: 'line-through' }}>{e.name}</span>
                      <span className="badge" style={{ fontSize: 10, padding: '2px 8px', background: '#EAEAE6', color: '#8A8A85' }}>Skipped</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#8A8A85' }}>Tap to restore for today</div>
                  </div>
                  <i className="ti ti-rotate" style={{ color: '#8A8A85', fontSize: 17, flex: 'none', cursor: 'pointer' }} onClick={() => restoreExercise(e.id)} />
                </div>
              );
            }
            const sub = e.state === 'sub';
            const added = e.state === 'added';
            return (
              <div key={e.id} className="card" style={{ padding: 13, border: sub ? '1.5px solid #D97706' : (added ? '1.5px solid #2563EB' : '1px solid #DDDDD9') }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Thumb />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>{e.name}</span>
                      {sub && <span className="badge amber" style={{ fontSize: 10, padding: '2px 8px' }}>Substituted</span>}
                      {added && <span className="badge" style={{ fontSize: 10, padding: '2px 8px', background: '#DBEAFE', color: '#1D4ED8' }}>Added</span>}
                      <span className="badge neutral" style={{ fontSize: 10, padding: '2px 8px' }}>{e.muscleGroup || e.targetMuscle}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8A8A85', marginBottom: 3 }}>{e.sets} × {e.reps} × {e.weight}kg</div>
                    <div style={{ fontSize: 11, color: (sub || added) ? '#8A8A85' : '#3A7A0A' }}>{sub ? `Was: ${e.was} · swapped by you` : (added ? 'Added manually by you' : e.why)}</div>
                  </div>
                  <i className="ti ti-chevron-down" style={{ color: '#8A8A85', fontSize: 18, flex: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 11, paddingTop: 11, borderTop: '1px solid #EDEDEA' }}>
                  <div onClick={() => setPickerFor(e.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9, padding: 8, fontSize: 12, fontWeight: 500, color: '#1A1A2E', background: '#F5F5F3', cursor: 'pointer' }}><i className="ti ti-repeat" style={{ fontSize: 14 }} /> Substitute</div>
                  <div onClick={() => skipExercise(e.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9, padding: 8, fontSize: 12, fontWeight: 500, color: '#8A8A85', background: '#F5F5F3', cursor: 'pointer' }}><i className="ti ti-player-skip-forward" style={{ fontSize: 14 }} /> Skip</div>
                </div>
              </div>
            );
          })}
          {/* prominent add exercise */}
          <div onClick={onAddExercise} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1.5px dashed #1A1A2E', borderRadius: 16, padding: 15, fontSize: 14, fontWeight: 600, color: '#1A1A2E', background: '#fff', cursor: 'pointer' }}><i className="ti ti-plus" style={{ fontSize: 17 }} /> Add exercise</div>
        </div>
      </div>
      <div className="sticky-cta">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A8A85', marginBottom: 10 }}>
          <span>{activeCount} active · ~{Math.round(activeCount * 9)} mins</span>
          <span style={{ color: '#8A8A85' }}>Coach-balanced ✓</span>
        </div>
        {isModifyMode ? (
          <button className="btn btn-primary" onClick={onBack}>Reviewed <i className="ti ti-check btn-icon" /></button>
        ) : (
          <button className="btn btn-primary" onClick={onStart}>Start workout <i className="ti ti-arrow-right btn-icon" /></button>
        )}
      </div>

      {dayOpen && <ChangeDaySheet current={dayType} weeklyPlanSplit={weeklyPlanSplit} onClose={() => setDayOpen(false)} onPick={t => { setDayType(t); setDayOpen(false); }} />}
      {pickerFor && (
        <SubstituteSheet 
          exerciseDbId={workout?.exercises?.find(e => e.id === pickerFor)?.exerciseDbId} 
          onClose={() => setPickerFor(null)} 
          onPick={(name, newDbId) => { substitute(pickerFor, name, newDbId); setPickerFor(null); }} 
        />
      )}
    </div>
  );
}

export function ChangeDaySheet({ current, weeklyPlanSplit, onClose, onPick }) {
  let dynamicDays = [];
  if (Array.isArray(weeklyPlanSplit) && weeklyPlanSplit.length > 0) {
    dynamicDays = weeklyPlanSplit.map((name, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      let dateLabel = '';
      if (i === 0) dateLabel = 'Today';
      else if (i === 1) dateLabel = 'Tomorrow';
      else dateLabel = d.toLocaleDateString('en-US', { weekday: 'long' });
      return { name, dateLabel, uniqueId: `${name}-${i}`, offset: i };
    }).filter(d => typeof d.name === 'string'); // Only ensure it's a valid string, don't filter rest or duplicates
  }
  
  const options = dynamicDays.length > 0 
    ? dynamicDays.map((data) => {
        const safeName = data.name;
        const searchName = safeName.toLowerCase().split(' ')[0];
        let match = dayTypes.find(d => typeof d.name === 'string' && d.name.toLowerCase().includes(searchName));
        
        // Special fallback icon for Rest days
        if (!match && searchName === 'rest') {
          match = { icon: 'ti-moon', muscles: 'Recovery & rebuilt' };
        }
        
        return match 
          ? { ...match, name: safeName, id: data.uniqueId, dateLabel: data.dateLabel, offset: data.offset } 
          : { id: data.uniqueId, name: safeName, icon: 'ti-barbell', muscles: 'AI generated focus', dateLabel: data.dateLabel, offset: data.offset };
      })
    : dayTypes;

  const safeCurrent = typeof current === 'string' ? current : '';

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '0 20px 22px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1A1A2E', marginBottom: 3 }}>Change today's focus</div>
        <div style={{ fontSize: 12, color: '#8A8A85', marginBottom: 16 }}>Picking a new focus reloads that group's exercises for today.</div>
        <div className="scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map(d => {
            const sel = safeCurrent === d.name;
            return (
              <div key={d.id} onClick={() => onPick(d.name, d.offset)} style={{ background: sel ? '#1A1A2E0D' : '#fff', border: sel ? '2px solid #1A1A2E' : '1.5px solid #DDDDD9', borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8E8F5', color: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flex: 'none' }}><i className={`ti ${d.icon}`} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{d.name}</div><div style={{ fontSize: 11, color: '#8A8A85' }}>{d.muscles}</div></div>
                {d.dateLabel && <span className="badge" style={{ fontSize: 10, padding: '3px 9px', background: '#F2F2F2', color: '#1A1A2E' }}>{d.dateLabel}</span>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, background: '#EDFCD2', borderRadius: 12, padding: '11px 13px', display: 'flex', gap: 9, alignItems: 'center' }}>
          <i className="ti ti-brain" style={{ color: '#3A7A0A', fontSize: 16, flex: 'none' }} />
          <div style={{ fontSize: 11.5, color: '#3A7A0A', lineHeight: 1.45 }}>Coach suggests {options.length > 0 ? options[0].name.split(' ')[0] : 'Push'} today based on your AI split.</div>
        </div>
      </div>
    </Sheet>
  );
}

function SubstituteSheet({ exerciseDbId, onClose, onPick }) {
  const { state } = useOnboarding();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseDbId) {
      setLoading(false);
      return;
    }
    
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/exercises/${exerciseDbId}/substitutes`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOptions(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch substitutes", err);
        setLoading(false);
      });
  }, [exerciseDbId, state.token]);

  return (
    <Sheet onClose={onClose} maxHeight="60%">
      <div style={{ padding: '0 20px 22px' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1A1A2E', marginBottom: 3 }}>Substitute exercise</div>
        <div style={{ fontSize: 12, color: '#8A8A85', marginBottom: 16 }}>Same muscle group, matched to your equipment.</div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}><div className="spinner" /></div>
        ) : options.length === 0 ? (
          <div style={{ fontSize: 13, color: '#8A8A85', textAlign: 'center', padding: '20px 0' }}>No exact substitutes found in your library.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.map(o => (
              <div key={o._id} onClick={() => onPick(o.name, o._id)} style={{ background: '#fff', border: '1.5px solid #DDDDD9', borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <Thumb url={o.gifUrl} size={38} radius={10} />
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{o.name}</div>
                <i className="ti ti-plus" style={{ color: '#1A1A2E', fontSize: 17 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ─────────────────────────── ACTIVE WORKOUT ──────────────── */
export function ActiveWorkout({ workout, onBack, onFinish, onSwap }) {
  const { state } = useOnboarding();
  const [idx, setIdx] = useState(0);
  const [skipReason, setSkipReason] = useState('');
  const w = workout || todayWorkout;
  const activeExercises = w.exercises.filter(e => !e.wasSkipped);
  
  if (activeExercises.length === 0) {
    return (
      <div className="app-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 20, textAlign: 'center' }}>
        <i className="ti ti-check" style={{ fontSize: 40, color: '#3A7A0A', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, color: '#1A1A2E', marginBottom: 8 }}>All done!</h2>
        <p style={{ fontSize: 14, color: '#8A8A85', marginBottom: 24 }}>You have skipped or finished all exercises.</p>
        <button className="btn btn-primary" onClick={onFinish} style={{ width: '100%', maxWidth: 300 }}>Finish workout</button>
      </div>
    );
  }

  const ex = activeExercises[idx];
  const [sets, setSets] = useState(() => activeExercises.map(e => {
    if (e.actualSetsArray && Array.isArray(e.actualSetsArray)) {
      return e.actualSetsArray.map(s => ({ reps: s.actualReps || '', weight: s.actualWeight || '', done: !!s.completed }));
    }
    return Array.from({ length: e.sets }, () => ({ reps: '', weight: '', done: false }));
  }));

  const cur = sets[idx];
  const setField = (si, k, v) => setSets(prev => prev.map((rows, i) => i !== idx ? rows : rows.map((r, j) => j !== si ? r : { ...r, [k]: v })));
  
  const toggle = async (si) => {
    const isDoneNow = !cur[si].done;
    
    // Enforce chronological logging
    if (isDoneNow && si > 0 && !cur[si - 1].done) return; // Must do previous sets first
    if (!isDoneNow && si < cur.length - 1 && cur[si + 1].done) return; // Must undo subsequent sets first
    
    // Auto-fill logic: If user checks off the set but left inputs blank, assume they did the planned amount
    let finalReps = cur[si].reps;
    let finalWeight = cur[si].weight;

    if (isDoneNow) {
      if (!finalReps) {
        finalReps = ex.actualSetsArray && ex.actualSetsArray[si] ? String(ex.actualSetsArray[si].plannedReps || ex.reps) : String(ex.reps);
      }
      if (!finalWeight) {
        finalWeight = ex.actualSetsArray && ex.actualSetsArray[si] && ex.actualSetsArray[si].plannedWeight ? String(ex.actualSetsArray[si].plannedWeight) : (ex.weight ? String(ex.weight) : '');
      }

      // Safety check: Reps must be a whole integer >= 1, Weight must be >= 0
      const repsNum = Number(finalReps);
      const weightNum = Number(finalWeight);
      if (!Number.isInteger(repsNum) || repsNum < 1 || weightNum < 0) {
        return; // Silently abort, preventing the set from being marked as completed
      }
    } else {
      // Reset logic: If unchecking, clear the inputs so placeholders show again
      finalReps = '';
      finalWeight = '';
    }
    
    // Optimistic UI update with auto-filled or reset values
    setSets(prev => prev.map((rows, i) => i !== idx ? rows : rows.map((r, j) => j !== si ? r : { ...r, done: isDoneNow, reps: finalReps, weight: finalWeight })));

    // Auto-advance focus to the next set's reps input
    if (isDoneNow && si + 1 < cur.length) {
      setTimeout(() => {
        const nextInput = document.getElementById(`reps-input-${si + 1}`);
        if (nextInput) nextInput.focus();
      }, 50);
    }

    // API Call to log-set
    if (w._id && state.token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${w._id}/log-set`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({
            exerciseIndex: ex.originalIndex,
            setIndex: si,
            actualReps: Number(finalReps) || 0,
            actualWeight: Number(finalWeight) || 0,
            completed: isDoneNow
          })
        });
      } catch (err) {
        console.error('Failed to log set:', err);
      }
    }
  };

  const last = idx === activeExercises.length - 1;
  const next = () => { 
    setSkipReason('');
    if (last) onFinish(); else setIdx(i => i + 1); 
  };
  const nextEx = activeExercises[idx + 1];

  const skip = async () => {
    if (w._id && state.token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${w._id}/skip-exercise`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({
            exerciseIndex: ex.originalIndex,
            skipReason: skipReason
          })
        });
      } catch (err) {
        console.error('Failed to skip exercise:', err);
      }
    }
    next(); // Move to the next exercise regardless
  };

  return (
    <div className="app-body">
      <div style={{ flex: 'none', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back" style={{ marginLeft: -8 }}><i className="ti ti-arrow-left" /></button>
          <div><div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E' }}>{w.type}</div><div style={{ fontSize: 12, color: '#8A8A85', marginTop: 1 }}>{idx + (cur.every(s => s.done) ? 1 : 0)} of {activeExercises.length} exercises done</div></div>
        </div>
        <div className="bar" style={{ height: 5 }}><i style={{ width: `${(idx / activeExercises.length) * 100}%`, background: '#C8F25C' }} /></div>
      </div>

      <div className="screen-pad scroll" style={{ paddingTop: 2 }}>
        <div className="card" style={{ borderRadius: 18, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: '#1A1A2E' }}>{ex.name}</span>
            <span className="badge neutral" style={{ fontSize: 10 }}>{ex.muscleGroup || ex.targetMuscle}</span>
          </div>
          <div className="thumb" style={{ height: 170, borderRadius: 14, fontSize: 30, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
            {ex.gifUrl ? (
              <img src={ex.gifUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="ti ti-photo" />
            )}
            <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 11, color: '#8A8A85', background: '#ffffffcc', padding: '3px 9px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-player-play" style={{ fontSize: 12 }} /> Demo</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr 32px', gap: 8, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8A8A85', padding: '0 4px 8px' }}>
            <span>Set</span><span>Reps</span><span>Weight</span><span />
          </div>
          {cur.map((s, si) => {
            const isActive = !s.done && cur.slice(0, si).every(x => x.done);
            return (
              <div key={si} className={`set-row ${s.done ? 'done' : isActive ? 'active' : ''}`}>
                <span className="set-num" style={{ color: s.done ? '#3A7A0A' : '#1A1A2E' }}>{si + 1}</span>
                <input id={`reps-input-${si}`} className="set-input" inputMode="numeric" placeholder={ex.actualSetsArray && ex.actualSetsArray[si] ? String(ex.actualSetsArray[si].plannedReps || ex.reps) : String(ex.reps)} value={s.reps} onChange={e => setField(si, 'reps', e.target.value)} readOnly={s.done} />
                <input className="set-input" inputMode="decimal" placeholder={ex.actualSetsArray && ex.actualSetsArray[si] && ex.actualSetsArray[si].plannedWeight ? String(ex.actualSetsArray[si].plannedWeight) : (ex.weight ? String(ex.weight) : '')} value={s.weight} onChange={e => setField(si, 'weight', e.target.value)} readOnly={s.done} />
                <div className={`set-check ${s.done ? 'on' : 'off'}`} onClick={() => toggle(si)}>{s.done && <i className="ti ti-check" />}</div>
              </div>
            );
          })}
          {!cur.some(s => s.done) && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 12, color: '#8A8A85', textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }} onClick={skip}>Skip exercise</span>
              </div>
              <input 
                type="text" 
                placeholder="Add a reason for skipping..." 
                value={skipReason} 
                onChange={e => setSkipReason(e.target.value)} 
                style={{ marginTop: 10, width: '100%', background: '#F5F5F3', border: '1px solid #DDDDD9', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#1A1A2E' }} 
              />
            </>
          )}
        </div>

        {nextEx && (
          <div className="card" style={{ borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Thumb size={38} radius={10} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8A8A85' }}>Up next</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', marginTop: 2 }}>{nextEx.name} · {nextEx.sets}×{nextEx.reps}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => onSwap(nextEx.muscleGroup || 'All')}><i className="ti ti-refresh" /> Swap</span>
          </div>
        )}
      </div>

      <div className="sticky-cta">
        <button 
          className={`btn ${last ? 'btn-lime' : 'btn-primary'}`} 
          onClick={next}
          disabled={!cur.every(s => s.done)}
          style={{ opacity: cur.every(s => s.done) ? 1 : 0.5, pointerEvents: cur.every(s => s.done) ? 'auto' : 'none' }}
        >
          {last ? <>Finish workout <i className="ti ti-flag-check btn-icon" /></> : <>Complete exercise <i className="ti ti-arrow-right btn-icon" /></>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── POST SESSION ────────────────── */
export function PostSession({ workout, onDone, onModify }) {
  const { state } = useOnboarding();
  const [phase, setPhase] = useState(workout.status === 'completed' ? 'loading' : 'rate'); // rate | loading | summary | confirming
  const [rating, setRating] = useState(8);
  const [feel, setFeel] = useState('Good');
  const [notes, setNotes] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  
  const feels = [['Easy', 'ti-feather'], ['Good', 'ti-thumb-up'], ['Hard', 'ti-flame'], ['Exhausted', 'ti-battery-1']];

  // Fetch summary if already completed
  useEffect(() => {
    if (workout.status === 'completed' && state.token) {
      const fetchExistingSummary = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${workout._id}/summary`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setSummaryData(data);
            setPhase('summary');
          } else {
            console.error("Failed to fetch existing summary:", data);
            setPhase('rate');
          }
        } catch (err) {
          console.error("Failed to fetch summary:", err);
          setPhase('rate');
        }
      };
      fetchExistingSummary();
    }
  }, [workout.status, workout._id, state.token]);

  const submitCompletion = async () => {
    setPhase('loading');
    
    // Fallback if not logged in (dummy flow)
    if (!state.token || !workout._id) {
      setTimeout(() => {
        setSummaryData({ aiSummary: "Great session! You're making progress. Let's get some rest and hit it hard tomorrow.", newPRs: [] });
        setPhase('summary');
      }, 1500);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${workout._id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
        body: JSON.stringify({ sessionRating: rating, sessionFeel: feel })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSummaryData(data);
        setPhase('summary');
      } else {
        console.error(data);
        onDone();
      }
    } catch (err) {
      console.error(err);
      setPhase('summary'); // revert on error
    }
  };

  const confirmAndFinish = async (isModify = false) => {
    if (!summaryData?.tomorrowPlan || phase === 'confirming') return;
    setPhase('confirming');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/tomorrow/confirm-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
        body: JSON.stringify({ tomorrowPlan: summaryData.tomorrowPlan })
      });
      if (isModify) {
        onModify();
      } else {
        onDone();
      }
    } catch (err) {
      console.error(err);
      setPhase('summary'); // revert on error
    }
  };

  if (phase === 'rate') {
    return (
      <div className="app-body">
        <div className="screen-pad scroll" style={{ paddingTop: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EDFCD2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><i className="ti ti-flag-check" style={{ fontSize: 30, color: '#3A7A0A' }} /></div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-.03em', color: '#1A1A2E', marginBottom: 6 }}>How was that?</div>
          <div style={{ fontSize: 14, color: '#8A8A85', marginBottom: 26 }}>Your coach uses this to tune tomorrow.</div>
          <div className="s-label">Rate the session</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <div key={n} className={`rate-num ${rating === n ? 'sel' : ''}`} onClick={() => setRating(n)}>{n}</div>
            ))}
          </div>
          <div className="s-label">How did it feel?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            {feels.map(([f, ic]) => (
              <div key={f} onClick={() => setFeel(f)} style={{ background: feel === f ? '#1A1A2E0D' : '#fff', border: feel === f ? '2px solid #1A1A2E' : '1.5px solid #DDDDD9', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                <i className={`ti ${ic}`} style={{ fontSize: 19, color: feel === f ? '#1A1A2E' : '#8A8A85' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: feel === f ? '#1A1A2E' : '#8A8A85' }}>{f}</span>
              </div>
            ))}
          </div>
          <div className="s-label">Notes (optional)</div>
          <textarea className="input" rows={3} placeholder="Shoulder felt tight on last set…" style={{ resize: 'none' }} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="sticky-cta"><button className="btn btn-primary" onClick={submitCompletion}>See my summary <i className="ti ti-arrow-right btn-icon" /></button></div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="app-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
        <div style={{ marginTop: 24, fontSize: 15, color: '#8A8A85', fontWeight: 500 }}>Generating your summary...</div>
        <div style={{ fontSize: 13, color: '#8A8A85', opacity: 0.6, marginTop: 8 }}>This usually takes a few seconds</div>
      </div>
    );
  }

  const tomorrow = summaryData?.tomorrowPlan || { sessionType: 'Rest Day', dayOfWeek: 'Tomorrow', exercises: [] };
  const setsDoneCount = summaryData?.workout?.exercises?.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0) || 0;
  const totalSets = summaryData?.workout?.exercises?.reduce((acc, ex) => acc + ex.sets.length, 0) || 0;
  const prCount = summaryData?.newPRs?.length || 0;
  const isRest = tomorrow.status === 'rest_day' || tomorrow.sessionType === 'Rest Day';

  return (
    <div className="app-body">
      <div className="screen-pad scroll" style={{ paddingTop: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-.02em', color: '#1A1A2E', marginBottom: 16 }}>Session complete</div>
        <div className="card-navy" style={{ borderRadius: 18, padding: 17, marginBottom: 14 }}>
          <div className="eyebrow-navy" style={{ color: '#C8F25C', marginBottom: 11 }}><i className="ti ti-brain" /> Your coach</div>
          <div style={{ fontSize: 14, color: '#E4E4EC', lineHeight: 1.65 }}>
            {summaryData?.aiSummary || "Summary unavailable right now, but your workout was saved!"}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['Done', 'Duration', false], [`${setsDoneCount}/${totalSets}`, 'Sets done', false], [String(prCount), 'New PRs', prCount > 0]].map(([v, l, pr]) => (
            <div key={l} className="card" style={{ flex: 1, borderRadius: 14, padding: 13 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: pr ? '#3A7A0A' : '#1A1A2E', display: 'flex', alignItems: 'center', gap: 3 }}>{v}{pr && <i className="ti ti-trophy" style={{ fontSize: 14 }} />}</div>
              <div style={{ fontSize: 11, color: '#8A8A85', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        
        {prCount > 0 && (
          <div style={{ marginBottom: 14 }}>
            {summaryData.newPRs.map((pr, i) => (
              <div key={i} className="card" style={{ padding: '10px 14px', borderRadius: 12, marginBottom: 8, borderLeft: '3px solid #3A7A0A' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 2 }}>{pr.exerciseName}</div>
                <div style={{ fontSize: 11, color: '#8A8A85' }}>New best: <strong style={{ color: '#3A7A0A' }}>{pr.newBest}</strong> (was {pr.previousBest})</div>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ borderRadius: 18, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>Tomorrow — {tomorrow.sessionType || 'Rest Day'}</span>
            <span className="badge neutral" style={{ fontSize: 10 }}>{tomorrow.dayOfWeek}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
            {!isRest ? (
              tomorrow.exercises.slice(0, 3).map((e, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="rowline" />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#1A1A2E' }}>{e.exerciseName}</span><span style={{ color: '#8A8A85' }}>{e.reps || '10-12'} reps</span></div>
                </React.Fragment>
              ))
            ) : (
              <div style={{ fontSize: 13, color: '#8A8A85', fontStyle: 'italic' }}>Time to recover and rebuild!</div>
            )}
            {!isRest && tomorrow.exercises.length > 3 && (
              <div style={{ fontSize: 12, color: '#8A8A85' }}>+ {tomorrow.exercises.length - 3} more</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: 13, fontSize: 13, opacity: phase === 'confirming' ? 0.7 : 1 }} onClick={confirmAndFinish} disabled={phase === 'confirming'}>
              {phase === 'confirming' ? 'Saving...' : <><span style={{ marginRight: 6 }}>Looks good</span> <i className="ti ti-check" /></>}
            </button>
            <button className="btn" style={{ flex: 1, padding: 13, fontSize: 13, background: '#fff', border: '1.5px solid #1A1A2E', color: '#1A1A2E', opacity: phase === 'confirming' ? 0.7 : 1 }} onClick={() => confirmAndFinish(true)} disabled={phase === 'confirming'}>
              {phase === 'confirming' ? 'Saving...' : 'Modify plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
