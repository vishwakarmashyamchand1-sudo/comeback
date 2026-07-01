import React from 'react';

export default function WorkoutList({ navigateTo }) {
  return (
    <div className="screen active" style={{ display: 'flex' }}>
      <div className="page-head">
        <h2>Today's Workout</h2>
      </div>
      <div className="page-sub">Push Day · Chest + Triceps · 45 Minutes</div>

      <div className="pad" id="workout-list" style={{ paddingBottom: '100px' }}>
        <div className="exercise-card">
          <div className="exercise-top">
            <div className="ex-gif">🏋️</div>
            <div className="ex-info">
              <h4>Bench Press</h4>
              <div className="ex-tags">
                <span className="tag-pill">Chest</span>
                <span className="tag-pill">4 sets × 8 reps</span>
                <span className="tag-pill rest">Rest 90s</span>
                <span className="tag-pill diff">Intermediate</span>
              </div>
            </div>
          </div>
          <div className="ai-reason">🤖 <span>Selected because your chest volume was lower than target last week.</span></div>
          <div className="ex-actions">
            <button className="btn btn-dark btn-sm" onClick={() => navigateTo('active-workout')}>Start</button>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Exercise details')}>Details</button>
            <button className="btn btn-ghost btn-sm" onClick={() => alert('Exercise replaced')}>Replace Exercise</button>
          </div>
        </div>

        <div className="exercise-card">
          <div className="exercise-top">
            <div className="ex-gif">🤸</div>
            <div className="ex-info">
              <h4>Incline Dumbbell Press</h4>
              <div className="ex-tags">
                <span className="tag-pill">Upper Chest</span>
                <span className="tag-pill">3 sets × 10 reps</span>
                <span className="tag-pill rest">Rest 75s</span>
                <span className="tag-pill diff">Intermediate</span>
              </div>
            </div>
          </div>
          <div className="ai-reason">🤖 <span>Targets upper chest fibers your recent sessions under-trained.</span></div>
          <div className="ex-actions">
            <button className="btn btn-dark btn-sm" onClick={() => navigateTo('active-workout')}>Start</button>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Exercise details')}>Details</button>
            <button className="btn btn-ghost btn-sm" onClick={() => alert('Exercise replaced')}>Replace Exercise</button>
          </div>
        </div>

        <div className="exercise-card">
          <div className="exercise-top">
            <div className="ex-gif">💪</div>
            <div className="ex-info">
              <h4>Overhead Shoulder Press</h4>
              <div className="ex-tags">
                <span className="tag-pill">Shoulders</span>
                <span className="tag-pill">4 sets × 10 reps</span>
                <span className="tag-pill rest">Rest 90s</span>
                <span className="tag-pill diff">Intermediate</span>
              </div>
            </div>
          </div>
          <div className="ai-reason">🤖 <span>Builds shoulder stability that supports your pressing strength.</span></div>
          <div className="ex-actions">
            <button className="btn btn-dark btn-sm" onClick={() => navigateTo('active-workout')}>Start</button>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Exercise details')}>Details</button>
            <button className="btn btn-ghost btn-sm" onClick={() => alert('Exercise replaced')}>Replace Exercise</button>
          </div>
        </div>

        <div className="exercise-card">
          <div className="exercise-top">
            <div className="ex-gif">🔻</div>
            <div className="ex-info">
              <h4>Triceps Pushdown</h4>
              <div className="ex-tags">
                <span className="tag-pill">Triceps</span>
                <span className="tag-pill">3 sets × 12 reps</span>
                <span className="tag-pill rest">Rest 60s</span>
                <span className="tag-pill diff">Beginner</span>
              </div>
            </div>
          </div>
          <div className="ai-reason">🤖 <span>Finishes the push session with isolated triceps volume.</span></div>
          <div className="ex-actions">
            <button className="btn btn-dark btn-sm" onClick={() => navigateTo('active-workout')}>Start</button>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Exercise details')}>Details</button>
            <button className="btn btn-ghost btn-sm" onClick={() => alert('Exercise replaced')}>Replace Exercise</button>
          </div>
        </div>
      </div>
    </div>
  );
}
