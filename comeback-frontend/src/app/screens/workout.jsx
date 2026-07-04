import React, { useState, useEffect } from 'react';
import { Wordmark, Bar, CoachCard, Thumb, PushHeader } from '../components.jsx';
import { nutrition, circle, tomorrow } from '../data.js'; // removed todayWorkout
import { API_URL } from '../../lib/api.js';
import { useOnboarding } from '../../lib/store.jsx';

let cachedWorkout = null;

export function useTodayWorkout() {
  const { state } = useOnboarding();
  const [w, setW] = useState(cachedWorkout);
  const [loading, setLoading] = useState(!cachedWorkout);

  useEffect(() => {
    if (cachedWorkout) return;
    fetch(`${API_URL}/api/workouts/today`, {
      headers: { Authorization: `Bearer ${state.token}` }
    })
      .then(r => {
        if (!r.ok && r.status === 404) return { workout: null, isRestDay: true };
        return r.json();
      })
      .then(d => {
        if (d.isRestDay || !d.workout) {
           const rest = { restDay: true };
           cachedWorkout = rest;
           setW(rest);
           setLoading(false);
           return;
        }
        
        const mapped = {
          title: `${d.workout.sessionType} — Week ${d.workout.weekNumber}`,
          type: d.workout.sessionType,
          week: d.workout.weekNumber,
          day: new Date(d.workout.date).getDate(),
          dow: d.workout.dayOfWeek,
          durationMin: d.workout.exercises.length * 8,
          exercises: d.workout.exercises.map(ex => ({
            id: ex._id,
            name: ex.exerciseName || ex.exerciseId?.name || 'Exercise',
            muscle: ex.muscleGroup || ex.exerciseId?.targetMuscle || 'General',
            sets: ex.sets.length,
            reps: ex.sets[0]?.plannedReps || 10,
            weight: ex.sets[0]?.plannedWeight || 0,
            why: ex.antigravityReasoning || ex.benefits || ex.exerciseId?.whyLabel || 'Builds strength and endurance.'
          }))
        };
        cachedWorkout = mapped;
        setW(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch workout:", err);
        setLoading(false);
      });
  }, [state.token]);

  return { w, loading };
}

/* ─────────────────────────── DASHBOARD (Workout tab home) ── */
export function Dashboard({ done, onStart, onViewSummary, onOpenCircle, goDiet }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const { w, loading } = useTodayWorkout();

  if (loading) {
    return (
      <div className="app-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderTopColor: '#C8F25C' }} />
      </div>
    );
  }

  if (w?.restDay) {
    return (
      <div className="app-body">
        <div className="screen-pad scroll">
          <div className="app-top">
            <div>
              <div style={{ marginBottom: 10 }}><Wordmark /></div>
              <div className="greeting">{greet}, Prashant</div>
              <div className="subtle">Rest Day</div>
            </div>
          </div>
          <div className="card-navy" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 19, fontWeight: 500, color: '#fff', marginBottom: 14 }}>Rest & Recovery</div>
            <div style={{ fontSize: 13, color: '#8A8AAA', lineHeight: 1.6 }}>Your muscles rebuild today. Take a walk and hit your protein goals.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-body">
      <div className="screen-pad scroll">
        <div className="app-top">
          <div>
            <div style={{ marginBottom: 10 }}><Wordmark /></div>
            <div className="greeting">{greet}, Prashant</div>
            <div className="subtle">{w.dow} · Week {w.week} · Day {w.day}</div>
          </div>
          <button className="icon-btn"><i className="ti ti-bell" />{!done && <span className="dot-red" />}</button>
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
          <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-.02em', color: '#fff', marginBottom: 14 }}>{w.title}</div>

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
                {w.exercises.slice(0, 3).map((e, i) => (
                  <React.Fragment key={e.id}>
                    {i > 0 && <div className="rowline dark" />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#D8D8E4' }}>{e.name}</span><span style={{ color: '#8A8AAA' }}>{e.sets} × {e.reps}</span>
                    </div>
                  </React.Fragment>
                ))}
                <div style={{ fontSize: 12, color: '#6A6A8A', marginTop: 2 }}>+ {w.exercises.length - 3} more · ~{w.durationMin} mins</div>
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

/* ─────────────────────────── WORKOUT PLAN (pre-workout) ──── */
export function WorkoutPlan({ onBack, onStart, onAddExercise }) {
  const { w, loading } = useTodayWorkout();
  
  if (loading) return <div className="app-body" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><div className="spinner"></div></div>;

  if (w?.restDay) {
    return (
      <div className="app-body">
        <PushHeader title="Today's workout" onBack={onBack} right="ti-calendar" />
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
      <PushHeader title="Today's workout" onBack={onBack} right="ti-calendar" />
      <div className="screen-pad scroll" style={{ paddingTop: 0 }}>
        <span className="badge green" style={{ marginBottom: 8 }}><i className="ti ti-barbell" /> {w.type}</span>
        <div style={{ fontSize: 13, color: '#8A8A85', margin: '8px 0 16px' }}>Week {w.week} · {w.dow} · {w.exercises.length} exercises</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {w.exercises.map(e => (
            <div key={e.id || e.name} className="card" style={{ padding: 13, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Thumb />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>{e.name}</span>
                  <span className="badge neutral" style={{ fontSize: 10, padding: '2px 8px' }}>{e.muscle}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8A8A85', marginBottom: 3 }}>{e.sets} × {e.reps} × {e.weight}kg</div>
                <div style={{ fontSize: 11, color: '#3A7A0A' }}>{e.why}</div>
              </div>
              <i className="ti ti-chevron-down" style={{ color: '#8A8A85', fontSize: 18, flex: 'none' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="sticky-cta">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A8A85', marginBottom: 10 }}>
          <span>{w.exercises.length} exercises · ~{w.durationMin} mins</span>
          <span style={{ color: '#1A1A2E', fontWeight: 500, cursor: 'pointer' }} onClick={onAddExercise}>Add exercise +</span>
        </div>
        <button className="btn btn-primary" onClick={onStart}>Start workout <i className="ti ti-arrow-right btn-icon" /></button>
      </div>
    </div>
  );
}

/* ─────────────────────────── ACTIVE WORKOUT ──────────────── */
export function ActiveWorkout({ onBack, onFinish, onSwap }) {
  const { w, loading } = useTodayWorkout();
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(34 * 60 + 12);
  const [sets, setSets] = useState([]);

  useEffect(() => {
    if (!w || loading || w.restDay || !w.exercises) return;
    setSets(w.exercises.map(e => Array.from({ length: e.sets }, () => ({ reps: '', weight: '', done: false }))));
  }, [w, loading]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading || !w || !sets.length || w.restDay) return <div className="app-body" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><div className="spinner"></div></div>;

  const ex = w.exercises[idx];
  const fmt = s => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const cur = sets[idx];
  const setField = (si, k, v) => setSets(prev => prev.map((rows, i) => i !== idx ? rows : rows.map((r, j) => j !== si ? r : { ...r, [k]: v })));
  const toggle = si => setSets(prev => prev.map((rows, i) => i !== idx ? rows : rows.map((r, j) => j !== si ? r : { ...r, done: !r.done })));

  const last = idx === w.exercises.length - 1;
  const next = () => { if (last) onFinish(); else setIdx(i => i + 1); };
  const nextEx = w.exercises[idx + 1];

  return (
    <div className="app-body">
      <div style={{ flex: 'none', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div><div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E' }}>{w.type}</div><div style={{ fontSize: 12, color: '#8A8A85', marginTop: 1 }}>{idx + (cur.every(s => s.done) ? 1 : 0)} of {w.exercises.length} exercises done</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 500, color: '#1A1A2E' }}>{fmt(elapsed)}</span>
            <button className="icon-btn"><i className="ti ti-player-pause" /></button>
          </div>
        </div>
        <div className="bar" style={{ height: 5 }}><i style={{ width: `${(idx / w.exercises.length) * 100}%`, background: '#C8F25C' }} /></div>
      </div>

      <div className="screen-pad scroll" style={{ paddingTop: 2 }}>
        <div className="card" style={{ borderRadius: 18, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: '#1A1A2E' }}>{ex.name}</span>
            <span className="badge neutral" style={{ fontSize: 10 }}>{ex.muscle}</span>
          </div>
          <div className="thumb" style={{ height: 170, borderRadius: 14, fontSize: 30, marginBottom: 14, position: 'relative' }}>
            <i className="ti ti-photo" />
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
                <input className="set-input" inputMode="numeric" placeholder={String(ex.reps)} value={s.reps} onChange={e => setField(si, 'reps', e.target.value)} />
                <input className="set-input" inputMode="decimal" placeholder={ex.weight ? ex.weight.toFixed(1) : '0'} value={s.weight} onChange={e => setField(si, 'weight', e.target.value)} />
                <div className={`set-check ${s.done ? 'on' : 'off'}`} onClick={() => toggle(si)}>{s.done && <i className="ti ti-check" />}</div>
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 12, color: '#8A8A85', textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }} onClick={next}>Skip exercise</span>
          </div>
          <div style={{ marginTop: 10, background: '#F5F5F3', border: '1px solid #DDDDD9', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#8A8A85' }}>Add a note…</div>
        </div>

        {nextEx && (
          <div className="card" style={{ borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Thumb size={38} radius={10} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8A8A85' }}>Up next</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', marginTop: 2 }}>{nextEx.name} · {nextEx.sets}×{nextEx.reps}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={onSwap}><i className="ti ti-refresh" /> Swap</span>
          </div>
        )}
      </div>

      <div className="sticky-cta">
        <button className={`btn ${last ? 'btn-lime' : 'btn-primary'}`} onClick={next}>
          {last ? <>Finish workout <i className="ti ti-flag-check btn-icon" /></> : <>Complete exercise <i className="ti ti-arrow-right btn-icon" /></>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── POST SESSION ────────────────── */
export function PostSession({ onDone, onModify }) {
  const [phase, setPhase] = useState('rate'); // rate | summary
  const [rating, setRating] = useState(8);
  const [feel, setFeel] = useState('Good');
  const feels = [['Easy', 'ti-feather'], ['Good', 'ti-thumb-up'], ['Hard', 'ti-flame'], ['Exhausted', 'ti-battery-1']];

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
          <textarea className="input" rows={3} placeholder="Shoulder felt tight on last set…" style={{ resize: 'none' }} />
        </div>
        <div className="sticky-cta"><button className="btn btn-primary" onClick={() => setPhase('summary')}>See my summary <i className="ti ti-arrow-right btn-icon" /></button></div>
      </div>
    );
  }

  return (
    <div className="app-body">
      <div className="screen-pad scroll" style={{ paddingTop: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-.02em', color: '#1A1A2E', marginBottom: 16 }}>Session complete</div>
        <div className="card-navy" style={{ borderRadius: 18, padding: 17, marginBottom: 14 }}>
          <div className="eyebrow-navy" style={{ color: '#C8F25C', marginBottom: 11 }}><i className="ti ti-brain" /> Your coach</div>
          <div style={{ fontSize: 14, color: '#E4E4EC', lineHeight: 1.65 }}>Solid session. You hit all chest sets clean. Overhead press dropped to 10kg on the last set — energy was clearly low in the second half. That's normal on Day 2. Eat well tonight and you'll be sharper for pull day.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['47m', 'Duration', false], ['15/15', 'Sets done', false], ['1', 'New PR', true]].map(([v, l, pr]) => (
            <div key={l} className="card" style={{ flex: 1, borderRadius: 14, padding: 13 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: pr ? '#3A7A0A' : '#1A1A2E', display: 'flex', alignItems: 'center', gap: 3 }}>{v}{pr && <i className="ti ti-trophy" style={{ fontSize: 14 }} />}</div>
              <div style={{ fontSize: 11, color: '#8A8A85', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ borderRadius: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>Tomorrow — {tomorrow.type}</span>
            <span className="badge neutral" style={{ fontSize: 10 }}>{tomorrow.dow}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
            {tomorrow.exercises.map((e, i) => (
              <React.Fragment key={e.name}>
                {i > 0 && <div className="rowline" />}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#1A1A2E' }}>{e.name}</span><span style={{ color: '#8A8A85' }}>{e.scheme}</span></div>
              </React.Fragment>
            ))}
            <div style={{ fontSize: 12, color: '#8A8A85' }}>+ 2 more · {tomorrow.note}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: 13, fontSize: 13 }} onClick={onDone}>Looks good <i className="ti ti-check" /></button>
            <button className="btn" style={{ flex: 1, padding: 13, fontSize: 13, background: '#fff', border: '1.5px solid #1A1A2E', color: '#1A1A2E' }} onClick={onModify}>Modify plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
