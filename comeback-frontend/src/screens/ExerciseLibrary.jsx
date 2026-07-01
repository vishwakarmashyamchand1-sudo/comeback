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
    </div>
  );
}
