import React, { useState } from 'react';
import { PushHeader, Sheet } from '../components.jsx';
import { quickPrompts, patterns, milestones, circle, weekSummary, weekAvg, memberWorkouts } from '../data.js';

/* ─────────────────────────── COACH CHAT ──────────────────── */
export function Coach() {
  const [draft, setDraft] = useState('');
  return (
    <div className="app-body">
      <div style={{ flex: 'none', padding: '12px 20px', borderBottom: '1px solid #DDDDD9', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color: '#C8F25C', flex: 'none' }}><i className="ti ti-brain" /></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>Your coach</div><div style={{ fontSize: 12, color: '#8A8A85' }}>Knows your full history</div></div>
          <i className="ti ti-info-circle" style={{ fontSize: 20, color: '#8A8A85' }} />
        </div>
      </div>

      <div className="screen-pad scroll" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <div className="bubble-user">Skip chest tomorrow, my shoulder is sore</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
          <div className="bubble-coach">Got it — we'll protect that shoulder. I've swapped tomorrow's push day for a back &amp; biceps session. Nothing overhead.</div>
        </div>
        <div className="card" style={{ maxWidth: '88%', borderRadius: 16, padding: 14, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 11 }}>Revised — Wed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 13 }}>
            <div className="diff-row rem"><i className="ti ti-minus" style={{ fontSize: 14 }} /><span>Overhead shoulder press</span></div>
            <div className="diff-row rem"><i className="ti ti-minus" style={{ fontSize: 14 }} /><span>Bench press</span></div>
            <div className="diff-row add"><i className="ti ti-plus" style={{ fontSize: 14 }} />Lat pulldown · 3×12</div>
            <div className="diff-row add"><i className="ti ti-plus" style={{ fontSize: 14 }} />Seated cable row · 3×12</div>
            <div className="diff-row mod"><i className="ti ti-adjustments" style={{ fontSize: 14 }} />Biceps curls → light, 3×15</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: 11, fontSize: 12.5 }}>Save this plan</button>
            <button className="btn" style={{ flex: 1, padding: 11, fontSize: 12.5, background: '#fff', border: '1.5px solid #1A1A2E', color: '#1A1A2E' }}>Change more</button>
          </div>
        </div>
      </div>

      <div className="scroll-x" style={{ flex: 'none', display: 'flex', gap: 8, padding: '0 18px 10px' }}>
        {quickPrompts.slice(0, 4).map(p => (
          <span key={p} className="chip" onClick={() => setDraft(p)} style={{ background: '#fff', color: '#1A1A2E' }}>{p}</span>
        ))}
      </div>

      <div style={{ flex: 'none', background: '#fff', borderTop: '1px solid #DDDDD9', padding: '11px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="ti ti-camera" style={{ fontSize: 22, color: '#8A8A85', flex: 'none' }} />
        <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Ask your coach…" style={{ flex: 1, background: '#F5F5F3', border: '1px solid #DDDDD9', borderRadius: 100, padding: '11px 16px', fontSize: 13, color: '#1A1A2E', outline: 'none' }} />
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#C8F25C', flex: 'none', cursor: 'pointer' }}><i className="ti ti-arrow-up" /></div>
      </div>
    </div>
  );
}

