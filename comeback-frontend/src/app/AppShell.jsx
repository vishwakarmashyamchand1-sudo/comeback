import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, TabBar } from './components.jsx';
import { App as CapApp } from '@capacitor/app';
import { Dashboard, WorkoutPlan, ActiveWorkout, PostSession } from './screens/workout.jsx';
import { Diet, FoodPhoto } from './screens/diet.jsx';
import { Coach, Progress, Circle } from './screens/social.jsx';
import { ExerciseBrowser } from './screens/ExerciseBrowser.jsx';
import { Profile } from './screens/Profile.jsx';
import { useOnboarding } from '../lib/store.jsx';
import { todayWorkout } from './data.js';

export default function AppShell() {
  const { state } = useOnboarding();
  const [tab, setTab] = useState('workout');
  const [stack, setStack] = useState([]);
  const stateRef = useRef({ tab, stack });
  
  useEffect(() => {
    stateRef.current = { tab, stack };
  }, [tab, stack]);

  const [workoutDone, setWorkoutDone] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [weeklyPlanSplit, setWeeklyPlanSplit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [refreshDiet, setRefreshDiet] = useState(0);


  const handleTabChange = newTab => {
    if (tab === newTab) return;
    window.history.pushState({ tab: newTab, stack }, '', '#' + newTab);
    setTab(newTab);
  };

  const push = s => {
    const newStack = [...stack, s];
    window.history.pushState({ tab, stack: newStack }, '', '#' + s);
    setStack(newStack);
  };
  const pop = () => {
    setStack(prevStack => {
      if (prevStack.length > 0) {
        const newStack = prevStack.slice(0, -1);
        const currentTab = stateRef.current ? stateRef.current.tab : tab;
        const prevPage = newStack.length > 0 ? newStack[newStack.length - 1] : currentTab;
        window.history.replaceState({ tab: currentTab, stack: newStack }, '', '#' + prevPage);
        return newStack;
      }
      return prevStack;
    });
  };
  const reset = () => {
    window.history.pushState({ tab, stack: [] }, '', '#' + tab);
    setStack([]);
  };
  const replace = s => {
    window.history.replaceState({ tab, stack: [s] }, '', '#' + s);
    setStack([s]);
  };
  const top = stack[stack.length - 1];

  const [browserMuscle, setBrowserMuscle] = useState('All');

  const fetchWorkoutByOffset = (offset = 0, silent = false) => {
    if (!silent) setLoading(true);
    const endpoint = offset === 0 ? '/api/workouts/today' : `/api/workouts/by-offset/${offset}`;
    
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.weeklyPlanSplit) setWeeklyPlanSplit(data.weeklyPlanSplit);

        if (data.workout) {
          const mappedWorkout = {
            ...data.workout,
            type: data.workout.sessionType || 'Full Body',
            exercises: (data.workout.exercises || []).map((e, i) => {
              const numSets = Array.isArray(e.sets) ? e.sets.length : (e.sets || 3);
              const firstSet = Array.isArray(e.sets) && e.sets.length > 0 ? e.sets[0] : {};
              
              return {
                id: e._id || (e.exerciseId?._id ? `${e.exerciseId._id}-${Math.random()}` : Math.random().toString()),
                originalIndex: i,
                exerciseDbId: e.exerciseId?._id,
                name: e.exerciseId?.name || e.exerciseName || 'Unknown Exercise',
                muscleGroup: e.exerciseId?.muscleGroup || e.muscleGroup || '',
                targetMuscle: e.exerciseId?.targetMuscle || '',
                gifUrl: e.exerciseId?.gifUrl || '',
                equipment: e.exerciseId?.equipment || '',
                whyLabel: e.exerciseId?.whyLabel || e.benefits || '',
                wasSubstituted: e.wasSubstituted || false,
                substitutedFrom: e.substitutedFrom || '',
                wasSkipped: e.wasSkipped || false,
                addedByUser: e.addedByUser || false,
                sets: numSets,
                reps: e.reps || firstSet.plannedReps || '10-12',
                weight: e.weight || firstSet.plannedWeight || '',
                actualSetsArray: e.sets // Keep the full sets array from the backend
              };
            })
          };
          setWorkout(mappedWorkout);
        } else {
          setWorkout(todayWorkout);
        }
        if (!silent) setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch workout for offset", offset, ":", err);
        setWorkout(todayWorkout);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkoutByOffset(0);
  }, [state.token]);

  useEffect(() => {
    window.history.replaceState({ tab: 'workout', stack: [] }, '', '#workout');

    const handlePopState = (e) => {
      if (e.state) {
        if (e.state.tab) setTab(e.state.tab);
        if (e.state.stack) setStack(e.state.stack);
      } else {
        setStack([]);
      }
    };
    window.addEventListener('popstate', handlePopState);

    const handleManualHardwarePop = () => {
      setStack(prevStack => {
        if (prevStack.length > 0) {
          const newStack = prevStack.slice(0, -1);
          const currentTab = stateRef.current.tab;
          const prevPage = newStack.length > 0 ? newStack[newStack.length - 1] : currentTab;
          window.history.replaceState({ tab: currentTab, stack: newStack }, '', '#' + prevPage);
          return newStack;
        }
        return prevStack;
      });
    };
    window.addEventListener('manualHardwarePop', handleManualHardwarePop);

    let isMounted = true;
    let capListenerHandle = null;

    CapApp.addListener('backButton', () => {
      const { stack } = stateRef.current;
      if (stack.length === 0) {
        CapApp.exitApp();
      } else {
        window.dispatchEvent(new CustomEvent('manualHardwarePop'));
      }
    }).then(handle => {
      if (!isMounted) {
        handle.remove();
      } else {
        capListenerHandle = handle;
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('manualHardwarePop', handleManualHardwarePop);
      if (capListenerHandle) capListenerHandle.remove();
    };
  }, []);

  const dark = top === 'food';

  if (loading) {
    return <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  const handleAddExercise = async (exercise) => {
    if (!workout || !workout._id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${workout._id}/add-exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
        body: JSON.stringify({
          exerciseId: exercise._id,
          sets: [
            { setNumber: 1, plannedReps: 12, plannedWeight: 10 },
            { setNumber: 2, plannedReps: 12, plannedWeight: 10 },
            { setNumber: 3, plannedReps: 12, plannedWeight: 10 }
          ]
        })
      });
      if (res.ok) {
        fetchWorkoutByOffset(0);
      }
    } catch (err) {
      console.error("Failed to add exercise", err);
    }
  };

  let overlay = null;
  if (top === 'plan') overlay = <WorkoutPlan workout={workout} weeklyPlanSplit={weeklyPlanSplit} onBack={pop} onStart={() => push('active')} onFinish={() => replace('post')} onAddExercise={() => { setBrowserMuscle('All'); push('browser'); }} refreshWorkout={() => fetchWorkoutByOffset(0)} />;
  if (top === 'modify_plan') overlay = <WorkoutPlan 
    workout={workout} 
    weeklyPlanSplit={weeklyPlanSplit} 
    onBack={() => { fetchWorkoutByOffset(0); pop(); }} 
    onStart={() => {}} 
    onAddExercise={() => { setBrowserMuscle('All'); push('browser'); }} 
    refreshWorkout={() => fetchWorkoutByOffset(1)} 
    isModifyMode={true} 
  />;
  if (top === 'active') overlay = <ActiveWorkout workout={workout} onBack={() => { fetchWorkoutByOffset(0, true); pop(); }} onFinish={() => replace('post')} onSwap={(muscle) => { setBrowserMuscle(muscle || 'All'); push('browser'); }} />;
  if (top === 'post') overlay = <PostSession 
    workout={workout} 
    isCompleted={workoutDone || workout?.status === 'completed'}
    onDone={() => { setWorkoutDone(true); reset(); fetchWorkoutByOffset(0); }} 
    onModify={() => { 
      setWorkoutDone(true); 
      reset(); 
      fetchWorkoutByOffset(1); // Jump to tomorrow's workout
      push('modify_plan'); 
    }} 
  />;
  if (top === 'food') overlay = <FoodPhoto photo={capturedPhoto} onBack={() => { setCapturedPhoto(null); pop(); }} onConfirm={() => { setCapturedPhoto(null); pop(); setRefreshDiet(k => k + 1); }} />;
  if (top === 'circle') overlay = <Circle onBack={pop} />;
  if (top === 'browser') overlay = <ExerciseBrowser onClose={pop} initialFilter={browserMuscle} onAdd={handleAddExercise} />;
  if (top === 'profile') overlay = <Profile onBack={pop} />;

  let tabScreen;
  if (tab === 'workout') tabScreen = <Dashboard workout={workout} weeklyPlanSplit={weeklyPlanSplit} done={workoutDone} onStart={() => push('plan')} onViewSummary={() => replace('post')} onOpenCircle={() => push('circle')} goDiet={() => handleTabChange('diet')} onOpenProfile={() => push('profile')} onChangeDay={() => push('plan')} onFocusChange={fetchWorkoutByOffset} />;
  if (tab === 'diet') tabScreen = <Diet key={refreshDiet} onLogMeal={(photoData) => { setCapturedPhoto(photoData); push('food'); }} />;
  if (tab === 'coach') tabScreen = <Coach />;
  if (tab === 'progress') tabScreen = <Progress />;

  return (
    <div className="app-shell" style={dark ? { background: '#1A1A2E' } : undefined}>
      {overlay || tabScreen}
      {!overlay && <TabBar active={tab} onChange={handleTabChange} />}
    </div>
  );
}
