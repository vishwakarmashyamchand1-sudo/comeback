import React, { useState, useEffect } from 'react';

export default function ActiveWorkout({ navigateTo }) {
  const [seconds, setSeconds] = useState(0);

  // A real working timer!
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="screen active" style={{ display: 'flex', background: 'var(--navy)', color: 'var(--white)' }}>
      {/* Top Bar */}
      <div className="aw-topbar">
        <div className="back-btn" onClick={() => navigateTo('workout')} style={{ color: 'var(--white)', cursor: 'pointer' }}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <div style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '1px', color: 'var(--lime)' }}>
          WORKOUT IN PROGRESS
        </div>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* Timer */}
      <div className="aw-timer-wrap">
        <div className="aw-timer" id="main-timer">{formatTime(seconds)}</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Total Time</div>
      </div>

      <div className="pad" style={{ flex: 1 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '12px', color: 'var(--lime)', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
            UP NEXT
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--white)' }}>
            Barbell Bench Press
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            Set 1 of 4 • 8-10 Reps
          </div>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="aw-secondary" style={{ display: 'flex', padding: '0 20px', marginTop: '20px' }}>
        <button className="btn" onClick={() => alert('Viewing History')} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: 'var(--white)', fontSize: '13px', padding: '13px', borderRadius: '12px' }}>
          View History
        </button>
        <div style={{ width: '12px' }}></div>
        <button className="btn" onClick={() => alert('Substituting Exercise')} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: 'var(--white)', fontSize: '13px', padding: '13px', borderRadius: '12px' }}>
          Substitute
        </button>
      </div>
      
      <div style={{ height: '100px' }}></div>
      
      {/* Complete Button */}
      <div className="bottom-action-bar" style={{ background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          className="btn btn-lime btn-block" 
          onClick={() => {
            alert(`Great job! You worked out for ${formatTime(seconds)}`);
            navigateTo('dashboard');
          }} 
          style={{ padding: '16px', fontSize: '16px', fontWeight: 700, borderRadius: '16px', color: 'var(--navy)' }}
        >
          Complete Workout
        </button>
      </div>
    </div>
  );
}
