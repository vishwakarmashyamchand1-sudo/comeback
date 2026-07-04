import React, { useState } from 'react';
import { Thumb } from '../components.jsx';
import { browserExercises, muscleFilters } from '../data.js';

export function ExerciseBrowser({ onClose, onAdd }) {
  const [filter, setFilter] = useState('All');
  const [detail, setDetail] = useState(null);
  const list = filter === 'All' ? browserExercises : browserExercises.filter(e => e.muscle === filter);

  return (
    <div className="app-body">
      <div style={{ flex: 'none', padding: '12px 20px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#1A1A2E' }}>Add exercise</span>
          <button className="icon-btn" onClick={onClose} style={{ width: 34, height: 34 }}><i className="ti ti-x" /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid #DDDDD9', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
          <i className="ti ti-search" style={{ fontSize: 17, color: '#8A8A85' }} />
          <input placeholder="Search or describe — e.g. reduce belly fat" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#1A1A2E', background: 'transparent' }} />
        </div>
        <div className="scroll-x" style={{ display: 'flex', gap: 7 }}>
          {muscleFilters.map(f => (
            <span key={f} className={`chip ${filter === f ? 'sel' : ''}`} onClick={() => setFilter(f)}>{f}</span>
          ))}
        </div>
      </div>

      <div className="screen-pad scroll" style={{ paddingTop: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {list.map(e => (
            <div key={e.name} className="card" style={{ padding: 10, cursor: 'pointer' }} onClick={() => setDetail(e)}>
              <Thumb style={{ width: '100%', aspectRatio: '1', height: 'auto', borderRadius: 10, marginBottom: 9, fontSize: 22 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{e.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                <span className="badge neutral" style={{ fontSize: 10, padding: '2px 7px' }}>{e.equip}</span>
                <span style={{ fontSize: 10, color: '#8A8A85' }}>{e.muscle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {detail && (
        <div className="sheet-scrim" onClick={() => setDetail(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-grab" />
            <div className="scroll" style={{ padding: '0 20px 16px', overflowY: 'auto' }}>
              <div className="thumb" style={{ height: 200, borderRadius: 16, fontSize: 34, marginBottom: 16, position: 'relative' }}>
                <i className="ti ti-photo" />
                <span style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 11, color: '#8A8A85', background: '#ffffffcc', padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-player-play" style={{ fontSize: 12 }} /> Demo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: '#1A1A2E' }}>{detail.name}</span>
                <span className="badge neutral" style={{ fontSize: 10 }}>{detail.muscle}</span>
              </div>
              <div style={{ fontSize: 13, color: '#3A7A0A', marginBottom: 16 }}>Builds strength and control through a full range</div>
              <div className="s-label" style={{ marginTop: 0 }}>Instructions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                {['Set up with a stable, braced position.', 'Move through the full range under control.', 'Squeeze at the top, then lower slowly.'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, fontSize: 13, color: '#1A1A2E', lineHeight: 1.5 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#1A1A2E', color: '#C8F25C', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{i + 1}</span>{s}
                  </div>
                ))}
              </div>
              <div style={{ background: '#E8E8F5', borderRadius: 12, padding: '12px 14px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-history" style={{ fontSize: 18, color: '#1A1A2E' }} />
                <div style={{ fontSize: 12, color: '#1A1A2E' }}><b>Last time:</b> 3 weeks ago · 10kg × 10 reps</div>
              </div>
            </div>
            <div className="sticky-cta">
              <button className="btn btn-primary" onClick={() => { onAdd && onAdd(detail); setDetail(null); onClose(); }}>Add to today <i className="ti ti-plus btn-icon" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
