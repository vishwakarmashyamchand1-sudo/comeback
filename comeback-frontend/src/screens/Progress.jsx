import React from 'react';

export default function Progress() {
  return (
    <div className="screen active">
      <div className="page-head">
        <h2>Your Progress</h2>
      </div>
      <div className="pad">
        
        {/* Metric Grid */}
        <div className="metric-grid">
          <div className="metric-box">
            <div className="m-label">CURRENT WEIGHT</div>
            <div className="m-value">71.5 kg</div>
            <div className="m-trend">↑ 1.5kg this month</div>
          </div>
          <div className="metric-box">
            <div className="m-label">GOAL WEIGHT</div>
            <div className="m-value">78 kg</div>
          </div>
          <div className="metric-box">
            <div className="m-label">BODY FAT</div>
            <div className="m-value">16.4%</div>
            <div className="m-trend">↓ 0.8% this month</div>
          </div>
          <div className="metric-box">
            <div className="m-label">BMI</div>
            <div className="m-value">22.8</div>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-card" style={{ marginTop: '18px' }}>
          <h4>Weight Trend</h4>
          <div className="chart-bars">
            <div className="b" style={{ height: '50%' }}></div>
            <div className="b" style={{ height: '58%' }}></div>
            <div className="b" style={{ height: '62%' }}></div>
            <div className="b" style={{ height: '68%' }}></div>
            <div className="b" style={{ height: '74%' }}></div>
            <div className="b" style={{ height: '80%' }}></div>
            <div className="b" style={{ height: '88%' }}></div>
          </div>
          <div className="chart-labels">
            <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span>
          </div>
        </div>

        <div className="chart-card">
          <h4>Calories Trend</h4>
          <div className="chart-bars">
            <div className="b" style={{ height: '60%' }}></div>
            <div className="b" style={{ height: '70%' }}></div>
            <div className="b" style={{ height: '55%' }}></div>
            <div className="b" style={{ height: '75%' }}></div>
            <div className="b" style={{ height: '80%' }}></div>
            <div className="b" style={{ height: '65%' }}></div>
            <div className="b" style={{ height: '90%' }}></div>
          </div>
          <div className="chart-labels">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>

        <div className="chart-card">
          <h4>Protein Trend</h4>
          <div className="chart-bars">
            <div className="b" style={{ height: '40%' }}></div>
            <div className="b" style={{ height: '55%' }}></div>
            <div className="b" style={{ height: '50%' }}></div>
            <div className="b" style={{ height: '65%' }}></div>
            <div className="b" style={{ height: '72%' }}></div>
            <div className="b" style={{ height: '80%' }}></div>
            <div className="b" style={{ height: '85%' }}></div>
          </div>
          <div className="chart-labels">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>

        <div className="chart-card">
          <h4>Workout Completion Trend</h4>
          <div className="chart-bars">
            <div className="b" style={{ height: '90%' }}></div>
            <div className="b" style={{ height: '80%' }}></div>
            <div className="b" style={{ height: '100%' }}></div>
            <div className="b" style={{ height: '60%' }}></div>
            <div className="b" style={{ height: '90%' }}></div>
            <div className="b" style={{ height: '100%' }}></div>
            <div className="b" style={{ height: '70%' }}></div>
          </div>
          <div className="chart-labels">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>

        <div className="chart-card">
          <h4>Consistency Trend</h4>
          <div className="chart-bars">
            <div className="b" style={{ height: '55%' }}></div>
            <div className="b" style={{ height: '60%' }}></div>
            <div className="b" style={{ height: '68%' }}></div>
            <div className="b" style={{ height: '72%' }}></div>
            <div className="b" style={{ height: '78%' }}></div>
            <div className="b" style={{ height: '85%' }}></div>
            <div className="b" style={{ height: '91%' }}></div>
          </div>
          <div className="chart-labels">
            <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span>
          </div>
        </div>

        {/* AI Insights */}
        <div className="section-title">AI Insights</div>
        <div className="insight-row">
          <span className="ic">📈</span>
          <p>You gained 1.5kg in the last month, in line with your muscle gain goal.</p>
        </div>
        <div className="insight-row">
          <span className="ic">🍗</span>
          <p>Protein intake improved by 18% compared to last month.</p>
        </div>
        <div className="insight-row">
          <span className="ic">🔥</span>
          <p>Workout consistency increased by 25% over the last 4 weeks.</p>
        </div>

        {/* Personal Records */}
        <div className="section-title">Personal Records</div>
        <div className="card">
          <div className="pr-row">
            <div>
              <div className="name">Bench Press</div>
              <div className="date">Jun 24, 2026</div>
            </div>
            <div className="val">85 kg</div>
          </div>
          <div className="pr-row">
            <div>
              <div className="name">Squat</div>
              <div className="date">Jun 18, 2026</div>
            </div>
            <div className="val">110 kg</div>
          </div>
          <div className="pr-row">
            <div>
              <div className="name">Deadlift</div>
              <div className="date">Jun 10, 2026</div>
            </div>
            <div className="val">140 kg</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="section-title">Achievements</div>
        <div className="achv-row">
          <div className="achv-badge" onClick={() => alert('First Workout — earned!')}>
            <div className="emoji">🏆</div>
            <div className="label">First Workout</div>
          </div>
          <div className="achv-badge" onClick={() => alert('Protein Goal Hit — earned!')}>
            <div className="emoji">🍗</div>
            <div className="label">Protein Goal</div>
          </div>
          <div className="achv-badge" onClick={() => alert('7 Day Streak — earned!')}>
            <div className="emoji">🔥</div>
            <div className="label">7 Day Streak</div>
          </div>
          <div className="achv-badge" onClick={() => alert('PR Bench Press — earned!')}>
            <div className="emoji">💪</div>
            <div className="label">PR Bench</div>
          </div>
          <div className="achv-badge" onClick={() => alert('30 Day Goal — earned!')}>
            <div className="emoji">🎯</div>
            <div className="label">30 Day Goal</div>
          </div>
        </div>

        {/* Milestones */}
        <div className="section-title">Milestones</div>
        <div className="card">
          <div className="milestone-row">
            <div className="milestone-dot"></div>
            <div>
              <div className="t">Started Comeback Journey</div>
              <div className="d">Jun 18, 2026</div>
            </div>
          </div>
          <div className="milestone-row">
            <div className="milestone-dot"></div>
            <div>
              <div className="t">First 5kg weight gain</div>
              <div className="d">Jun 25, 2026</div>
            </div>
          </div>
          <div className="milestone-row">
            <div className="milestone-dot"></div>
            <div>
              <div className="t">Hit 12 day workout streak</div>
              <div className="d">Jun 29, 2026</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
