const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');

/**
 * @desc    1. Create today's workout
 * @route   POST /api/workouts
 * @access  Private
 */
const createWorkout = asyncHandler(async (req, res) => {
  const { date, weekNumber, dayOfWeek, sessionType, exercises, planSource } = req.body;

  // Normalize date to 00:00:00 to strictly enforce one workout per day
  const workoutDate = new Date(date);
  workoutDate.setUTCHours(0, 0, 0, 0);

  // 1. One workout document per user per day rule
  const existingWorkout = await Workout.findOne({ 
    userId: req.user._id, 
    date: workoutDate 
  });

  if (existingWorkout) {
    res.status(400);
    throw new Error('A workout already exists for this date.');
  }

  const workout = await Workout.create({
    userId: req.user._id,
    date: workoutDate,
    weekNumber,
    dayOfWeek,
    sessionType,
    exercises: exercises || [],
    status: 'planned',
    planSource: planSource || 'user_modified'
  });

  res.status(201).json({
    success: true,
    data: workout
  });
});

/**
 * @desc    2. Get today's workout
 * @route   GET /api/workouts/today
 * @access  Private
 */
const getTodayWorkout = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const workout = await Workout.findOne({
    userId: req.user._id,
    date: today
  }).populate('exercises.exerciseId', 'name equipment targetMuscle gifUrl');

  if (!workout) {
    res.status(404);
    throw new Error('No workout found for today');
  }

  res.status(200).json({
    success: true,
    data: workout
  });
});

/**
 * @desc    3. Get workout history with pagination
 * @route   GET /api/workouts/history
 * @access  Private
 */
const getWorkoutHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // History usually implies completed or skipped workouts
  const filter = { 
    userId: req.user._id, 
    status: { $in: ['completed', 'skipped'] } 
  };

  const workouts = await Workout.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Workout.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      workouts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    9. Get workout progress stats
 * @route   GET /api/workouts/progress
 * @access  Private
 */
const getWorkoutProgress = asyncHandler(async (req, res) => {
  // Aggregate basic stats: total, completed
  const totalWorkouts = await Workout.countDocuments({ userId: req.user._id });
  const completedWorkouts = await Workout.countDocuments({ userId: req.user._id, status: 'completed' });
  
  const completionRate = totalWorkouts > 0 ? ((completedWorkouts / totalWorkouts) * 100).toFixed(2) : 0;

  // Recent performance (last 5 completed)
  const recent = await Workout.find({ userId: req.user._id, status: 'completed' })
    .sort({ date: -1 })
    .limit(5)
    .select('sessionRating sessionFeel sessionDurationMins date');

  // Simple streak calculation: count consecutive completed workouts going backwards from today/yesterday
  let streak = 0;
  const allCompleted = await Workout.find({ userId: req.user._id, status: 'completed' })
    .sort({ date: -1 })
    .select('date');

  if (allCompleted.length > 0) {
    let currentDate = new Date();
    currentDate.setUTCHours(0,0,0,0);
    
    // Allow the streak to be valid if the last workout was today or yesterday
    let expectedDate = new Date(allCompleted[0].date);
    expectedDate.setUTCHours(0,0,0,0);
    
    const diffTime = Math.abs(currentDate - expectedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak = 1;
      for (let i = 1; i < allCompleted.length; i++) {
        const prevDate = new Date(allCompleted[i].date);
        prevDate.setUTCHours(0,0,0,0);
        
        expectedDate.setDate(expectedDate.getDate() - 1);
        
        if (prevDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      totalWorkouts,
      completionRate: `${completionRate}%`,
      streak,
      recentPerformance: recent
    }
  });
});

/**
 * @desc    4. Get single workout details
 * @route   GET /api/workouts/:id
 * @access  Private
 */
const getWorkoutById = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({ 
    _id: req.params.id, 
    userId: req.user._id 
  }).populate('exercises.exerciseId', 'name equipment targetMuscle gifUrl');

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  res.status(200).json({
    success: true,
    data: workout
  });
});

/**
 * @desc    5. Log actualReps and actualWeight for a specific set
 * @route   PATCH /api/workouts/:id/log-set
 * @access  Private
 */
const logSet = asyncHandler(async (req, res) => {
  const { exerciseId, setNumber, actualReps, actualWeight } = req.body;

  if (!exerciseId || setNumber === undefined || actualReps === undefined || actualWeight === undefined) {
    res.status(400);
    throw new Error('Please provide exerciseId, setNumber, actualReps, and actualWeight');
  }

  const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  // Find the exercise in the workout
  const exerciseIndex = workout.exercises.findIndex(e => e.exerciseId.toString() === exerciseId);
  if (exerciseIndex === -1) {
    res.status(404);
    throw new Error('Exercise not found in this workout');
  }

  // Find the set
  const setIndex = workout.exercises[exerciseIndex].sets.findIndex(s => s.setNumber === setNumber);
  if (setIndex === -1) {
    res.status(404);
    throw new Error('Set number not found');
  }

  // Update actuals and mark completed
  workout.exercises[exerciseIndex].sets[setIndex].actualReps = actualReps;
  workout.exercises[exerciseIndex].sets[setIndex].actualWeight = actualWeight;
  workout.exercises[exerciseIndex].sets[setIndex].completed = true;

  // Change workout status to in_progress if it was planned
  if (workout.status === 'planned') {
    workout.status = 'in_progress';
  }

  await workout.save();

  res.status(200).json({
    success: true,
    data: workout.exercises[exerciseIndex].sets[setIndex]
  });
});

