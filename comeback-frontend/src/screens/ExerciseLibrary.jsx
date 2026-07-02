import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../lib/store.jsx';
import { API_URL } from '../lib/api.js';
import { TextField, PillGroup } from '../components/UI.jsx';

const FILTERS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes'];

function mapMuscleGroup(rawGroup) {
  if (!rawGroup) return 'Other';
  const grp = rawGroup.toLowerCase();
  if (grp.includes('legs') || grp.includes('quads') || grp.includes('hamstrings') || grp.includes('calves')) return 'Legs';
  if (grp.includes('chest')) return 'Chest';
  if (grp.includes('back')) return 'Back';
  if (grp.includes('shoulders') || grp.includes('delts')) return 'Shoulders';
  if (grp.includes('biceps')) return 'Biceps';
  if (grp.includes('triceps')) return 'Triceps';
  if (grp.includes('core') || grp.includes('abs')) return 'Core';
  if (grp.includes('glutes')) return 'Glutes';
  return rawGroup;
}

export default function ExerciseLibrary({ navigateTo }) {
  const { state } = useOnboarding();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    async function loadExercises() {
      try {
        setLoading(true);
        setError('');
        
        let allEx = [];
        let page = 1;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(`${API_URL}/api/exercises?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
          });
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.message || 'Unable to load exercises');
          
          allEx = [...allEx, ...(data.exercises || [])];
          
          if (allEx.length >= data.total || (data.exercises && data.exercises.length < limit)) {
            hasMore = false;
          } else {
            page++;
          }
        }
        
        // Map backend muscles to UI muscles
        const mapped = allEx.map(ex => ({
          ...ex,
          uiMuscle: mapMuscleGroup(ex.muscleGroup)
        }));
        
        setExercises(mapped);
      } catch (err) {
        setError('Unable to load exercises.\nPlease try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (state.token) {
      loadExercises();
    }
  }, [state.token]);

  // Derived state for filtering
  const filtered = exercises.filter(ex => {
    // 1. Filter by Muscle Group
    if (activeFilter !== 'All' && ex.uiMuscle !== activeFilter) return false;
    
    // 2. Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!ex.name.toLowerCase().includes(q)) return false;
    }
    
    return true;
  });

  return (
    <div className="screen active" style={{ display: 'flex' }}>
      <div className="page-head">
        <h2>Exercise Library</h2>
      </div>
      
      <div className="pad" style={{ paddingBottom: '100px', width: '100%' }}>
        
        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <TextField 
            value={search} 
            onChange={setSearch} 
            placeholder="Search exercises (e.g. Bench Press)" 
            type="text" 
          />
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
            <PillGroup options={FILTERS} value={activeFilter} onChange={setActiveFilter} />
          </div>
        </div>

        {/* States */}
        {error && (
          <div className="empty-state">
            <i className="ti ti-alert-circle" style={{ fontSize: 40, color: 'var(--c-red)', marginBottom: 12 }}></i>
            <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
          </div>
        )}

        {loading && !error && (
          <div className="lib-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="lib-card skeleton-card">
                <div className="skel-img skeleton"></div>
                <div className="skel-text skeleton" style={{ width: '80%', marginTop: 12 }}></div>
                <div className="skel-text skeleton" style={{ width: '50%', marginTop: 8 }}></div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <i className="ti ti-search" style={{ fontSize: 40, color: 'var(--c-text-muted)', marginBottom: 12 }}></i>
            <div>No exercises found</div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="lib-grid">
            {filtered.map(ex => (
              <div key={ex._id || ex.sourceId} className="lib-card">
                <div className="lib-img-wrap">
                  <img src={ex.gifUrl} alt={ex.name} className="lib-gif" loading="lazy" />
                  <div className="lib-badge">{ex.uiMuscle}</div>
                </div>
                <div className="lib-info">
                  <div className="lib-name">{ex.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal Overlay */}
      {selectedExercise && (
        <div className="exercise-modal-overlay" onClick={() => setSelectedExercise(null)}>
          <div className="exercise-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedExercise(null)}>&times;</button>
            <div className="modal-gif-wrap">
              <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="modal-gif" loading="lazy" />
            </div>
            <div className="modal-info">
              <h2 className="modal-title">{selectedExercise.name}</h2>
              <p className="modal-why">{selectedExercise.whyLabel || 'Great exercise for building strength and endurance.'}</p>
              <div className="modal-tags">
                <span className="modal-badge muscle">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z"/></svg>
                  {selectedExercise.uiMuscle}
                </span>
                <span className="modal-badge eq">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4v16M18 4v16M2 8h4M2 16h4M18 8h4M18 16h4M6 12h12"/></svg>
                  {selectedExercise.equipment}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
