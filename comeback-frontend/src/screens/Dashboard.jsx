import React from 'react';

export default function Dashboard({ navigateTo }) {
  // We'll mock the user data for now until API is connected
  const userName = "Shivam";
  const streakDays = 12;

  return (
    <div className="screen active" id="screen-dashboard" style={{ display: 'flex' }}>
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <div className="greet-eyebrow">Good Morning <span id="dash-name">{userName}</span> 👋</div>
          <div className="greet-name">Day <span id="dash-day">{streakDays}</span> of your Comeback Journey</div>
          <div className="goal-chip">⚡ Current Goal: Muscle Gain</div>
        </div>
        <div className="avatar-btn" onClick={() => navigateTo('profile')} style={{ cursor: 'pointer' }}>S</div>
      </div>

      <div className="pad">
        {/* Section 2: AI Coach Insight */}
        <div className="card-dark" style={{ marginTop: '18px' }}>
          <div className="card-eyebrow"><span className="dot-lime"></span> AI COACH INSIGHT</div>
          <div className="recovery-score-row">
            <div className="recovery-ring">
              <div className="inner">82%</div>
            </div>
            <div>
              <div className="recovery-label">Today's Recovery Score</div>
              <div className="recovery-value">82% — Well Recovered</div>
            </div>
          </div>
          <p className="insight">You are well recovered and ready for an upper body workout today.</p>
          <div className="card-dark-actions">
            <button className="btn btn-on-dark btn-sm" onClick={() => alert('Opening recovery details')}>View Details</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigateTo('coach')}>Ask Coach</button>
          </div>
        </div>

        {/* Section 3: Today's Workout */}
        <div className="card">
          <div className="workout-row">
            <div className="thumb-square">🏋️</div>
            <div style={{ flex: 1, marginLeft: '14px' }}>
              <h4 style={{ fontSize: '15.5px', color: 'var(--navy)' }}>Push Day</h4>
              <div className="workout-meta">
                <span>🎯 Chest + Triceps</span>
                <span>⏱ 45 Min</span>
                <span>📊 Intermediate</span>
              </div>
            </div>
          </div>
          <div className="workout-actions">
            <button className="btn btn-dark" onClick={() => navigateTo('workout')}>Start Workout</button>
            <button className="btn btn-outline" onClick={() => navigateTo('workout')}>View Exercises</button>
          </div>
        </div>

        {/* Section 4: Nutrition Overview */}
        <div className="card">
          <div className="flex-between">
            <h4 style={{ fontSize: '15px', color: 'var(--navy)' }}>Nutrition Overview</h4>
            <span className="muted" style={{ fontSize: '12px' }}>68% logged</span>
          </div>
          <div className="stat-row" style={{ marginTop: '14px' }}>
            <div className="stat-box">
              <div className="s-label"><span>Calories</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '64%' }}></div></div>
              <div className="s-value">1,540 / 2,400</div>
            </div>
            <div className="stat-box">
              <div className="s-label"><span>Protein</span></div>
              <div className="bar-track"><div className="bar-fill navy" style={{ width: '55%' }}></div></div>
              <div className="s-value">98 / 180 g</div>
            </div>
          </div>
          <div className="stat-row" style={{ marginTop: '10px' }}>
            <div className="stat-box">
              <div className="s-label"><span>Carbs</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '48%' }}></div></div>
              <div className="s-value">120 / 250 g</div>
            </div>
            <div className="stat-box">
              <div className="s-label"><span>Fats</span></div>
              <div className="bar-track"><div className="bar-fill navy" style={{ width: '70%' }}></div></div>
              <div className="s-value">56 / 80 g</div>
            </div>
          </div>
          <button className="btn btn-outline btn-block" style={{ marginTop: '14px' }} onClick={() => navigateTo('diet')}>View Full Nutrition</button>
        </div>

        {/* V2 FEATURES: Daily Tasks, Streak Breakdown, Achievements, Weekly Progress Snapshot */}
        {/* HIDING THESE FOR V1 AS REQUESTED */}
        
        {/* Section 9: AI Recommendation */}
        <div className="section-title">AI Recommendation</div>
        <div className="card">
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>Based on your last 7 days:</p>
          <div className="rec-list">
            <div className="rec-item"><span className="ic">●</span><span>Increase protein by 15g per day to support muscle recovery.</span></div>
            <div className="rec-item"><span className="ic">●</span><span>Increase bench press weight by 2.5kg next session.</span></div>
          </div>
          <div className="rec-actions">
            <button className="btn btn-primary" onClick={() => alert('Recommendation applied ✓')}>Apply Recommendation</button>
            <button className="btn btn-ghost" onClick={() => alert('Recommendation dismissed')}>Ignore</button>
          </div>
        </div>

        {/* Section 10: Recent Activity */}
        <div className="section-title">Recent Activity</div>
        <div className="card">
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, marginBottom: '4px' }}>YESTERDAY</p>
          <div className="activity-row"><div className="activity-check">✓</div><div className="activity-text">Push Workout Completed</div></div>
          <div className="activity-row"><div className="activity-check">✓</div><div className="activity-text">Protein Goal Completed</div></div>
        </div>

      </div>
    </div>
  );
}