/**
 * @desc    6. Add a user-selected exercise to the workout
 * @route   PATCH /api/workouts/:id/add-exercise
 * @access  Private
 */
const addExercise = asyncHandler(async (req, res) => {
  const { exerciseId, sets } = req.body; // sets is an array of planned sets

  if (!exerciseId || !sets || !Array.isArray(sets)) {
    res.status(400);
    throw new Error('Please provide exerciseId and an array of sets');
  }

  const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  // 3. exerciseName should be denormalized
  const exerciseDetails = await Exercise.findById(exerciseId);
  if (!exerciseDetails) {
    res.status(404);
    throw new Error('Exercise not found in database');
  }

  // 4. addedByUser flag must be supported
  const newWorkoutExercise = {
    exerciseId: exerciseDetails._id,
    exerciseName: exerciseDetails.name,
    muscleGroup: exerciseDetails.muscleGroup,
    sets: sets.map((s, index) => ({
      setNumber: s.setNumber || (index + 1),
      plannedReps: s.plannedReps,
      plannedWeight: s.plannedWeight
    })),
    addedByUser: true,
    orderIndex: workout.exercises.length + 1
  };

  workout.exercises.push(newWorkoutExercise);
  workout.planSource = 'user_modified';

  await workout.save();

  res.status(200).json({
    success: true,
    data: newWorkoutExercise
  });
});

/**
 * @desc    7. Skip an exercise (Call 05)
 * @route   PATCH /api/workouts/:id/skip-exercise
 * @access  Private
 */
const skipExercise = asyncHandler(async (req, res) => {
  const { exerciseId, skipReason } = req.body;

  if (!exerciseId) {
    res.status(400);
    throw new Error('Please provide exerciseId');
  }

  const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  const exerciseIndex = workout.exercises.findIndex(e => e.exerciseId.toString() === exerciseId);
  if (exerciseIndex === -1) {
    res.status(404);
    throw new Error('Exercise not found in this workout');
  }

  workout.exercises[exerciseIndex].wasSkipped = true;
  if (skipReason) {
    workout.exercises[exerciseIndex].skipReason = skipReason;
  }

  workout.planSource = 'user_modified';
  await workout.save();

  res.status(200).json({
    success: true,
    data: { message: 'Exercise marked as skipped successfully' }
  });
});

/**
 * @desc    Swap muscle group for tomorrow's plan (Call 04 placeholder)
 * @route   POST /api/workouts/tomorrow/swap-muscle
 * @access  Private
 */
const swapMuscle = asyncHandler(async (req, res) => {
  const { targetMuscle, replacementMuscle } = req.body;

  res.status(200).json({
    success: true,
    message: `Swapped ${targetMuscle} for ${replacementMuscle} in tomorrow's plan (Placeholder)`
  });
});

/**
 * @desc    Confirm tomorrow's plan
 * @route   PATCH /api/workouts/:id/confirm
 * @access  Private
 */
const confirmPlan = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Plan confirmed successfully (Placeholder)'
  });
});

/**
 * @desc    8. Mark workout complete
 * @route   POST /api/workouts/:id/complete
 * @access  Private
 */
const completeWorkout = asyncHandler(async (req, res) => {
  const { sessionRating, sessionFeel, sessionDurationMins } = req.body;

  const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  if (workout.status === 'completed') {
    res.status(400);
    throw new Error('Workout is already completed');
  }

  workout.status = 'completed';
  if (sessionRating) workout.sessionRating = sessionRating;
  if (sessionFeel) workout.sessionFeel = sessionFeel;
  if (sessionDurationMins) workout.sessionDurationMins = sessionDurationMins;

  // The schema doesn't have an explicit 'completedAt' field, but 'updatedAt' is handled by timestamps.
  // We can add logic to compute duration if needed.
  
  await workout.save();

  res.status(200).json({
    success: true,
    data: {
      status: workout.status,
      sessionRating: workout.sessionRating,
      sessionFeel: workout.sessionFeel,
      sessionDurationMins: workout.sessionDurationMins
    }
  });
});

module.exports = {
  createWorkout,
  getTodayWorkout,
  getWorkoutHistory,
  getWorkoutProgress,
  getWorkoutById,
  logSet,
  addExercise,
  skipExercise,
  swapMuscle,
  confirmPlan,
  completeWorkout
};
