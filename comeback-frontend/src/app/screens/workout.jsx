import React, { useState, useEffect } from 'react';
import { Wordmark, Bar, CoachCard, Thumb, PushHeader, Sheet } from '../components.jsx';
import { todayWorkout, tomorrow, nutrition, circle, dayTypes } from '../data.js';
import { useOnboarding } from '../../lib/store.jsx';

/* ─────────────────────────── DASHBOARD (Workout tab home) ── */
export function Dashboard({ workout, done, onStart, onViewSummary, onOpenCircle, goDiet, onOpenProfile, onChangeDay, weeklyPlanSplit, onFocusChange }) {
  const { state } = useOnboarding();
  const userName = state.profile?.name || '';
  const initial = userName.charAt(0).toUpperCase();

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const w = workout || todayWorkout; // fallback
    const isDone = done || w.status === 'completed';
  const [dayType, setDayType] = useState(w.sessionType || w.type || 'Full Body');
  const [dayOpen, setDayOpen] = useState(false);
  const [showAllEx, setShowAllEx] = useState(true);

  // Dynamically generate the title based on the selected dayType safely
  const safeDayType = (typeof dayType === 'string' && dayType.trim() !== '') ? dayType : 'Full Body';
  const dt = dayTypes.find(d => typeof d.name === 'string' && d.name.toLowerCase().includes(safeDayType.toLowerCase().split(' ')[0]));
  const dynamicTitle = dt 
    ? `${dt.name} — ${dt.muscles ? dt.muscles.replace(/ · /g, ' & ') : 'Rest Day'}`
    : safeDayType.charAt(0).toUpperCase() + safeDayType.slice(1);

  const [dietData, setDietData] = useState(null);

  const [historyData, setHistoryData] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/history`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (!res.ok) {
        const text = await res.text();
        alert(`API Error ${res.status}: ${text.slice(0, 50)}`);
        return;
      }
      const data = await res.json();
      setHistoryData(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };


  useEffect(() => {
    async function fetchDiet() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/diet/today`, {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        setDietData(data);
      } catch (err) {
        console.error(err);
      }
    }
    if (state.token) {
      fetchDiet();
    }
  }, [state.token]);

  // Dynamic program timeline calculation
  const joinDate = state.profile?.createdAt ? new Date(state.profile.createdAt) : new Date();
  joinDate.setHours(0,0,0,0);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24)) + 1;
  const computedWeek = Math.ceil(diffDays / 7) || 1;
  const computedDay = diffDays % 7 === 0 ? 7 : diffDays % 7;

  return (
    <div className="app-body">
      <div className="screen-pad scroll">
        <div className="app-top">
          <div>
            <div style={{ marginBottom: 10 }}><Wordmark /></div>
            <div className="greeting" style={{ textTransform: 'capitalize' }}>{greet}, {userName}</div>
            <div className="subtle">{currentDay} · Week {w.week || w.weekNumber || computedWeek} · Day {w.day || computedDay}</div>
          </div>
          <div style={{ display: 'flex', gap: 9, flex: 'none' }}>
            <button className="icon-btn" onClick={fetchHistory}><i className="ti ti-calendar" /></button>
            <button className="icon-btn"><i className="ti ti-bell" />{!isDone && <span className="dot-red" />}</button>
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
            {isDone
              ? <span className="badge green"><i className="ti ti-check" /> Done</span>
              : <span className="badge muted">Not started</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-.02em', color: '#fff' }}>{dynamicTitle}</div>
            {!isDone && (
              <div onClick={() => setDayOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none', background: '#ffffff14', borderRadius: 20, padding: '5px 10px', cursor: 'pointer' }}>
                <i className="ti ti-repeat" style={{ color: '#C8F25C', fontSize: 13 }} /><span style={{ fontSize: 11, fontWeight: 500, color: '#C8F25C' }}>Change</span>
              </div>
            )}
          </div>

          {isDone ? (
            (() => {
              const totalSets = w?.exercises?.reduce((sum, ex) => sum + (ex.wasSkipped ? 0 : (Array.isArray(ex.actualSetsArray || ex.sets) ? (ex.actualSetsArray || ex.sets).length : Number(ex.sets) || 0)), 0) || 0;
              const completedSets = w?.exercises?.reduce((sum, ex) => sum + (ex.wasSkipped ? 0 : (Array.isArray(ex.actualSetsArray || ex.sets) ? (ex.actualSetsArray || ex.sets).filter(s => s.completed).length : 0)), 0) || 0;
              const duration = w?.sessionDurationMins ? `${w.sessionDurationMins}m` : (w?.durationMin ? `${w.durationMin}m` : '0m');
              const prs = w?.prCount || 0;
              
              return (
                <>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    {[[duration, 'Duration', true], [`${completedSets}/${totalSets}`, 'Sets done', false], [`${prs}`, 'New PR', true]].map(([v, l, lime]) => (
                      <div key={l} style={{ flex: 1, background: '#ffffff0D', borderRadius: 12, padding: 11 }}>
                        <div style={{ fontSize: 18, fontWeight: 600, color: lime ? '#C8F25C' : '#fff' }}>{v}</div>
                        <div style={{ fontSize: 11, color: '#8A8AAA', marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn" style={{ background: '#ffffff14', color: '#fff', borderColor: 'transparent' }} onClick={onViewSummary}>View summary</button>
                </>
              );
            })()
          ) : (
            (() => {
              const unskippedEx = w.exercises.filter(e => !e.wasSkipped);
              const displayLimit = showAllEx ? unskippedEx.length : 3;
              const estimatedMins = w.durationMin || Math.round((w.exercises?.reduce((sum, ex) => sum + (ex.wasSkipped ? 0 : (Array.isArray(ex.sets) ? ex.sets.length : Number(ex.sets) || 0)), 0) || 0) * 2.5);
              
              return (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                    {unskippedEx.slice(0, displayLimit).map((e, i) => (
                      <React.Fragment key={e.id || e.name}>
                        {i > 0 && <div className="rowline dark" />}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: '#D8D8E4' }}>{e.name}</span><span style={{ color: '#8A8AAA' }}>{Array.isArray(e.sets) ? e.sets.length : e.sets} × {Array.isArray(e.sets) ? (e.sets[0]?.plannedReps || 10) : e.reps}</span>
                        </div>
                      </React.Fragment>
                    ))}
                    {unskippedEx.length > 3 && !showAllEx && (
                      <div onClick={() => setShowAllEx(true)} style={{ fontSize: 12, color: '#C8F25C', marginTop: 2, cursor: 'pointer' }}>
                        + {unskippedEx.length - 3} more · ~{estimatedMins} mins
                      </div>
                    )}
                    {showAllEx && (
                      <div onClick={() => setShowAllEx(false)} style={{ fontSize: 12, color: '#6A6A8A', marginTop: 2, cursor: 'pointer' }}>
                        Show less · ~{estimatedMins} mins
                      </div>
                    )}
                  </div>
                  <button className="btn btn-lime" onClick={onStart}>Start workout <i className="ti ti-arrow-right btn-icon" /></button>
                </>
              );
            })()
          )}
        </div>

        {/* nutrition strip */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="eyebrow">Nutrition</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={goDiet}><i className="ti ti-plus" /> Log meal</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Metric label="Calories" val={dietData?.runningTotals?.calories?.toLocaleString() || '0'} target={`${dietData?.targets?.dailyCalorieTarget || 2000} kcal`} value={dietData?.runningTotals?.calories || 0} max={dietData?.targets?.dailyCalorieTarget || 2000} />
            <Metric label="Protein" val={dietData?.runningTotals?.proteinG || '0'} target={`${dietData?.targets?.dailyProteinTarget || 130}g`} value={dietData?.runningTotals?.proteinG || 0} max={dietData?.targets?.dailyProteinTarget || 130} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#1A1A2E', fontWeight: 500 }}>Water</span><span style={{ color: '#8A8A85' }}>{dietData?.runningTotals?.waterGlasses || 0} / 8 glasses</span></div>
          </div>
        </div>

        {/* coach */}
        <div style={{ marginBottom: 14 }}>
          <CoachCard>{w?.aiSummary || dietData?.dietLog?.dailyCoachTip || "Day 2 of your comeback. Ease in today — hit the planned weights, don't chase PRs yet."}</CoachCard>
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
      {historyData && (
        <Sheet onClose={() => setHistoryData(null)}>
          <div style={{ padding: '0 20px 22px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginBottom: 16 }}>Workout History</div>
            
            <div style={{ background: '#F5F5F3', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: '#666', fontWeight: 500, marginBottom: 4 }}>Current Streak</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E' }}>{historyData.currentStreak || 0} <span style={{ fontSize: 20 }}>🔥</span></div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <i className="ti ti-flame" style={{ fontSize: 24, color: '#FF9800' }} />
              </div>
            </div>

            <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginBottom: 16 }}>Past Sessions</div>
            
            {historyData.sessions && historyData.sessions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {historyData.sessions.map((session, i) => (
                  <div key={i} style={{ padding: 16, border: '1px solid #DDDDD9', borderRadius: 16, background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, background: '#F5F5F3', color: '#1A1A2E', padding: '4px 10px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{session.sessionType || 'Workout'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#666', fontWeight: 500 }}>
                        <i className="ti ti-barbell" style={{ fontSize: 15 }} /> {session.exercisesCount || 0} exercises
                      </div>
                      {session.newPRs && session.newPRs.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#FF9800', fontWeight: 600 }}>
                          <i className="ti ti-trophy" style={{ fontSize: 15 }} /> {session.newPRs.length} PRs
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#666', background: '#fff', border: '1px dashed #DDDDD9', borderRadius: 16 }}>
                <i className="ti ti-history" style={{ fontSize: 32, opacity: 0.3, marginBottom: 12, display: 'block' }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E' }}>No completed workouts yet.</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Finish your first session to start your streak!</div>
              </div>
            )}
          </div>
        </Sheet>
      )}
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

const warmupExercises = [
  { name: 'Astride Jumps (Male)', gifFile: '3220-f9lVSSI.gif' },
  { name: 'Back and Forth Step', gifFile: '3672-fNGumX0.gif' },
  { name: 'Bear Crawl', gifFile: '3360-0Yz8WdV.gif' },
  { name: 'Burpee', gifFile: '1160-dK9394r.gif' },
  { name: 'Cycle Cross Trainer', gifFile: '2331-XSCHmiI.gif' }
];

const cooldownExercises = [
  { name: 'All Fours Squad Stretch', gifFile: '1512-qBcKorM.gif' },
  { name: 'Assisted Lying Calves Stretch', gifFile: '1708-GxDwDX0.gif' },
  { name: 'Assisted Lying Glutes Stretch', gifFile: '1709-yn0LjwL.gif' },
  { name: 'Assisted Lying Gluteus and Piriformis Stretch', gifFile: '1710-RQNVT10.gif' },
  { name: 'Assisted Prone Lying Quads Stretch', gifFile: '1713-YUYAMEj.gif' }
];

function ExtraExercisesSheet({ title, exercises, onClose }) {
  return (
    <Sheet onClose={onClose} maxHeight="80%">
      <div style={{ padding: '0 20px 20px' }}>
        <h3 style={{ fontSize: 18, color: 'var(--c-navy)', marginBottom: 16 }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {exercises.map((ex, i) => (
            <div key={i} className="card" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flex: 'none', background: '#F5F5F3' }}>
                <img src={`https://pub-bcc929dbed6c495e8b2abc3612778cfd.r2.dev/${ex.gifFile}`} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-navy)' }}>{ex.name}</div>
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

export function WorkoutPlan({ workout, weeklyPlanSplit, onBack, onStart, onFinish, onAddExercise, onSubstituteBrowse, refreshWorkout, isModifyMode }) {
  const { state } = useOnboarding();
  const w = workout || todayWorkout;

  const [expandedCards, setExpandedCards] = useState({});
  const toggleCard = (id) => setExpandedCards(prev => ({...prev, [id]: !prev[id]}));
  
  const [pendingOverride, setPendingOverride] = useState(null);
  const activeW = pendingOverride || w;
  const isExplicitRest = activeW.type === 'Rest' || activeW.sessionType === 'Rest' || activeW.status === 'rest_day';
  const restDay = isExplicitRest && (!activeW.exercises || activeW.exercises.length === 0);

  const [rows, setRows] = useState(() => (activeW.exercises || []).map(e => ({ 
    ...e, 
    state: e.wasSkipped ? 'skipped' : (e.wasSubstituted ? 'sub' : (e.addedByUser ? 'added' : 'active')),
    was: e.substitutedFrom || e.was
  })));
  const [pickerFor, setPickerFor] = useState(null); // exercise id being substituted
  const [dayOpen, setDayOpen] = useState(false);
  const [showWarmup, setShowWarmup] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [dayType, setDayType] = useState(activeW.sessionType || activeW.type || 'Full Body');
  const [isGenerating, setIsGenerating] = useState(false);

  const hasProgress = activeW.exercises && activeW.exercises.some(e => 
    e.actualSetsArray && e.actualSetsArray.some(s => s.completed)
  );

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/history`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (!res.ok) {
        const text = await res.text();
        alert(`API Error ${res.status}: ${text.slice(0, 50)}`);
        return;
      }
      const data = await res.json();
      setHistoryData(data);
    } catch (err) {
      console.error(err);
      alert("Network/parse error: " + err.message);
    }
  };

  useEffect(() => {
    setRows((activeW.exercises || []).map(e => ({ 
      ...e, 
      state: e.wasSkipped ? 'skipped' : (e.wasSubstituted ? 'sub' : (e.addedByUser ? 'added' : 'active')),
      was: e.substitutedFrom || e.was
    })));
  }, [activeW.exercises]);

  const swapMuscle = async (targetMuscle) => {
    if (!w._id || !state.token) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/tomorrow/swap-muscle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
        body: JSON.stringify({ muscleGroup: targetMuscle, currentPlanId: w._id })
      });
      const data = await res.json();
      
      if (res.ok && data.newPlan) {
        if (data.recoveryWarning) {
          if (!window.confirm(data.recoveryWarning + "\n\nPress OK to proceed anyway.")) {
            setIsGenerating(false);
            return;
          }
        }
        setPendingOverride(data.newPlan);
        setDayType(targetMuscle);
      } else {
        alert(data.message || "Failed to generate new plan");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmOverride = async () => {
    if (!pendingOverride || !w._id || !state.token) {
      onBack();
      return;
    }
    
    setIsGenerating(true); // repurpose loading screen for save
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/${w._id}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
        body: JSON.stringify({ 
          exercises: pendingOverride.exercises, 
          planSource: pendingOverride.planSource
        })
      });
      if (res.ok) {
        if (refreshWorkout) refreshWorkout();
        onBack();
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setIsGenerating(false);
    }
  };

  const skipExercise = async (id) => {
    // Optimistic UI
    setRows(rs => rs.map(r => r.id === id ? { ...r, state: 'skipped' } : r));
    
    // Find index of the exercise in the array
    const exerciseIndex = rows.findIndex(r => r.id === id);
    
    // Save to backend if real workout
    if (w._id && state.token && exerciseIndex !== -1) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/${w._id}/skip-exercise`, {
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/${w._id}/restore-exercise`, {
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
    const ex = rows[exerciseIndex];
    const isReverting = (ex.substitutedFrom === name || ex.was === name);
    
    // Optimistic UI
    setRows(rs => rs.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          state: isReverting ? (r.addedByUser ? 'added' : 'active') : 'sub', 
          was: isReverting ? null : r.name, 
          name, 
          exerciseDbId: newDbId,
          wasSubstituted: !isReverting,
          substitutedFrom: isReverting ? null : r.name
        };
      }
      return r;
    }));
    
    // Save to backend if real workout
    if (w._id && state.token && newDbId && exerciseIndex !== -1) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/${w._id}/substitute-exercise`, {
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
        <PushHeader title={isModifyMode ? "Tomorrow's workout" : "Today's workout"} onBack={onBack} right="ti-calendar" onRight={fetchHistory} />
        <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#E8E8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}><i className="ti ti-moon" style={{ fontSize: 40, color: '#1A1A2E' }} /></div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-.03em', color: '#1A1A2E', marginBottom: 8 }}>Rest day</div>
          <div style={{ fontSize: 14, color: '#8A8A85', lineHeight: 1.6, maxWidth: 250, marginBottom: 26 }}>Recovery is where the comeback happens. Your muscles rebuild today.</div>
          <div style={{ maxWidth: 300 }}><CoachCard>Take a 20-min walk and hit your protein. Push day is back tomorrow — come rested.</CoachCard></div>
          <button className="btn" style={{ background: '#F5F5F3', color: '#1A1A2E', marginTop: 32, padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14 }} onClick={() => setDayOpen(true)}>
            <i className="ti ti-repeat" style={{ marginRight: 8 }}/> Swap to a workout
          </button>
        </div>
        
        <div className="sticky-cta">
          {isModifyMode ? (
            <button className="btn btn-primary" onClick={pendingOverride ? confirmOverride : onBack}>Done plan <i className="ti ti-check btn-icon" /></button>
          ) : (
            <button className="btn btn-primary" onClick={onStart || onBack}>Got it <i className="ti ti-check btn-icon" /></button>
          )}
        </div>

        {dayOpen && <ChangeDaySheet current={dayType} weeklyPlanSplit={weeklyPlanSplit} onClose={() => setDayOpen(false)} onPick={t => { setDayOpen(false); swapMuscle(t); }} />}

        {isGenerating && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
            <div style={{ marginTop: 24, fontSize: 15, color: '#1A1A2E', fontWeight: 600 }}>Building your plan...</div>
            <div style={{ fontSize: 13, color: '#8A8A85', marginTop: 8 }}>This takes a few seconds</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-body">
      <PushHeader title={isModifyMode ? "Tomorrow's plan" : "Today's workout"} onBack={onBack} right="ti-calendar" onRight={fetchHistory} />
      <div className="screen-pad scroll" style={{ paddingTop: 0 }}>
        <div className="hide-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          <span className="badge green" style={{ flex: 'none' }}><i className="ti ti-barbell" /> {dayType}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap', flex: 'none' }}>
            <div onClick={() => setShowWarmup(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #DDDDD9', borderRadius: 20, padding: '4px 8px', cursor: 'pointer', flex: 'none' }}>
              <i className="ti ti-flame" style={{ color: '#D97706', fontSize: 13 }} /><span style={{ fontSize: 11, fontWeight: 500, color: '#1A1A2E', whiteSpace: 'nowrap' }}>Warm-up</span>
            </div>
            <div onClick={() => setShowCooldown(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #DDDDD9', borderRadius: 20, padding: '4px 8px', cursor: 'pointer', flex: 'none' }}>
              <i className="ti ti-snowflake" style={{ color: '#0369A1', fontSize: 13 }} /><span style={{ fontSize: 11, fontWeight: 500, color: '#1A1A2E', whiteSpace: 'nowrap' }}>Cool-down</span>
            </div>
            <div onClick={() => setDayOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #DDDDD9', borderRadius: 20, padding: '4px 8px', cursor: 'pointer', flex: 'none' }}>
              <i className="ti ti-repeat" style={{ fontSize: 13, color: '#1A1A2E' }} /><span style={{ fontSize: 11, fontWeight: 500, color: '#1A1A2E', whiteSpace: 'nowrap' }}>Change day</span>
            </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#8A8A85', textDecoration: 'line-through', textTransform: 'capitalize' }}>{e.exerciseName || e.name}</span>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E', textTransform: 'capitalize' }}>{e.exerciseName || e.name}</span>
                      {hasProgress && (
                        e.actualSetsArray && e.actualSetsArray.some(s => s.completed) ? (
                          e.actualSetsArray.every(s => s.completed) ? (
                            <span className="badge" style={{ background: '#EDFCD2', color: '#3A7A0A', fontSize: 10, padding: '2px 8px' }}>Completed</span>
                          ) : (
                            <span className="badge" style={{ background: '#FFEDD5', color: '#C2410C', fontSize: 10, padding: '2px 8px' }}>Partially completed</span>
                          )
                        ) : (
                          <span className="badge" style={{ background: '#EAEAE6', color: '#8A8A85', fontSize: 10, padding: '2px 8px' }}>Skipped</span>
                        )
                      )}
                      {sub && !hasProgress && <span className="badge amber" style={{ fontSize: 10, padding: '2px 8px' }}>Substituted</span>}
                      {added && !hasProgress && <span className="badge" style={{ fontSize: 10, padding: '2px 8px', background: '#DBEAFE', color: '#1D4ED8' }}>Added</span>}
                      {!hasProgress && <span className="badge neutral" style={{ fontSize: 10, padding: '2px 8px' }}>{e.muscleGroup || e.targetMuscle}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#8A8A85', marginBottom: 3 }}>
                      {Array.isArray(e.sets) ? e.sets.length : (e.sets || 3)} × {e.reps || (Array.isArray(e.sets) && e.sets[0]?.plannedReps) || '10-12'} × {e.weight || (Array.isArray(e.sets) && e.sets[0]?.plannedWeight) || 0}kg
                    </div>
                    <div style={{ fontSize: 11, color: (sub || added) ? '#8A8A85' : '#3A7A0A' }}>{sub ? `Was: ${e.was} · swapped by you` : (added ? 'Added manually by you' : e.why)}</div>
                  </div>
                  <i className={`ti ti-chevron-${expandedCards[e.id] ? 'up' : 'down'}`} style={{ color: '#8A8A85', fontSize: 18, flex: 'none', cursor: 'pointer', padding: 10, margin: -10 }} onClick={() => toggleCard(e.id)} />
                </div>
                {/* --- EXPANDED DETAILS PANEL --- */}
                {expandedCards[e.id] && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #EDEDEA' }}>
                    <p style={{ fontSize: 13, color: '#3A7A0A', margin: '0 0 8px 0' }}>
                      {e.exerciseId?.whyLabel || 'Builds strength and endurance'}
                    </p>
                    <p style={{ fontSize: 13, margin: '0 0 4px 0' }}>
                      <strong>Target Muscle:</strong> {e.exerciseId?.targetMuscle || e.targetMuscle || e.muscleGroup}
                    </p>
                    <p style={{ fontSize: 13, margin: '0 0 12px 0' }}>
                      <strong>Secondary Muscles:</strong> {e.exerciseId?.secondaryMuscles?.join(', ') || 'N/A'}
                    </p>
                    
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#8A8A85', letterSpacing: '.05em' }}>INSTRUCTIONS</span>
                    <div style={{ fontSize: 13, marginTop: 6, marginBottom: 0, color: '#1A1A2E', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                      {e.exerciseId?.instructionsEn || 'Detailed instructions will appear here once linked.'}
                    </div>
                  </div>
                )}
                {/* --- END EXPANDED DETAILS PANEL --- */}
                {!hasProgress && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 11, paddingTop: 11, borderTop: '1px solid #EDEDEA' }}>
                    <div onClick={() => setPickerFor(e.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9, padding: 8, fontSize: 12, fontWeight: 500, color: '#1A1A2E', background: '#F5F5F3', cursor: 'pointer' }}><i className="ti ti-repeat" style={{ fontSize: 14 }} /> Substitute</div>
                    <div onClick={() => skipExercise(e.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9, padding: 8, fontSize: 12, fontWeight: 500, color: '#8A8A85', background: '#F5F5F3', cursor: 'pointer' }}><i className="ti ti-player-skip-forward" style={{ fontSize: 14 }} /> Skip</div>
                  </div>
                )}
              </div>
            );
          })}
          {/* prominent add exercise */}
          {!hasProgress && (
            <div onClick={onAddExercise} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1.5px dashed #1A1A2E', borderRadius: 16, padding: 15, fontSize: 14, fontWeight: 600, color: '#1A1A2E', background: '#fff', cursor: 'pointer' }}><i className="ti ti-plus" style={{ fontSize: 17 }} /> Add exercise</div>
          )}
        </div>
      </div>
      <div className="sticky-cta">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A8A85', marginBottom: 10 }}>
          <span>{activeCount} active · ~{Math.round(activeCount * 9)} mins</span>
          <span style={{ color: '#8A8A85' }}>Coach-balanced ✓</span>
        </div>
        {isModifyMode ? (
          <button className="btn btn-primary" onClick={pendingOverride ? confirmOverride : onBack}>Done plan <i className="ti ti-check btn-icon" /></button>
        ) : hasProgress ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1, background: '#F5F5F3', color: '#1A1A2E', fontWeight: 600 }} onClick={onStart}>
              Resume <i className="ti ti-player-play btn-icon" style={{ fill: '#1A1A2E', color: '#1A1A2E' }} />
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={onFinish}>
              Finish workout <i className="ti ti-flag-check btn-icon" />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onStart}>
            Start workout <i className="ti ti-player-play btn-icon" style={{ fill: '#fff' }} />
          </button>
        )}
      </div>

      {showWarmup && <ExtraExercisesSheet title="Warm-Up Exercises" exercises={warmupExercises} onClose={() => setShowWarmup(false)} />}
      {showCooldown && <ExtraExercisesSheet title="Cool-Down Exercises" exercises={cooldownExercises} onClose={() => setShowCooldown(false)} />}
      {dayOpen && <ChangeDaySheet current={dayType} weeklyPlanSplit={weeklyPlanSplit} onClose={() => setDayOpen(false)} onPick={t => { setDayOpen(false); swapMuscle(t); }} />}
      {pickerFor && (
        <SubstituteSheet 
          exerciseDbId={activeW?.exercises?.find(e => e.id === pickerFor)?.exerciseDbId || activeW?.exercises?.find(e => e.id === pickerFor)?.exerciseId} 
          targetMuscle={activeW?.exercises?.find(e => e.id === pickerFor)?.muscleGroup}
          wasSubstitutedFrom={rows.find(r => r.id === pickerFor)?.was}
          onClose={() => setPickerFor(null)} 
          onPick={(name, newDbId) => { substitute(pickerFor, name, newDbId); setPickerFor(null); }} 
          onBrowse={(muscle) => { 
            const exerciseIndex = rows.findIndex(r => r.id === pickerFor);
            if (onSubstituteBrowse) onSubstituteBrowse(exerciseIndex, muscle);
            setPickerFor(null);
          }}
        />
      )}
      
      {historyData && (
        <Sheet onClose={() => setHistoryData(null)}>
          <div style={{ padding: '0 20px 22px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginBottom: 16 }}>Workout History</div>
            
            <div style={{ background: '#F5F5F3', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: '#666', fontWeight: 500, marginBottom: 4 }}>Current Streak</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E' }}>{historyData.currentStreak || 0} <span style={{ fontSize: 20 }}>🔥</span></div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <i className="ti ti-flame" style={{ fontSize: 24, color: '#FF9800' }} />
              </div>
            </div>

            <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginBottom: 16 }}>Past Sessions</div>
            
            {historyData.sessions && historyData.sessions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {historyData.sessions.map((session, i) => (
                  <div key={i} style={{ padding: 16, border: '1px solid #DDDDD9', borderRadius: 16, background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, background: '#F5F5F3', color: '#1A1A2E', padding: '4px 10px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{session.sessionType || 'Workout'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#666', fontWeight: 500 }}>
                        <i className="ti ti-barbell" style={{ fontSize: 15 }} /> {session.exercisesCount || 0} exercises
                      </div>
                      {session.newPRs && session.newPRs.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#FF9800', fontWeight: 600 }}>
                          <i className="ti ti-trophy" style={{ fontSize: 15 }} /> {session.newPRs.length} PRs
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#666', background: '#fff', border: '1px dashed #DDDDD9', borderRadius: 16 }}>
                <i className="ti ti-history" style={{ fontSize: 32, opacity: 0.3, marginBottom: 12, display: 'block' }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E' }}>No completed workouts yet.</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Finish your first session to start your streak!</div>
              </div>
            )}
          </div>
        </Sheet>
      )}

      {isGenerating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
          <div style={{ marginTop: 24, fontSize: 15, color: '#1A1A2E', fontWeight: 600 }}>Building your plan...</div>
          <div style={{ fontSize: 13, color: '#8A8A85', marginTop: 8 }}>This takes a few seconds</div>
        </div>
      )}
    </div>
  );
}

export function ChangeDaySheet({ current, weeklyPlanSplit, onClose, onPick }) {
  let options = [];

  if (Array.isArray(weeklyPlanSplit) && weeklyPlanSplit.length > 0) {
    options = weeklyPlanSplit.map((name, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      let dateLabel = '';
      if (i === 0) dateLabel = 'Today';
      else if (i === 1) dateLabel = 'Tomorrow';
      else dateLabel = d.toLocaleDateString('en-US', { weekday: 'long' });

      const safeName = typeof name === 'string' ? name : 'Workout';
      const searchName = safeName.toLowerCase().split(' ')[0];
      let match = dayTypes.find(d => typeof d.name === 'string' && d.name.toLowerCase().includes(searchName));
      
      if (!match && searchName === 'rest') {
        match = { icon: 'ti-moon', muscles: 'Recovery & rebuild' };
      }

      return {
        id: `${safeName}-${i}`,
        name: safeName,
        icon: match?.icon || 'ti-barbell',
        muscles: match?.muscles || 'AI generated focus',
        dateLabel,
        offset: i
      };
    });
  } else {
    options = dayTypes.map((dt, i) => ({ ...dt, id: dt.name, offset: i }));
  }

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

function SubstituteSheet({ exerciseDbId, targetMuscle, wasSubstitutedFrom, onClose, onPick, onBrowse }) {
  const { state } = useOnboarding();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseDbId) {
      setLoading(false);
      return;
    }
    
    let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/exercises/${exerciseDbId}/substitutes`;
    if (wasSubstitutedFrom) {
      url += `?was=${encodeURIComponent(wasSubstitutedFrom)}`;
    }
    
    fetch(url, {
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
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', textTransform: 'capitalize' }}>{o.name}</span>
                    {o.muscleGroup && (
                      <span className="badge neutral" style={{ fontSize: 10, padding: '2px 8px' }}>
                        {o.muscleGroup}
                      </span>
                    )}
                  </div>
                </div>
                <i className="ti ti-plus" style={{ color: '#1A1A2E', fontSize: 17 }} />
              </div>
            ))}
          </div>
        )}

        {targetMuscle && (
          <div onClick={() => onBrowse(targetMuscle)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, padding: '14px 14px', fontSize: 14, fontWeight: 600, color: '#1A1A2E', background: '#F5F5F5', borderRadius: 14, cursor: 'pointer' }}>
            Browse all {targetMuscle} exercises <i className="ti ti-arrow-right" style={{ fontSize: 16 }} />
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
  const activeExercises = (w.exercises || []).map((e, i) => ({ ...e, originalIndex: i })).filter(e => !e.wasSkipped);
  
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

    // API Call is deferred to the "Complete exercise" button (`next()`)
  };

  const last = idx === activeExercises.length - 1;
  const next = async () => { 
    setSkipReason('');
    
    // API Call to log the entire exercise
    if (w._id && state.token) {
      try {
        // Loop through and call log-set sequentially for each set so there are no race conditions
        for (let si = 0; si < cur.length; si++) {
          const setObj = cur[si];
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${w._id}/log-set`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
              exerciseIndex: ex.originalIndex,
              setIndex: si,
              actualReps: Number(setObj.reps) || 0,
              actualWeight: Number(setObj.weight) || 0,
              completed: !!setObj.done
            })
          });
        }
      } catch (err) {
        console.error('Failed to log exercise:', err);
      }
    }

    if (last) onBack(); else setIdx(i => i + 1); 
  };
  const nextEx = activeExercises[idx + 1];

  const skip = async () => {
    if (w._id && state.token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/${w._id}/skip-exercise`, {
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="icon-btn" onClick={() => { if (idx > 0) setIdx(idx - 1); else onBack(); }} aria-label="Back" style={{ marginLeft: -8 }}><i className="ti ti-arrow-left" /></button>
            <div><div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E' }}>{w.type}</div><div style={{ fontSize: 12, color: '#8A8A85', marginTop: 1 }}>{idx + (cur.some(s => s.done) ? 1 : 0)} of {activeExercises.length} exercises done</div></div>
          </div>
          {idx < activeExercises.length - 1 && (
            <button className="icon-btn" onClick={() => setIdx(idx + 1)} aria-label="Next" style={{ marginRight: -8 }}><i className="ti ti-arrow-right" /></button>
          )}
        </div>
        <div className="bar" style={{ height: 5 }}><i style={{ width: `${(idx / activeExercises.length) * 100}%`, background: '#C8F25C' }} /></div>
      </div>

      <div className="screen-pad scroll" style={{ paddingTop: 2 }}>
        <div className="card" style={{ borderRadius: 18, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: '#1A1A2E', textTransform: 'capitalize' }}>{ex.exerciseName || ex.name}</span>
            <span className="badge neutral" style={{ fontSize: 10 }}>{ex.muscleGroup || ex.targetMuscle}</span>
          </div>
          <div className="thumb" style={{ height: 170, borderRadius: 14, fontSize: 30, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
            {ex.gifUrl ? (
              <img src={ex.gifUrl} alt={ex.exerciseName || ex.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <i className="ti ti-photo" />
            )}
            <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 11, color: '#8A8A85', background: '#ffffffcc', padding: '3px 9px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-player-play" style={{ fontSize: 12 }} /> Demo</span>
          </div>
          {(() => {
            const noWeight = (ex.equipment && ['body weight', 'assisted'].includes(ex.equipment.toLowerCase())) || ((ex.exerciseName || ex.name) && (ex.exerciseName || ex.name).toLowerCase().includes('stretch'));
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr 32px', gap: 8, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8A8A85', padding: '0 4px 8px' }}>
                  <span>Set</span><span>Reps</span><span>{noWeight ? '' : 'Weight'}</span><span />
                </div>
                {cur.map((s, si) => {
                  const isActive = !s.done && cur.slice(0, si).every(x => x.done);
                  return (
                    <div key={si} className={`set-row ${s.done ? 'done' : isActive ? 'active' : ''}`}>
                      <span className="set-num" style={{ color: s.done ? '#3A7A0A' : '#1A1A2E' }}>{si + 1}</span>
                      <input id={`reps-input-${si}`} className="set-input" inputMode="numeric" placeholder={ex.actualSetsArray && ex.actualSetsArray[si] ? String(ex.actualSetsArray[si].plannedReps || ex.reps) : String(ex.reps)} value={s.reps} onChange={e => setField(si, 'reps', e.target.value)} readOnly={s.done} />
                      {noWeight ? (
                        <div className="set-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A8A85', background: 'transparent', border: 'none' }}>—</div>
                      ) : (
                        <input className="set-input" inputMode="decimal" placeholder={ex.actualSetsArray && ex.actualSetsArray[si] && ex.actualSetsArray[si].plannedWeight ? String(ex.actualSetsArray[si].plannedWeight) : (ex.weight ? String(ex.weight) : '')} value={s.weight} onChange={e => setField(si, 'weight', e.target.value)} readOnly={s.done} />
                      )}
                      <div className={`set-check ${s.done ? 'on' : 'off'}`} onClick={() => toggle(si)}>{s.done && <i className="ti ti-check" />}</div>
                    </div>
                  );
                })}
              </>
            );
          })()}
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
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', marginTop: 2, textTransform: 'capitalize' }}>{nextEx.exerciseName || nextEx.name} · {nextEx.sets}×{nextEx.reps}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => onSwap(nextEx.muscleGroup || 'All')}><i className="ti ti-refresh" /> Swap</span>
          </div>
        )}
      </div>

      <div className="sticky-cta">
        <button 
          className="btn btn-primary" 
          onClick={next}
          disabled={last ? false : !cur.some(s => s.done)}
          style={{ opacity: (last || cur.some(s => s.done)) ? 1 : 0.5, pointerEvents: (last || cur.some(s => s.done)) ? 'auto' : 'none' }}
        >
          {last ? <>Done workout <i className="ti ti-flag-check btn-icon" /></> : <>Complete exercise <i className="ti ti-arrow-right btn-icon" /></>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── POST SESSION ────────────────── */
export function PostSession({ workout, isCompleted, onDone, onModify }) {
  const { state } = useOnboarding();
  const [phase, setPhase] = useState(isCompleted ? 'loading' : 'rate'); // rate | loading | summary | confirming
  const [rating, setRating] = useState(null);
  const [feel, setFeel] = useState(null);
  
  const [duration, setDuration] = useState('');
  
  const [notes, setNotes] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  
  const feels = [['Easy', 'ti-feather'], ['Good', 'ti-thumb-up'], ['Hard', 'ti-flame'], ['Exhausted', 'ti-battery-1']];
  const [showAllTomorrow, setShowAllTomorrow] = useState(false);

  // Fetch summary if already completed
  useEffect(() => {
    if (isCompleted && state.token) {
      const fetchExistingSummary = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/${workout._id}/summary`, {
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
    if (!rating || !feel) {
      alert("Please select a rating and how the session felt.");
      return;
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      alert("Please enter a valid workout duration in minutes.");
      return;
    }
    
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/${workout._id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
        body: JSON.stringify({ sessionRating: rating, sessionFeel: feel, sessionDurationMins: Number(duration) })
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
    if (phase === 'confirming') return;
    
    // If there's no plan generated by AI, don't trap the user! Let them go back.
    if (!summaryData?.tomorrowPlan) {
      if (isModify) onModify(); else onDone();
      return;
    }

    setPhase('confirming');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/workouts/tomorrow/confirm-ai`, {
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
      // Still let them go to the dashboard even if the network fails!
      if (isModify) onModify(); else onDone();
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
          <div className="s-label">Duration (minutes)</div>
          <div style={{ marginBottom: 24 }}>
            <input type="number" className="input" value={duration} onChange={e => setDuration(e.target.value)} style={{ fontSize: 16, width: 100 }} />
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
        <div style={{ marginTop: 24, fontSize: 15, color: '#8A8A85', fontWeight: 500 }}>{workout?.status === 'completed' ? 'Loading summary...' : 'Generating your summary...'}</div>
        <div style={{ fontSize: 13, color: '#8A8A85', opacity: 0.6, marginTop: 8 }}>{workout?.status === 'completed' ? 'This usually takes a moment' : 'This usually takes a few seconds'}</div>
      </div>
    );
  }

  const tomorrow = summaryData?.tomorrowPlan || { sessionType: 'Rest Day', dayOfWeek: 'Tomorrow', exercises: [] };
  const setsDoneCount = summaryData?.workout?.exercises?.reduce((acc, ex) => acc + (Array.isArray(ex.sets) ? ex.sets.filter(s => s.completed).length : 0), 0) || 0;
  const totalSets = summaryData?.workout?.exercises?.reduce((acc, ex) => acc + (Array.isArray(ex.sets) ? ex.sets.length : Number(ex.sets) || 0), 0) || 0;
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
          {[[`${summaryData?.workout?.sessionDurationMins || duration}m`, 'Duration', false], [`${setsDoneCount}/${totalSets}`, 'Sets done', false], [String(prCount), 'New PRs', prCount > 0]].map(([v, l, pr]) => (
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
              tomorrow.exercises.slice(0, showAllTomorrow ? tomorrow.exercises.length : 3).map((e, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="rowline" />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#1A1A2E' }}>{e.exerciseName}</span><span style={{ color: '#8A8A85' }}>{e.reps || '10-12'} reps</span></div>
                </React.Fragment>
              ))
            ) : (
              <div style={{ fontSize: 13, color: '#8A8A85', fontStyle: 'italic' }}>Time to recover and rebuild!</div>
            )}
            {!isRest && tomorrow.exercises.length > 3 && !showAllTomorrow && (
              <div style={{ fontSize: 12, color: '#8A8A85', cursor: 'pointer' }} onClick={() => setShowAllTomorrow(true)}>+ {tomorrow.exercises.length - 3} more</div>
            )}
            {!isRest && tomorrow.exercises.length > 3 && showAllTomorrow && (
              <div style={{ fontSize: 12, color: '#8A8A85', cursor: 'pointer' }} onClick={() => setShowAllTomorrow(false)}>Show less</div>
            )}
          </div>
          {isCompleted ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: 13, fontSize: 13 }} onClick={onDone}>
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, padding: 13, fontSize: 13, opacity: phase === 'confirming' ? 0.7 : 1 }} onClick={() => confirmAndFinish(false)} disabled={phase === 'confirming'}>
                  {phase === 'confirming' ? 'Saving...' : <><span style={{ marginRight: 6 }}>Looks good</span> <i className="ti ti-check" /></>}
                </button>
                <button className="btn" style={{ flex: 1, padding: 13, fontSize: 13, background: '#fff', border: '1.5px solid #1A1A2E', color: '#1A1A2E', opacity: phase === 'confirming' ? 0.7 : 1 }} onClick={() => confirmAndFinish(true)} disabled={phase === 'confirming'}>
                  {phase === 'confirming' ? 'Saving...' : 'Modify plan'}
                </button>
              </div>
              <button className="btn" style={{ width: '100%', marginTop: 12, padding: 13, fontSize: 13, background: 'transparent', color: '#8A8A85', border: 'none', opacity: phase === 'confirming' ? 0.7 : 1 }} onClick={() => onDone()} disabled={phase === 'confirming'}>
                 Go to dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
