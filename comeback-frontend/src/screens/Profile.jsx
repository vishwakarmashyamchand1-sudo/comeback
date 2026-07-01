import React, { useState } from 'react';

export default function Profile({ navigateTo }) {
  const [reminders, setReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [metricUnits, setMetricUnits] = useState(false);

  return (
    <div className="screen active">
      <div className="profile-head">
        <div className="profile-avatar" id="profile-avatar">S</div>
        <div className="profile-name" id="profile-name">Shivam</div>
        <div className="profile-sub">Muscle Gain · Intermediate</div>
      </div>
      
      <div className="pad" style={{ paddingTop: '6px' }}>
        <div className="card">
          <div className="info-row"><span className="k">Current Weight</span><span className="v">71.5 kg</span></div>
          <div className="info-row"><span className="k">Goal Weight</span><span className="v">78 kg</span></div>
          <div className="info-row"><span className="k">Height</span><span className="v">175 cm</span></div>
          <div className="info-row"><span className="k">Fitness Goal</span><span className="v">Muscle Gain</span></div>
          <div className="info-row"><span className="k">Activity Level</span><span className="v">Moderate</span></div>
          <div className="info-row"><span className="k">Diet Preference</span><span className="v">Non Vegetarian</span></div>
        </div>

        <div className="section-title" style={{ marginTop: '4px' }}>Notifications</div>
        <div className="card">
          <div className="settings-row">
            <div className="label">🔔 Workout Reminders</div>
            <div className={`toggle ${reminders ? 'on' : ''}`} onClick={() => setReminders(!reminders)}></div>
          </div>
          <div className="settings-row">
            <div className="label">🍽 Meal Logging Reminders</div>
            <div className={`toggle ${mealReminders ? 'on' : ''}`} onClick={() => setMealReminders(!mealReminders)}></div>
          </div>
          <div className="settings-row">
            <div className="label">📏 Units (Metric)</div>
            <div className={`toggle ${metricUnits ? 'on' : ''}`} onClick={() => setMetricUnits(!metricUnits)}></div>
          </div>
        </div>

        <div className="section-title">Subscription</div>
        <div className="plan-card">
          <div>
            <div className="p-name">Current Plan</div>
            <div className="p-tier">Comeback Pro</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Redirecting to upgrade')}>Upgrade</button>
        </div>

        <div className="section-title">Coming Soon</div>
        <div className="soon-card"><span className="ic">🎥</span><span className="t">AI Form Correction</span><span className="soon-tag">SOON</span></div>
        <div className="soon-card"><span className="ic">⌚</span><span className="t">Wearable Integration</span><span className="soon-tag">SOON</span></div>
        <div className="soon-card"><span className="ic">⌚</span><span className="t">Smart Watch Sync</span><span className="soon-tag">SOON</span></div>
        <div className="soon-card"><span className="ic">🎙</span><span className="t">Voice Coach</span><span className="soon-tag">SOON</span></div>
        <div className="soon-card"><span className="ic">🩹</span><span className="t">Injury Prevention AI</span><span className="soon-tag">SOON</span></div>
        <div className="soon-card"><span className="ic">🧠</span><span className="t">AI Recovery Score</span><span className="soon-tag">SOON</span></div>
        <div className="soon-card"><span className="ic">🌐</span><span className="t">Community Challenges</span><span className="soon-tag">SOON</span></div>
        <div className="soon-card"><span className="ic">🤝</span><span className="t">Personal Trainer Marketplace</span><span className="soon-tag">SOON</span></div>

        <button 
          className="btn btn-outline btn-block" 
          style={{ marginTop: '20px', borderColor: 'var(--danger)', color: 'var(--danger)' }} 
          onClick={() => alert('Logged out')}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
