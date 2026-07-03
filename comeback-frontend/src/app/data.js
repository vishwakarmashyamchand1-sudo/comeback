// Mock data for the main app — stands in for the API / coach model output.

export const todayWorkout = {
  type: 'Push day',
  title: 'Push day — Chest & Shoulders',
  week: 1, day: 2, dow: 'Tuesday',
  durationMin: 45,
  exercises: [
    { id: 'bench',   name: 'Barbell bench press',    muscle: 'Chest',     sets: 3, reps: 12, weight: 12, why: 'Builds chest thickness and strength' },
    { id: 'incline', name: 'Incline dumbbell press', muscle: 'Chest',     sets: 3, reps: 10, weight: 14, why: 'Targets upper chest fibres' },
    { id: 'ohp',     name: 'Overhead shoulder press',muscle: 'Shoulders', sets: 3, reps: 12, weight: 10, why: 'Rebuilds overhead pressing strength' },
    { id: 'lat',     name: 'Lateral raises',         muscle: 'Shoulders', sets: 3, reps: 15, weight: 6,  why: 'Widens the shoulder cap' },
    { id: 'tri',     name: 'Triceps rope pushdown',  muscle: 'Triceps',   sets: 3, reps: 15, weight: 20, why: 'Finishes arms with volume' },
  ],
};

export const tomorrow = {
  type: 'Pull day', dow: 'Wed',
  exercises: [
    { name: 'Deadlift', scheme: '3 × 8' },
    { name: 'Lat pulldown', scheme: '3 × 12' },
    { name: 'Barbell row', scheme: '3 × 10' },
  ],
  note: 'Lighter start than last pull day',
};

export const nutrition = {
  kcal: 1640, kcalTarget: 2000,
  protein: 94, proteinTarget: 130,
  carbs: 180, carbsTarget: 250,
  fat: 52, fatTarget: 65,
  water: 6, waterTarget: 8,
  meals: [
    { id: 'b', type: 'Breakfast', items: 'Poha, 2 eggs, chai', kcal: 420, protein: 28 },
    { id: 'l', type: 'Lunch', items: 'Dal, 2 roti, paneer sabzi, curd', kcal: 720, protein: 42 },
  ],
  tip: '2 eggs at dinner will get you to 118g protein today.',
};

export const detectedMeal = {
  items: [
    { name: 'Paneer bhurji', qty: '150g', kcal: 240, protein: 18, conf: 'high' },
    { name: 'Tandoori roti', qty: '2 pcs', kcal: 160, protein: 6, conf: 'medium' },
    { name: 'Green salad', qty: '80g', kcal: 20, protein: 1, conf: 'low' },
  ],
  tip: "Good protein meal. You're 36g short for the day.",
};

export const circle = [
  { id: 'you', name: 'You', place: 'Bengaluru', initials: 'P', self: true, status: 'went',
    session: 'Push day', score: '8/10', lift: 'Bench 60', fist: 3, comment: 1 },
  { id: 'rohit', name: 'Rohit', place: 'Pune', initials: 'RK', status: 'went',
    detail: 'Pull day · 9/10 · Deadlift 120kg', fist: 5, comment: 2 },
  { id: 'anita', name: 'Anita', place: 'Mumbai', initials: 'AS', status: 'rest' },
  { id: 'vikram', name: 'Vikram', place: 'Delhi', initials: 'V', status: 'no' },
];

export const patterns = [
  { title: 'You skip legs when tired', badge: '3 of 4 wks', text: 'Leg day gets dropped after a poor sleep night. Try moving it to Saturday mornings.' },
  { title: 'Protein dips on weekends', badge: '−22g avg', text: 'Sat & Sun average 72g. Keep a paneer or egg option ready for eating out.' },
];

export const milestones = [
  { emoji: '🏆', label: 'First week done', earned: true },
  { emoji: '⚖️', label: 'First kg lost', earned: true },
  { emoji: '🔥', label: '30-day streak', earned: false },
];

export const quickPrompts = [
  "How's my protein this week?",
  'Modify tomorrow\u2019s plan',
  'What should I eat for dinner?',
  'Why am I low on energy?',
  'Adjust for my sore shoulder',
];

export const browserExercises = [
  { name: 'Bench press', equip: 'Barbell', muscle: 'Chest' },
  { name: 'Incline press', equip: 'Dumbbell', muscle: 'Chest' },
  { name: 'Lat pulldown', equip: 'Cable', muscle: 'Back' },
  { name: 'Push-up', equip: 'Bodyweight', muscle: 'Chest' },
  { name: 'Barbell row', equip: 'Barbell', muscle: 'Back' },
  { name: 'Goblet squat', equip: 'Dumbbell', muscle: 'Legs' },
  { name: 'Overhead press', equip: 'Barbell', muscle: 'Shoulders' },
  { name: 'Romanian deadlift', equip: 'Barbell', muscle: 'Legs' },
];

export const muscleFilters = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core'];
