import React, { useState } from 'react';
import Dashboard from './Dashboard.jsx';
import WorkoutList from './WorkoutList.jsx';
import ActiveWorkout from './ActiveWorkout.jsx';
import DietTracker from './DietTracker.jsx';
import CoachChat from './CoachChat.jsx';
import Progress from './Progress.jsx';
import Profile from './Profile.jsx';

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigateTo = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div id="app-shell">
      
      {/* Current Screen Rendering */}
      {activeTab === 'dashboard' && <Dashboard navigateTo={navigateTo} />}
      
      {activeTab === 'workout' && <WorkoutList navigateTo={navigateTo} />}
      {activeTab === 'active-workout' && <ActiveWorkout navigateTo={navigateTo} />}
      {activeTab === 'diet' && <DietTracker navigateTo={navigateTo} />}
      {activeTab === 'coach' && <CoachChat navigateTo={navigateTo} />}
      {activeTab === 'progress' && <Progress navigateTo={navigateTo} />}
      {activeTab === 'profile' && <Profile navigateTo={navigateTo} />}

      {/* Bottom Navigation */}
      {activeTab !== 'active-workout' && (
        <div className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => navigateTo('dashboard')}
          >
            <div className="nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>
            <span>Home</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'workout' ? 'active' : ''}`} 
            onClick={() => navigateTo('workout')}
          >
            <div className="nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6v12M18 6v12M2 10h4M2 14h4M18 10h4M18 14h4M6 12h12"/></svg></div>
            <span>Workout</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'diet' ? 'active' : ''}`} 
            onClick={() => navigateTo('diet')}
          >
            <div className="nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7a4 4 0 004 4v9M7 2v6M11 2v6M16 2c-2 2-2 5-2 7a3 3 0 003 3v10"/></svg></div>
            <span>Diet</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'coach' ? 'active' : ''}`} 
            onClick={() => navigateTo('coach')}
          >
            <div className="nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-9 8.4A8.5 8.5 0 113 11.5 8.38 8.38 0 0111.5 3a8.5 8.5 0 019.5 8.5z"/></svg></div>
            <span>Coach</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`} 
            onClick={() => navigateTo('progress')}
          >
            <div className="nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18M7 14l4-4 3 3 5-6"/></svg></div>
            <span>Progress</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => navigateTo('profile')}
          >
            <div className="nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></div>
            <span>Profile</span>
          </button>
        </div>
      )}

    </div>
  );
}
