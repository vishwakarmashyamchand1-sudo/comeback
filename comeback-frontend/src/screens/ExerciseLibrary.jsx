import React, { useState, useEffect, useRef } from 'react';
import { useOnboarding } from '../lib/store.jsx';
import { API_URL } from '../lib/api.js';
import { TextField, FilterDropdown } from '../components/UI.jsx';

const MUSCLE_FILTERS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes'];
const EQUIPMENT_FILTERS = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Body Weight', 'Leverage Machine', 'Resistance Band'];
const GOAL_FILTERS = ['All', 'Muscle Gain', 'Fat Loss', 'Belly Fat', 'Strength', 'Endurance', 'Fitness'];

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

// Custom hook for debouncing search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ExerciseLibrary({ navigateTo }) {
  const { state } = useOnboarding();
  
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [fullExerciseDetails, setFullExerciseDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400); // 400ms debounce
  
  const [activeFilter, setActiveFilter] = useState('All'); // Muscle Group
  const [activeEquipment, setActiveEquipment] = useState('All');
  const [activeGoal, setActiveGoal] = useState('All');
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Reset page to 1 when search or any filter changes
  useEffect(() => {
    setPage(1);
    setExercises([]);
    setHasMore(true);
  }, [debouncedSearch, activeFilter, activeEquipment, activeGoal]);

  useEffect(() => {
    async function loadExercises() {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);
        
        setError('');
        
        // Build query string
        const params = new URLSearchParams({
          page: page,
          limit: 20
        });
        
        if (debouncedSearch.trim()) {
          params.append('search', debouncedSearch.trim());
        }
        
        if (activeFilter !== 'All') {
          params.append('muscleGroup', activeFilter);
        }
        
        if (activeEquipment !== 'All') {
          params.append('equipment', activeEquipment.toLowerCase());
        }
        
        if (activeGoal !== 'All') {
          // Format Goal for backend (e.g. "Weight Loss" -> "weight_loss")
          const formattedGoal = activeGoal.toLowerCase().replace(' ', '_');
          params.append('goalTag', formattedGoal);
        }

        const res = await fetch(`${API_URL}/api/exercises?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Unable to load exercises');
        
        const newExercises = data.exercises || [];
        
        // Map backend muscles to UI muscles for display
        const mapped = newExercises.map(ex => ({
          ...ex,
          uiMuscle: mapMuscleGroup(ex.muscleGroup)
        }));
        
        setExercises(prev => page === 1 ? mapped : [...prev, ...mapped]);
        
        // Check if we reached the end
        if (page === 1 && mapped.length >= data.total) {
          setHasMore(false);
        } else if (mapped.length < 20) {
          setHasMore(false); // Less than requested limit means we reached the end
        }
        
      } catch (err) {
        setError('Unable to load exercises.\nPlease try again.');
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    
    if (state.token) {
      loadExercises();
    }
  }, [state.token, debouncedSearch, activeFilter, activeEquipment, activeGoal, page]);

  const handleCardClick = async (ex) => {
    setSelectedExercise(ex);
    setFullExerciseDetails(null);
    setModalLoading(true);
    
    try {
      const id = ex._id || ex.sourceId;
      const res = await fetch(`${API_URL}/api/exercises/${id}`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFullExerciseDetails(data.exercise);
      }
    } catch (err) {
      console.error("Failed to fetch full exercise details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedExercise(null);
    setFullExerciseDetails(null);
  };

  return (
    <div className="screen active" style={{ display: 'flex' }}>
      <div className="page-head">
        <h2>Exercise Library</h2>
      </div>
      
      <div className="pad" style={{ paddingBottom: '100px', width: '100%' }}>
        
        <div style={{ marginBottom: '16px' }}>
          <TextField 
            value={search} 
            onChange={setSearch} 
            placeholder="Search exercises (e.g. Bench Press)" 
            type="text" 
          />
        </div>

        {/* Filters */}
        <div className="filter-row-container">
          <div className="filter-top-bar">
            <button className="reset-btn" onClick={() => { setActiveFilter('All'); setActiveEquipment('All'); setActiveGoal('All'); }}>
              <i className="ti ti-refresh" /> Reset Filters
            </button>
          </div>
          <div className="filter-dropdowns">
            <FilterDropdown 
              icon="stretching" 
              placeholder="Search muscle..." 
              value={activeFilter} 
              onChange={setActiveFilter} 
              options={MUSCLE_FILTERS} 
            />
            <FilterDropdown 
              icon="barbell" 
              placeholder="Search equipment..." 
              value={activeEquipment} 
              onChange={setActiveEquipment} 
              options={EQUIPMENT_FILTERS} 
            />
            <FilterDropdown 
              icon="target" 
              placeholder="Search goal..." 
              value={activeGoal} 
              onChange={setActiveGoal} 
              options={GOAL_FILTERS} 
            />
          </div>
        </div>

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

        {!loading && !error && exercises.length === 0 && (
          <div className="empty-state">
            <i className="ti ti-search" style={{ fontSize: 40, color: 'var(--c-text-muted)', marginBottom: 12 }}></i>
            <div>No exercises found</div>
          </div>
        )}

        {!loading && !error && exercises.length > 0 && (
          <>
            <div className="lib-grid">
              {exercises.map((ex, idx) => (
                <div key={`${ex._id || ex.sourceId}-${idx}`} className="lib-card" onClick={() => handleCardClick(ex)}>
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
            
            {/* Pagination: Load More */}
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={loadingMore}
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {selectedExercise && (
        <div className="exercise-modal-overlay" onClick={closeModal}>
          <div className="exercise-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-gif-wrap">
              <button className="modal-back-btn" onClick={closeModal}>
                <i className="ti ti-arrow-left"></i> Back
              </button>
              <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="modal-gif" loading="lazy" />
            </div>
            <div className="modal-info" style={{ overflowY: 'auto', maxHeight: '50vh' }}>
              <h2 className="modal-title">{selectedExercise.name}</h2>
              
              <div className="modal-tags" style={{ marginBottom: '16px' }}>
                <span className="modal-badge muscle">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z"/></svg>
                  {selectedExercise.uiMuscle}
                </span>
                <span className="modal-badge eq">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4v16M18 4v16M2 8h4M2 16h4M18 8h4M18 16h4M6 12h12"/></svg>
                  {selectedExercise.equipment}
                </span>
              </div>

              {modalLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <div className="spinner"></div>
                </div>
              )}

              {!modalLoading && fullExerciseDetails && (
                <div className="modal-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {fullExerciseDetails.whyLabel && (
                    <p className="modal-why" style={{ margin: 0 }}><strong>Why do it?</strong> {fullExerciseDetails.whyLabel}</p>
                  )}
                  
                  {fullExerciseDetails.targetMuscle && (
                    <div>
                      <strong style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)' }}>Target Muscle</strong>
                      <p style={{ margin: '4px 0 0 0', textTransform: 'capitalize' }}>{fullExerciseDetails.targetMuscle}</p>
                    </div>
                  )}

                  {fullExerciseDetails.secondaryMuscles && fullExerciseDetails.secondaryMuscles.length > 0 && (
                    <div>
                      <strong style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)' }}>Secondary Muscles</strong>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {fullExerciseDetails.secondaryMuscles.map(m => (
                          <span key={m} style={{ background: '#f0f0f0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', textTransform: 'capitalize' }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {fullExerciseDetails.instructionsEn && (
                    <div>
                      <strong style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)' }}>Instructions</strong>
                      <p style={{ fontSize: '14px', lineHeight: 1.5, margin: '6px 0 0 0', color: 'var(--navy)' }}>
                        {fullExerciseDetails.instructionsEn}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
