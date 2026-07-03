import React, { useState } from 'react';
import { StatusBar, TabBar } from './components.jsx';
import { Dashboard, WorkoutPlan, ActiveWorkout, PostSession } from './screens/workout.jsx';
import { Diet, FoodPhoto } from './screens/diet.jsx';
import { Coach, Progress, Circle } from './screens/social.jsx';
import { ExerciseBrowser } from './screens/ExerciseBrowser.jsx';

// The post-onboarding app: 4-tab bottom nav + a stack of pushed full screens.
export default function AppShell() {
  const [tab, setTab] = useState('workout');
  const [stack, setStack] = useState([]);      // pushed screens: 'plan' | 'active' | 'post' | 'food' | 'circle' | 'browser'
  const [workoutDone, setWorkoutDone] = useState(false);

  const push = s => setStack(st => [...st, s]);
  const pop = () => setStack(st => st.slice(0, -1));
  const reset = () => setStack([]);
  const top = stack[stack.length - 1];

  // dark chrome for photo-loading + generating-style screens
  const dark = top === 'food';

  let overlay = null;
  if (top === 'plan') overlay = <WorkoutPlan onBack={pop} onStart={() => setStack(['active'])} onAddExercise={() => push('browser')} />;
  if (top === 'active') overlay = <ActiveWorkout onBack={pop} onFinish={() => setStack(['post'])} onSwap={() => push('browser')} />;
  if (top === 'post') overlay = <PostSession onDone={() => { setWorkoutDone(true); reset(); }} onModify={() => { setWorkoutDone(true); reset(); }} />;
  if (top === 'food') overlay = <FoodPhoto onBack={pop} onConfirm={pop} />;
  if (top === 'circle') overlay = <Circle onBack={pop} />;
  if (top === 'browser') overlay = <ExerciseBrowser onClose={pop} />;

  let tabScreen;
  if (tab === 'workout') tabScreen = <Dashboard done={workoutDone} onStart={() => push('plan')} onViewSummary={() => setStack(['post'])} onOpenCircle={() => push('circle')} goDiet={() => setTab('diet')} />;
  if (tab === 'diet') tabScreen = <Diet onLogMeal={() => push('food')} />;
  if (tab === 'coach') tabScreen = <Coach />;
  if (tab === 'progress') tabScreen = <Progress />;

  return (
    <div className="app-shell" style={dark ? { background: '#1A1A2E' } : undefined}>
      <StatusBar light={dark} />
      {overlay || tabScreen}
      {!overlay && <TabBar active={tab} onChange={setTab} />}
    </div>
  );
}
