import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Thumb } from '../components.jsx';
import { muscleFilters } from '../data.js'; // Keep the filter chips array
import { API_URL } from '../../lib/api.js';
import { useOnboarding } from '../../lib/store.jsx';

export function ExerciseBrowser({ onClose, onAdd, initialFilter = 'All' }) {
  const { state } = useOnboarding();
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailHistory, setDetailHistory] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Backend State
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const openDetail = async (e) => {
    setDetailLoading(true);
    setDetail(e); // Show basic info immediately while fetching full
    try {
      const res = await fetch(`${API_URL}/api/exercises/${e._id}`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDetail(data.exercise);
        setDetailHistory(data.userHistory);
      }
    } catch (err) {
      console.error("Failed to fetch full exercise details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filter or search changes
  useEffect(() => {
    setExercises([]);
    setPage(1);
    setHasMore(true);
  }, [filter, debouncedSearch]);

  // Fetch Logic
  useEffect(() => {
    const fetchExercises = async () => {
      if (!hasMore) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page,
          limit: 20
        });
        
        if (debouncedSearch) {
          queryParams.append('search', debouncedSearch);
        }
        if (filter !== 'All') {
          queryParams.append('muscleGroup', filter);
        }

        const res = await fetch(`${API_URL}/api/exercises?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const results = data.exercises || [];
          setExercises(prev => page === 1 ? results : [...prev, ...results]);
          if (results.length < 20) setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to fetch exercises:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [page, filter, debouncedSearch, state.token, hasMore]);

  // Intersection Observer for Infinite Scroll
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="app-body">
      <div style={{ flex: 'none', padding: '12px 20px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#1A1A2E' }}>Add exercise</span>
          <button className="icon-btn" onClick={onClose} style={{ width: 34, height: 34 }}><i className="ti ti-x" /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid #DDDDD9', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
          <i className="ti ti-search" style={{ fontSize: 17, color: '#8A8A85' }} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or describe — e.g. reduce belly fat" 
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#1A1A2E', background: 'transparent' }} 
          />
        </div>
        <div className="scroll-x" style={{ display: 'flex', gap: 7 }}>
          {muscleFilters.map(f => (
            <span key={f} className={`chip ${filter === f ? 'sel' : ''}`} onClick={() => setFilter(f)}>{f}</span>
          ))}
        </div>
      </div>

      <div className="screen-pad scroll" style={{ paddingTop: 6, minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {exercises.map((e, index) => {
            const isLast = exercises.length === index + 1;
            // Map MongoDB fields to UI variables
            const exerciseName = e.name;
            const equip = e.equipment || 'Bodyweight';
            const muscle = e.muscleGroup || 'Full body';

            return (
              <div 
                key={e._id || e.name} 
                ref={isLast ? lastElementRef : null}
                className="card" 
                style={{ padding: 10, cursor: 'pointer', minWidth: 0, userSelect: 'none', WebkitUserSelect: 'none' }} 
                onClick={(evt) => {
                  if (evt.currentTarget.dataset.longpressed === 'true') return;
                  openDetail(e);
                }}
                onPointerDown={(evt) => {
                  const target = evt.currentTarget;
                  target.dataset.longpressed = 'false';
                  target.dataset.timer = setTimeout(() => {
                    target.dataset.longpressed = 'true';
                    if (onAdd) { onAdd(e); onClose(); }
                  }, 500);
                }}
                onPointerUp={(evt) => clearTimeout(evt.currentTarget.dataset.timer)}
                onPointerCancel={(evt) => clearTimeout(evt.currentTarget.dataset.timer)}
                onPointerLeave={(evt) => clearTimeout(evt.currentTarget.dataset.timer)}
              >
                {e.gifUrl ? (
                  <img src={e.gifUrl} alt={exerciseName} style={{ width: '100%', aspectRatio: '1', height: 'auto', borderRadius: 10, marginBottom: 9, objectFit: 'cover', pointerEvents: 'none' }} />
                ) : (
                  <Thumb style={{ width: '100%', aspectRatio: '1', height: 'auto', borderRadius: 10, marginBottom: 9, fontSize: 22, pointerEvents: 'none' }} />
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none' }}>{exerciseName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, pointerEvents: 'none' }}>
                  <span className="badge neutral" style={{ fontSize: 10, padding: '2px 7px', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>{equip}</span>
                  <span style={{ fontSize: 10, color: '#8A8A85', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{muscle}</span>
                </div>
              </div>
            );
          })}
        </div>
        {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#8A8A85' }}>Loading...</div>}
        {!hasMore && exercises.length > 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#8A8A85' }}>No more exercises.</div>}
        {!loading && exercises.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#8A8A85' }}>No exercises found.</div>}
      </div>

      {detail && (
        <div className="sheet-scrim" onClick={() => setDetail(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-grab" />
            <div className="scroll" style={{ flex: 1, minHeight: 0, padding: '0 20px 16px', overflowY: 'auto' }}>
              <div className="thumb" style={{ height: 200, borderRadius: 16, fontSize: 34, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                {detail.gifUrl ? (
                  <img src={detail.gifUrl} alt={detail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="ti ti-photo" />
                )}
                <span style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 11, color: '#8A8A85', background: '#ffffffcc', padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-player-play" style={{ fontSize: 12 }} /> Demo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: '#1A1A2E', textTransform: 'capitalize' }}>{detail.name}</span>
                <span className="badge neutral" style={{ fontSize: 10, textTransform: 'capitalize' }}>{detail.muscleGroup || 'Full body'}</span>
              </div>
              
              {detail.whyLabel && (
                <div style={{ fontSize: 13, color: '#3A7A0A', marginBottom: 12 }}>{detail.whyLabel}</div>
              )}
              
              <div style={{ fontSize: 13, color: '#1A1A2E', marginBottom: 4, textTransform: 'capitalize' }}>
                <strong>Secondary Muscles:</strong> {detail.secondaryMuscles && detail.secondaryMuscles.length > 0 ? detail.secondaryMuscles.join(', ') : 'None'}
              </div>
              <div style={{ fontSize: 13, color: '#1A1A2E', marginBottom: 16, textTransform: 'capitalize' }}>
                <strong>Target Muscle:</strong> {detail.targetMuscle || 'None'}
              </div>
              
              <div className="s-label" style={{ marginTop: 0 }}>Instructions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                {detail.instructionsEn ? (
                  (detail.instructionsEn.includes('\n')
                    ? detail.instructionsEn.split('\n')
                    : detail.instructionsEn.match(/[^.!?]+[.!?]+/g) || [detail.instructionsEn]
                  )
                  .map(s => s.trim())
                  .filter(s => s)
                  .map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 11, fontSize: 13, color: '#1A1A2E', lineHeight: 1.5 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#1A1A2E', color: '#C8F25C', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{i + 1}</span>{s}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 13, color: '#8A8A85' }}>No instructions available.</div>
                )}
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