/* ─────────────────────────── PROGRESS ────────────────────── */
export function Progress() {
  const [week, setWeek] = useState(3);
  return (
    <div className="app-body">
      <div className="screen-pad scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-.02em', color: '#1A1A2E' }}>Your progress</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#1A1A2E' }}>
            <i className="ti ti-chevron-left" style={{ cursor: 'pointer' }} onClick={() => setWeek(w => Math.max(1, w - 1))} />
            <span style={{ fontWeight: 500 }}>Week {week}</span>
            <i className="ti ti-chevron-right" style={{ cursor: 'pointer' }} onClick={() => setWeek(w => w + 1)} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>Weight trend</span>
            <span style={{ fontSize: 12, color: '#3A7A0A', fontWeight: 500 }}>−1.2kg since start</span>
          </div>
          <svg width="100%" height="110" viewBox="0 0 320 110" preserveAspectRatio="none">
            <polyline points="10,26 82,40 154,58 226,68 298,82" fill="none" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {[[10,26],[82,40],[154,58],[226,68]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" fill="#fff" stroke="#1A1A2E" strokeWidth="2" />)}
            <circle cx="298" cy="82" r="6" fill="#C8F25C" stroke="#1A1A2E" strokeWidth="2" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8A8A85', marginTop: 6 }}>
            <span>Start</span><span>W1</span><span>W2</span><span>W3</span><span>Now</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 16 }}>
          <Stat label="Sessions" val="4 / 5" sub="this week" />
          <Stat label="Avg protein" val="94g" sub="/130g target" />
          <Stat label="Streak" val={<>12 <i className="ti ti-flame" style={{ fontSize: 16, color: '#D97706' }} /></>} sub="days" />
          <Stat label="Weight" val="78.5kg" sub="−0.5 this week" subGreen />
        </div>

        {/* weekly gym + diet table */}
        <div className="s-label" style={{ marginTop: 0 }}>This week · gym &amp; diet</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 66px 60px', padding: '10px 14px', background: '#F5F5F3', borderBottom: '1px solid #DDDDD9' }}>
            {['Day', 'Workout', 'Protein', 'kcal'].map((h, i) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8A8A85', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {weekSummary.map((d, i) => {
            const wk = { done: ['ti-circle-check-filled', '#3A7A0A'], today: ['ti-circle-check-filled', '#3A7A0A'], rest: ['ti-moon', '#8A8A85'], missed: ['ti-circle-x', '#DC2626'], none: [null, '#8A8A85'] }[d.status];
            const label = { done: d.workout, today: d.workout, rest: 'Rest', missed: 'Missed', none: '—' }[d.status];
            const pColor = d.protein == null ? '#8A8A85' : d.protein < 90 ? '#D97706' : '#1A1A2E';
            const kColor = d.kcal == null ? '#8A8A85' : d.kcal > 2100 ? '#D97706' : '#3A7A0A';
            return (
              <div key={d.day} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 66px 60px', alignItems: 'center', padding: '11px 14px', borderBottom: i < weekSummary.length - 1 ? '1px solid #EDEDEA' : 'none', background: d.status === 'today' ? '#EDFCD2' : 'transparent' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: d.status === 'none' || d.status === 'missed' ? '#8A8A85' : '#1A1A2E' }}>{d.day}</span>
                <span style={{ fontSize: 12, color: wk[1], display: 'flex', alignItems: 'center', gap: 5 }}>{wk[0] && <i className={`ti ${wk[0]}`} style={{ fontSize: 13 }} />}{label}</span>
                <span style={{ fontSize: 12, color: pColor, textAlign: 'right' }}>{d.protein == null ? '—' : d.protein + 'g'}</span>
                <span style={{ fontSize: 12, color: kColor, textAlign: 'right' }}>{d.kcal == null ? '—' : d.kcal.toLocaleString()}</span>
              </div>
            );
          })}
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 66px 60px', alignItems: 'center', padding: '11px 14px', background: '#1A1A2E' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#C8F25C' }}>Avg</span>
            <span style={{ fontSize: 12, color: '#fff' }}>{weekAvg.done}</span>
            <span style={{ fontSize: 12, color: '#fff', textAlign: 'right' }}>{weekAvg.protein}g</span>
            <span style={{ fontSize: 12, color: '#fff', textAlign: 'right' }}>{weekAvg.kcal.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}><i className="ti ti-brain" style={{ fontSize: 16, color: '#1A1A2E' }} /><span className="eyebrow">Your patterns</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
          {patterns.map(p => (
            <div key={p.title} className="card-navy" style={{ borderRadius: 14, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{p.title}</span>
                <span className="badge lime" style={{ fontSize: 10, padding: '2px 8px' }}>{p.badge}</span>
              </div>
              <div style={{ fontSize: 12, color: '#B8B8C8', lineHeight: 1.5 }}>{p.text}</div>
            </div>
          ))}
        </div>

        <div className="s-label" style={{ marginTop: 0 }}>Milestones</div>
        <div className="scroll-x" style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {milestones.map(m => (
            <div key={m.label} style={{ flex: 'none', width: 104, background: m.earned ? '#fff' : '#F0F0EC', border: '1px solid #DDDDD9', borderRadius: 14, padding: 14, textAlign: 'center', opacity: m.earned ? 1 : .6 }}>
              <div style={{ fontSize: 26, marginBottom: 6, filter: m.earned ? 'none' : 'grayscale(1)' }}>{m.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: m.earned ? '#1A1A2E' : '#8A8A85', lineHeight: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                {!m.earned && <i className="ti ti-lock" style={{ fontSize: 11 }} />}{m.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#EDFCD2', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>Log this week's weight</div>
          <div style={{ fontSize: 12, color: '#3A7A0A', marginBottom: 12 }}>Monday check-in keeps your trend honest.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="input-suffix" style={{ flex: 1, borderColor: '#1A1A2E' }}>
              <input type="number" inputMode="decimal" placeholder="78.0" />
              <span className="input-sfx">kg</span>
            </div>
            <button className="btn btn-primary" style={{ flex: 'none', padding: '12px 18px', fontSize: 13 }}>Log</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, val, sub, subGreen }) {
  return (
    <div className="card" style={{ borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 11, color: '#8A8A85', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 600, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 5 }}>{val}</div>
      <div style={{ fontSize: 11, color: subGreen ? '#3A7A0A' : '#8A8A85', marginTop: 1 }}>{sub}</div>
    </div>
  );
}

/* ─────────────────────────── CIRCLE ──────────────────────── */
export function Circle({ onBack, empty }) {
  if (empty) {
    return (
      <div className="app-body">
        <PushHeader title="Your circle" onBack={onBack} />
        <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', marginBottom: 24 }}>
            {[['R', 'soft'], ['P', 'navy'], ['A', 'soft']].map(([c, k], i) => (
              <div key={i} className={`avatar ${k}`} style={{ width: 56, height: 56, fontSize: 18, border: '3px solid #F5F5F3', marginLeft: i ? -16 : 0 }}>{c}</div>
            ))}
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-.03em', color: '#1A1A2E', marginBottom: 8 }}>Start your circle</div>
          <div style={{ fontSize: 14, color: '#8A8A85', lineHeight: 1.6, maxWidth: 260, marginBottom: 28 }}>Invite friends who keep you honest. You'll see each other show up — every single day.</div>
          <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn" style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}><i className="ti ti-brand-whatsapp" style={{ fontSize: 18 }} /> Invite via WhatsApp</button>
            <button className="btn" style={{ background: '#fff', border: '1.5px solid #1A1A2E', color: '#1A1A2E' }}><i className="ti ti-link" style={{ fontSize: 17 }} /> Copy link</button>
          </div>
        </div>
      </div>
    );
  }
  const statusBadge = { went: <span className="badge green"><i className="ti ti-check" /> Went</span>, no: <span className="badge amber">Not yet</span>, rest: <span className="badge neutral">Rest day</span> };
  const [detail, setDetail] = useState(null);
  return (
    <div className="app-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0' }}>
        <button className="icon-btn" onClick={onBack}><i className="ti ti-arrow-left" /></button>
        <i className="ti ti-settings" style={{ fontSize: 20, color: '#8A8A85' }} />
      </div>
      <div className="screen-pad scroll" style={{ paddingTop: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-.02em', color: '#1A1A2E' }}>Your circle</div>
        <div style={{ fontSize: 13, color: '#8A8A85', margin: '4px 0 18px' }}>{circle.length} members · Tuesday</div>
        {circle.map(m => (
          <div key={m.id} className="card" style={{ padding: 15, marginBottom: m.self ? 12 : 10, border: m.self ? '2px solid #C8F25C' : '1px solid #DDDDD9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: m.self || m.detail ? 12 : 0 }}>
              <div className={`avatar ${m.self ? 'navy' : 'soft'}`} style={{ width: 46, height: 46, fontSize: 16 }}>{m.initials}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>{m.self ? 'You' : m.name}</div><div style={{ fontSize: 12, color: '#8A8A85' }}>{m.place}</div></div>
              {statusBadge[m.status]}
            </div>
            {m.self && (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[['Session', m.session], ['Score', m.score], ['Top lift', m.lift]].map(([l, v]) => (
                    <div key={l} style={{ flex: 1, background: '#F5F5F3', borderRadius: 10, padding: '9px 11px' }}><div style={{ fontSize: 11, color: '#8A8A85' }}>{l}</div><div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginTop: 1 }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8A8A85' }}><span>👊 {m.fist}</span><span>💬 {m.comment}</span></div>
              </>
            )}
            {m.detail && <><div style={{ fontSize: 12, color: '#8A8A85' }}>{m.detail}</div><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}><div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8A8A85' }}><span>👊 {m.fist}</span><span>💬 {m.comment}</span></div>{memberWorkouts[m.id] && <span onClick={() => setDetail(m)} style={{ fontSize: 12, fontWeight: 500, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>View full workout <i className="ti ti-chevron-right" style={{ fontSize: 14 }} /></span>}</div></>}
          </div>
        ))}
      </div>
      {detail && <MemberDetailSheet member={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function MemberDetailSheet({ member, onClose }) {
  const w = memberWorkouts[member.id];
  if (!w) return null;
  return (
    <Sheet onClose={onClose} maxHeight="86%">
      <div className="scroll" style={{ overflowY: 'auto', padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="avatar soft" style={{ width: 52, height: 52, fontSize: 17 }}>{member.initials}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 17, fontWeight: 600, color: '#1A1A2E' }}>{member.name}</div><div style={{ fontSize: 12, color: '#8A8A85' }}>{member.place} · {w.time}</div></div>
          <span className="badge green"><i className="ti ti-check" /> {w.session}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[[w.durationMin + 'm', 'Duration', false], [w.sets, 'Sets', false], [w.prs, 'PRs', true]].map(([v, l, pr]) => (
            <div key={l} className="card" style={{ flex: 1, borderRadius: 12, padding: 11 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: pr ? '#3A7A0A' : '#1A1A2E', display: 'flex', alignItems: 'center', gap: 3 }}>{v}{pr ? <i className="ti ti-trophy" style={{ fontSize: 13 }} /> : null}</div>
              <div style={{ fontSize: 11, color: '#8A8A85', marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="s-label" style={{ marginTop: 0 }}>Exercise chart</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 52px', padding: '10px 14px', background: '#F5F5F3', borderBottom: '1px solid #DDDDD9' }}>
            {['Exercise', 'Sets', 'Weight'].map((h, i) => <span key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8A8A85', textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>{h}</span>)}
          </div>
          {w.exercises.map((ex, i) => (
            <div key={ex.name} style={{ padding: '11px 14px', borderBottom: i < w.exercises.length - 1 ? '1px solid #EDEDEA' : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 52px', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{ex.name} {ex.pr && <span style={{ fontSize: 10, color: '#3A7A0A', fontWeight: 500 }}>PR</span>}</span>
                <span style={{ fontSize: 12, color: '#1A1A2E', textAlign: 'center' }}>{ex.sets}</span>
                <span style={{ fontSize: 12, color: '#1A1A2E', textAlign: 'right' }}>{ex.weight}</span>
              </div>
              <div style={{ fontSize: 11, color: '#8A8A85', marginTop: 4 }}>{ex.reps} reps</div>
            </div>
          ))}
        </div>
      </div>
      <div className="sticky-cta" style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }}>👊 Fistbump</button>
        <button className="btn" style={{ flex: 'none', padding: '13px 18px', background: '#fff', border: '1.5px solid #1A1A2E', color: '#1A1A2E' }}><i className="ti ti-message-circle" /></button>
      </div>
    </Sheet>
  );
}
