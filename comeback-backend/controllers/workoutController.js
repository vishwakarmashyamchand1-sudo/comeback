const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const { generateTomorrowPlan } = require('../services/planGenerationService');
const { buildUserContext } = require('../services/contextBuilder');

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
  const User = require('../models/User');
  const Workout = require('../models/Workout');

  // Step 26: Get today's date (midnight to midnight)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // --- THE FIX: We have to find the Mongo User FIRST using Firebase UID! ---
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Fetch the last completed session for context display (Requirement in JSON Response)
  const lastWorkout = await Workout.findOne({ 
    userId: user._id, 
    status: 'completed' 
  }).sort({ date: -1 });

  const previousSession = lastWorkout ? {
    date: lastWorkout.date,
    sessionType: lastWorkout.sessionType,
    sessionDurationMins: lastWorkout.sessionDurationMins
  } : null;

  // Step 27: Find the Workout document for this userId + today's date
  // Step 30: Populate exercise details (gifUrl, whyLabel)
  const workout = await Workout.findOne({
    userId: user._id,
    date: today
  }).populate('exercises.exerciseId', 'name equipment targetMuscle gifUrl whyLabel');

  // Robust fallback: if user.weeklyPlanSplit is empty, extract it from the actual workouts for this week
  let activeSplit = user.weeklyPlanSplit || [];
  if (activeSplit.length === 0) {
    const weekWorkouts = await Workout.find({ userId: user._id, weekNumber: user.currentWeekNumber || 1 }).sort({ date: 1 });
    activeSplit = weekWorkouts.map(w => w.sessionType || 'Rest');
  }

  if (workout) {
    // Step 31: Return the workout document with populated data
    return res.status(200).json({
      workout: workout,
      isRestDay: false,
      previousSession: previousSession,
      weeklyPlanSplit: activeSplit
    });
  }

  // Step 28: If no workout found, check if today is a rest day in the weekly split
  const todayIndex = new Date().getDay(); // JavaScript gets day as 0 (Sun) to 6 (Sat)
  
  let isRestDay = false;
  if (user && user.weeklyPlanSplit && user.weeklyPlanSplit.length > 0) {
    const splitForToday = user.weeklyPlanSplit[todayIndex % user.weeklyPlanSplit.length];
    if (splitForToday && splitForToday.toLowerCase() === 'rest') {
      isRestDay = true;
    }
  }

  // Step 29: If rest day, return safely without crashing
  if (isRestDay) {
    return res.status(200).json({
      workout: null,
      isRestDay: true,
      previousSession: previousSession,
      weeklyPlanSplit: activeSplit
    });
  }

// 404 Error: Frontend will show "Contact your coach" prompt
  res.status(404);
  throw new Error('No workout planned for today');
});

/**
 * @desc    Fetch a workout by its date offset from today (0 = today, 1 = tomorrow, etc.)
 * @route   GET /api/workouts/by-offset/:offset
 * @access  Private
 */
const getWorkoutByOffset = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');

  const offset = parseInt(req.params.offset) || 0;

  const targetDate = new Date();
  targetDate.setUTCHours(0, 0, 0, 0);
  targetDate.setDate(targetDate.getDate() + offset);

  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Fetch the last completed session for context display
  const lastWorkout = await Workout.findOne({ 
    userId: user._id, 
    status: 'completed' 
  }).sort({ date: -1 });

  const previousSession = lastWorkout ? {
    date: lastWorkout.date,
    sessionType: lastWorkout.sessionType,
    sessionDurationMins: lastWorkout.sessionDurationMins
  } : null;

  const workout = await Workout.findOne({
    userId: user._id,
    date: targetDate
  }).populate('exercises.exerciseId', 'name equipment targetMuscle gifUrl whyLabel');

  let activeSplit = user.weeklyPlanSplit || [];
  if (activeSplit.length === 0) {
    const weekWorkouts = await Workout.find({ userId: user._id, weekNumber: user.currentWeekNumber || 1 }).sort({ date: 1 });
    activeSplit = weekWorkouts.map(w => w.sessionType || 'Rest');
  }

  if (workout) {
    return res.status(200).json({
      workout: workout,
      isRestDay: false,
      previousSession: previousSession,
      weeklyPlanSplit: activeSplit
    });
  }

  // Check if target date is a rest day based on the split
  const targetIndex = targetDate.getDay(); 
  let isRestDay = false;
  if (user && user.weeklyPlanSplit && user.weeklyPlanSplit.length > 0) {
    const splitForTarget = user.weeklyPlanSplit[targetIndex % user.weeklyPlanSplit.length];
    if (splitForTarget && splitForTarget.toLowerCase() === 'rest') {
      isRestDay = true;
    }
  }

  if (isRestDay) {
    return res.status(200).json({
      workout: null,
      isRestDay: true,
      previousSession: previousSession,
      weeklyPlanSplit: activeSplit
    });
  }

  res.status(404);
  throw new Error('No workout planned for this date');
});

/**
 * @desc    3. Get workout history for calendar view
 * @route   GET /api/workouts/history
 * @access  Private
 */
const getWorkoutHistory = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');
  const Metric = require('../models/Metrics'); // Need metrics to pull the PRs

  // 1. Securely fetch User via Firebase Token
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Step 65 & 66: Query completed workouts and sort descending
  const workouts = await Workout.find({ 
    userId: user._id, 
    status: 'completed' 
  }).sort({ date: -1 });

  // Fetch all metrics to find PRs for Step 67
  const metrics = await Metric.find({ userId: user._id });
  let allPRs = [];
  metrics.forEach(m => {
    if (m.newPRs) allPRs.push(...m.newPRs);
  });

  // Step 67: Map into clean summaries
  const sessions = workouts.map(w => {
    // Find PRs that happened on the same day as this workout
    const workoutPRs = allPRs.filter(pr => {
      if (!pr.achievedAt) return false;
      const prDate = new Date(pr.achievedAt);
      const wDate = new Date(w.date);
      return prDate.toDateString() === wDate.toDateString();
    });

    return {
      date: w.date,
      sessionType: w.sessionType,
      sessionRating: w.sessionRating || null,
      sessionFeel: w.sessionFeel || null,
      exercisesCount: w.exercises.length,
      newPRs: workoutPRs
    };
  });

  // Step 68: Calculate current streak
  const completedDates = workouts.map(w => {
    const d = new Date(w.date);
    d.setHours(0, 0, 0, 0); // Normalize to midnight
    return d.getTime();
  });

  const uniqueDates = [...new Set(completedDates)];
  
  let currentStreak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let checkDate = today;

  // Generous Streak Logic: If they haven't worked out today, but worked out yesterday, start counting from yesterday so they don't lose their streak!
  if (!uniqueDates.includes(today.getTime()) && uniqueDates.includes(yesterday.getTime())) {
    checkDate = yesterday;
  }

  while (uniqueDates.includes(checkDate.getTime())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1); // Go back one day
  }

  // Step 69: Return JSON array
  res.status(200).json({
    sessions: sessions,
    currentStreak: currentStreak
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
 * @desc    5. Log actualReps and actualWeight for a specific set in real time
 * @route   PATCH /api/workouts/:id/log-set
 * @access  Private
 */
const logSet = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');

  // Read the exact fields the Sir requested
  const { exerciseIndex, setIndex, actualReps, actualWeight, completed } = req.body;

  if (exerciseIndex === undefined || setIndex === undefined) {
    res.status(400);
    throw new Error('exerciseIndex and setIndex are required');
  }

  // 1. Securely fetch User using Firebase token
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Step 32: Find the Workout document securely
  const workout = await Workout.findOne({ _id: req.params.id, userId: user._id });
  if (!workout) {
    res.status(404); // Matches Red 404 Error
    throw new Error('Workout not found');
  }

  // Safety Check: Make sure the indexes the frontend sent actually exist!
  if (!workout.exercises[exerciseIndex] || !workout.exercises[exerciseIndex].sets[setIndex]) {
    res.status(400); // Matches Red 400 Error
    throw new Error('Invalid exerciseIndex or setIndex');
  }

  // Step 33 & 34: Update ONLY the fields provided without touching planned values
  const targetSet = workout.exercises[exerciseIndex].sets[setIndex];
  
  if (actualReps !== undefined) targetSet.actualReps = actualReps;
  if (actualWeight !== undefined) targetSet.actualWeight = actualWeight;
  if (completed !== undefined) targetSet.completed = completed;

  // Dynamically update the exercise's isCompleted status
  const allSetsDone = workout.exercises[exerciseIndex].sets.every(s => s.completed);
  workout.exercises[exerciseIndex].isCompleted = allSetsDone;

  // Step 35: If workout status is still "planned", update to "in_progress"
  if (workout.status === 'planned') {
    workout.status = 'in_progress';
  }

  // Save changes to database lightning fast
  await workout.save();

  // Step 36: Return the exact JSON structure requested
  res.status(200).json({
    success: true,
    updatedSet: targetSet
  });
});
/**
 * @desc    6. Add a user-selected exercise to the workout
 * @route   POST /api/workouts/:id/add-exercise
 * @access  Private
 */
const addExercise = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');
  const Exercise = require('../models/Exercise');

  const { exerciseId, sets } = req.body; 

  if (!exerciseId || !sets || !Array.isArray(sets)) {
    res.status(400);
    throw new Error('Please provide exerciseId and an array of sets');
  }

  // 1. Securely find the user via Firebase Token
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 2. Find the specific workout
  const workout = await Workout.findOne({ _id: req.params.id, userId: user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  // Step 41: Fetch the Exercise document from the master library
  const exerciseDetails = await Exercise.findById(exerciseId);
  if (!exerciseDetails) {
    res.status(404); // Matches the Red 404 Error in the Sir's doc
    throw new Error('Exercise not found in master library');
  }

  // Step 42: Duplicate check (Avoid adding the same exercise twice)
  const isDuplicate = workout.exercises.some(e => e.exerciseId.toString() === exerciseId);
  if (isDuplicate) {
    res.status(409); // Matches the Red 409 Error in the Sir's doc
    throw new Error('Exercise already in today\'s workout');
  }

  // Step 43 & 44: Append the new exercise to the workout array
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

  // Populate the exercises before returning so the frontend has the gifUrls
  await workout.populate('exercises.exerciseId', 'name equipment targetMuscle gifUrl whyLabel');

  // Step 45: Return the updated workout
  res.status(200).json({
    workout: workout
  });
});

/**
 * @desc    7. Mark an exercise as skipped
 * @route   PATCH /api/workouts/:id/skip-exercise
 * @access  Private
 */
const skipExercise = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');

  // Read exactly what the Sir requested from the frontend
  const { exerciseIndex, skipReason } = req.body;

  if (exerciseIndex === undefined) {
    res.status(400);
    throw new Error('exerciseIndex is required');
  }

  // Securely find User via Firebase Token
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Step 37: Find the Workout document securely
  const workout = await Workout.findOne({ _id: req.params.id, userId: user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  // Safety Check: Prevent array crashes
  if (!workout.exercises[exerciseIndex]) {
    res.status(400);
    throw new Error('Invalid exerciseIndex');
  }

  // Step 38: Set wasSkipped = true and skipReason if provided
  workout.exercises[exerciseIndex].wasSkipped = true;
  if (skipReason !== undefined) {
    workout.exercises[exerciseIndex].skipReason = skipReason;
  }

  // Step 39: We call .save() without deleting the exercise from the array!
  await workout.save();

  // Step 40: Return updated exercise exactly as requested
  res.status(200).json({
    success: true,
    updatedExercise: workout.exercises[exerciseIndex]
  });
});

/**
 * @desc    Restore a skipped exercise
 * @route   PATCH /api/workouts/:id/restore-exercise
 * @access  Private
 */
const restoreExercise = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');

  const { exerciseIndex } = req.body;
  if (exerciseIndex === undefined) {
    res.status(400);
    throw new Error('exerciseIndex is required');
  }

  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  const workout = await Workout.findOne({ _id: req.params.id, userId: user._id });

  if (workout && workout.exercises[exerciseIndex]) {
    workout.exercises[exerciseIndex].wasSkipped = false;
    workout.exercises[exerciseIndex].skipReason = '';
    await workout.save();
  }

  res.status(200).json({ success: true });
});

/**
 * @desc    Generate an alternative plan for tomorrow based on a new muscle group
 * @route   POST /api/workouts/tomorrow/swap-muscle
 * @access  Private
 */
const swapMuscle = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');
  const Exercise = require('../models/Exercise');
  const { generateSwapMusclePlan } = require('../services/planGenerationService');

  const { muscleGroup, currentPlanId } = req.body;

  if (!muscleGroup || !currentPlanId) {
    res.status(400);
    throw new Error('Please provide muscleGroup and currentPlanId');
  }

  // 1. Fetch User Securely
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 2. Check if the muscle was trained in the last 48 hours to protect the user
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const recentWorkout = await Workout.findOne({
    userId: user._id,
    status: 'completed',
    date: { $gte: twoDaysAgo },
    sessionType: { $regex: new RegExp(muscleGroup, 'i') } // Checks if muscle name is in the sessionType
  });

  let recoveryWarning = null;
  if (recentWorkout) {
    recoveryWarning = `You just trained ${muscleGroup} recently. Are you sure you are fully recovered?`;
  }

  // 3. Call AI to generate swap muscle plan
  try {
    const targetDate = new Date(); 
    targetDate.setDate(targetDate.getDate() + 1); // Tomorrow
    
    const contextPayload = await buildUserContext(user._id, targetDate);
    const aiResponse = await generateSwapMusclePlan(contextPayload, muscleGroup);
    
    // Resolve exercise IDs for the AI generated exercises with exact fallback logic
    const finalExercises = [];
    if (aiResponse.exercises) {
      for (const ex of aiResponse.exercises) {
        let dbEx = await Exercise.findOne({ name: new RegExp(`^${ex.exerciseName}$`, 'i') });
        if (!dbEx) {
          const words = (ex.exerciseName || '').split(' ').filter(w => w.length > 2);
          if (words.length > 0) {
            const regexQuery = words.map(w => ({ name: new RegExp(w, 'i') }));
            dbEx = await Exercise.findOne({ $and: regexQuery });
          }
          if (!dbEx && words.length > 0) {
            dbEx = await Exercise.findOne({ name: new RegExp(words[words.length - 1], 'i') });
          }
        }
        // Fallback to ANY exercise matching the requested muscle group
        if (!dbEx && ex.muscleGroup) {
          dbEx = await Exercise.findOne({ 
            $or: [
              { targetMuscle: new RegExp(`^${ex.muscleGroup}$`, 'i') },
              { muscleGroup: new RegExp(`^${ex.muscleGroup}$`, 'i') }
            ]
          });
        }
        // Last resort fallback so we never drop the exercise
        if (!dbEx) {
          dbEx = await Exercise.findOne();
        }
        
        if (dbEx) {
          finalExercises.push({
            ...ex,
            exerciseName: dbEx.name,
            exerciseId: dbEx._id
          });
        }
      }
    }

    const previewPlan = {
      _id: "PREVIEW_ONLY_NOT_SAVED_YET",
      sessionType: muscleGroup,
      status: "planned",
      planSource: "muscle_swap",
      exercises: finalExercises
    };

    res.status(200).json({
      newPlan: previewPlan,
      recoveryWarning: recoveryWarning
    });
  } catch (error) {
    console.error("Failed to generate swap muscle plan, attempting fallback:", error);
    
    try {
      // Fallback: Check if the user already has a workout for this muscle group scheduled in their 7 day plan
      const fallbackWorkout = await Workout.findOne({
        userId: user._id,
        sessionType: { $regex: new RegExp(`^${muscleGroup}$`, 'i') },
        type: { $ne: 'Rest' },
        exercises: { $exists: true, $not: { $size: 0 } }
      });
      
      if (fallbackWorkout && fallbackWorkout.exercises && fallbackWorkout.exercises.length > 0) {
        const previewPlan = {
          _id: "PREVIEW_ONLY_NOT_SAVED_YET",
          sessionType: muscleGroup,
          status: "planned",
          planSource: "muscle_swap", // this ensures the days get physically swapped on confirm
          exercises: fallbackWorkout.exercises
        };
        
        return res.status(200).json({
          newPlan: previewPlan,
          recoveryWarning: recoveryWarning
        });
      }
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
    }
    
    res.status(500).json({ success: false, message: "AI generation failed and no fallback available" });
  }
});

/**
 * @desc    Confirm and save a modified tomorrow plan
 * @route   PATCH /api/workouts/:id/confirm
 * @access  Private
 */
const confirmPlan = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');

  // Read exactly what the  requested from the frontend
  const { exercises, planSource } = req.body;

  if (!exercises || !planSource) {
    res.status(400);
    throw new Error('Please provide exercises array and planSource');
  }

  // 1. Securely fetch User via Firebase Token
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Step 60: Find tomorrow's Workout document securely
  const workout = await Workout.findOne({ _id: req.params.id, userId: user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  // If a muscle swap occurred, physically swap the days in the user's weekly split
  if (planSource === 'muscle_swap' && exercises.length > 0 && exercises[0].muscleGroup) {
    const targetMuscle = exercises[0].muscleGroup;
    
    // Determine the current offset of the workout being confirmed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workoutDate = new Date(workout.date);
    workoutDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days (offset)
    const diffTime = Math.abs(workoutDate - today);
    const currentOffset = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Find the offset of the target muscle in the user's weekly split
    let swapOffset = -1;
    if (user.weeklyPlanSplit) {
      swapOffset = user.weeklyPlanSplit.findIndex(m => m.toLowerCase() === targetMuscle.toLowerCase());
    }
    
    if (swapOffset !== -1 && currentOffset !== swapOffset && user.weeklyPlanSplit.length > Math.max(currentOffset, swapOffset)) {
      // Swap the elements
      const temp = user.weeklyPlanSplit[currentOffset];
      user.weeklyPlanSplit[currentOffset] = user.weeklyPlanSplit[swapOffset];
      user.weeklyPlanSplit[swapOffset] = temp;
      
      // Update the workout's sessionType to reflect the new muscle group correctly
      workout.sessionType = user.weeklyPlanSplit[currentOffset];
      
      // Mark array as modified so Mongoose saves it
      user.markModified('weeklyPlanSplit');
      
      // Save the modified split
      await user.save();
    }
  } else if (planSource === 'muscle_swap' && exercises.length > 0) {
    // Even if no offset was provided, make sure the sessionType matches the new plan's target muscle
    if (exercises[0].muscleGroup) {
      workout.sessionType = exercises[0].muscleGroup;
    }
  }

  // Step 61: Replace the old exercises array with the new confirmed plan!
  workout.exercises = exercises;
  
  // Step 62: Set planSource to "muscle_swap" or "coach_chat"
  workout.planSource = planSource;
  
  // Step 63: Set status back to "planned"
  workout.status = 'planned';

  // Save the massive override to the database
  await workout.save();

  // Step 64: Return the saved workout exactly as requested
  res.status(200).json({
    workout: workout
  });
});

/**
 * @desc    8. Mark session complete — triggers AI summary + tomorrow's plan
 * @route   POST /api/workouts/:id/complete
 * @access  Private
 */
const completeWorkout = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');
  const Metric = require('../models/Metrics'); // We need the Metric model for Step 52

  const { sessionRating, sessionFeel, sessionDurationMins } = req.body;

  if (!sessionRating || !sessionFeel) {
    res.status(400);
    throw new Error('Please provide sessionRating and sessionFeel');
  }

  // 1. Fetch User securely via Firebase Token
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 2. Step 32: Find the Workout document
  const workout = await Workout.findOne({ _id: req.params.id, userId: user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  const wasAlreadyCompleted = workout.status === 'completed';

  // 3. Step 46: Update the Workout document immediately
  workout.status = 'completed';
  workout.sessionRating = sessionRating;
  workout.sessionFeel = sessionFeel;
  if (sessionDurationMins) {
    workout.sessionDurationMins = sessionDurationMins;
  }
  
  // Important Note: Save completion data to DB immediately so user doesn't wait for Claude
  await workout.save();

  // 4. Step 47: Detect Personal Records
  const newPRs = [];
  
  if (!wasAlreadyCompleted) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all completed workouts from the last 30 days
    const pastWorkouts = await Workout.find({
      userId: user._id,
      status: 'completed',
      date: { $gte: thirtyDaysAgo, $lt: workout.date }
    });

    // Loop through today's exercises
    workout.exercises.forEach(exercise => {
      let maxTodayVolume = 0;
      
      // Calculate best set from today
      exercise.sets.forEach(set => {
        if (set.completed && set.actualWeight && set.actualReps) {
          const volume = set.actualWeight * set.actualReps;
          if (volume > maxTodayVolume) maxTodayVolume = volume;
        }
      });

      if (maxTodayVolume > 0) {
        let maxPastVolume = 0;
        let pastBestString = "0kg x 0 reps";

        // Look through past workouts for this exact exercise
        pastWorkouts.forEach(pastWk => {
          const pastEx = pastWk.exercises.find(e => e.exerciseName === exercise.exerciseName);
          if (pastEx) {
            pastEx.sets.forEach(pastSet => {
              if (pastSet.completed && pastSet.actualWeight && pastSet.actualReps) {
                const pVolume = pastSet.actualWeight * pastSet.actualReps;
                if (pVolume > maxPastVolume) {
                  maxPastVolume = pVolume;
                  pastBestString = `${pastSet.actualWeight}kg x ${pastSet.actualReps} reps`;
                }
              }
            });
          }
        });

        // If today's volume beats the past 30 days maximum, it's a new PR!
        if (maxTodayVolume > maxPastVolume) {
          // Find exactly which set triggered the PR for the string
          const bestSet = exercise.sets.find(s => s.completed && (s.actualWeight * s.actualReps) === maxTodayVolume);
          
          newPRs.push({
            exerciseName: exercise.exerciseName,
            previousBest: maxPastVolume === 0 ? "First time logging!" : pastBestString,
            newBest: `${bestSet.actualWeight}kg x ${bestSet.actualReps} reps`,
            achievedAt: new Date()
          });
        }
      }
    });

    // 5. Step 52: Update Metric document for this week
    let metric = await Metric.findOne({ userId: user._id, weekNumber: user.currentWeekNumber });
    
    if (!metric) {
      // If no metric document exists for this week yet, create one
      metric = new Metric({
        userId: user._id,
        weekNumber: user.currentWeekNumber || 1,
        sessionsCompleted: 1,
        newPRs: newPRs
      });
    } else {
      // If it exists, increment and append
      metric.sessionsCompleted += 1;
      if (newPRs.length > 0) {
        metric.newPRs.push(...newPRs);
      }
    }
    await metric.save();

    // Update PR count on the workout document itself
    workout.prCount = newPRs.length;
  }

  // 6. Steps 48, 49, 50, 51: Call Antigravity API
  try {
    const targetDate = new Date(); // today
    const contextPayload = await buildUserContext(user._id, targetDate);
    const aiResponse = await generateTomorrowPlan(contextPayload);
    
    // Save summary to today's workout
    workout.aiSummary = aiResponse.summary;
    await workout.save();

    // Create tomorrow's plan
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setUTCHours(0, 0, 0, 0);

    // Resolve exercise IDs for the AI generated exercises
    const finalExercises = [];
    if (aiResponse.tomorrow.exercises) {
      for (const ex of aiResponse.tomorrow.exercises) {
        let dbEx = await Exercise.findOne({ name: new RegExp(`^${ex.exerciseName}$`, 'i') });
        if (!dbEx) {
          const words = (ex.exerciseName || '').split(' ').filter(w => w.length > 2);
          if (words.length > 0) {
            const regexQuery = words.map(w => ({ name: new RegExp(w, 'i') }));
            dbEx = await Exercise.findOne({ $and: regexQuery });
          }
          if (!dbEx && words.length > 0) {
            dbEx = await Exercise.findOne({ name: new RegExp(words[words.length - 1], 'i') });
          }
        }
        // Fallback to ANY exercise matching the requested muscle group
        if (!dbEx && ex.muscleGroup) {
          dbEx = await Exercise.findOne({ 
            $or: [
              { targetMuscle: new RegExp(`^${ex.muscleGroup}$`, 'i') },
              { muscleGroup: new RegExp(`^${ex.muscleGroup}$`, 'i') }
            ]
          });
        }
        // Last resort fallback so we never drop the exercise
        if (!dbEx) {
          dbEx = await Exercise.findOne();
        }
        
        if (dbEx) {
          finalExercises.push({
            ...ex,
            exerciseName: dbEx.name,
            exerciseId: dbEx._id
          });
        }
      }
    }

    // Instead of saving directly, we send this as a preview.
    // The user must click "Looks good" to confirm and save this.
    const tomorrowPlanPreview = {
      date: tomorrowDate,
      weekNumber: workout.weekNumber,
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tomorrowDate.getDay()],
      sessionType: aiResponse.tomorrow.sessionType,
      status: aiResponse.tomorrow.isRestDay ? 'rest_day' : 'planned',
      exercises: finalExercises,
      planSource: 'ai_generated'
    };

    res.status(200).json({
      success: true,
      message: "Workout completed and next plan generated as preview",
      workout: workout,
      aiSummary: aiResponse.summary,
      tomorrowPlan: tomorrowPlanPreview,
      newPRs: newPRs
    });

  } catch (error) {
    console.error("Failed to generate tomorrow plan:", error);
    
    // Fetch the existing tomorrow plan if we have one
    const tomorrowDate = new Date();
    tomorrowDate.setUTCHours(0, 0, 0, 0);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const existingTomorrowPlan = await Workout.findOne({ userId: user._id, date: tomorrowDate });

    res.status(200).json({
      success: true,
      message: "Summary unavailable",
      workout: workout,
      aiSummary: null,
      tomorrowPlan: existingTomorrowPlan || null,
      newPRs: newPRs
    });
  }
});

/**
 * @desc    Substitute an exercise in a workout
 * @route   PATCH /api/workouts/:id/substitute-exercise
 * @access  Private
 */
const substituteExercise = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const workout = await Workout.findOne({ _id: req.params.id, userId: user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  const { exerciseIndex, newExerciseId } = req.body;

  // Validate exerciseIndex
  if (exerciseIndex === undefined || exerciseIndex < 0 || exerciseIndex >= workout.exercises.length) {
    res.status(404);
    throw new Error('Exercise not found in workout');
  }

  // Fetch the new exercise details
  const newExercise = await Exercise.findById(newExerciseId);
  if (!newExercise) {
    res.status(404);
    throw new Error('Substitute exercise not found in library');
  }

  // Update the workout's exercise entry
  const oldName = workout.exercises[exerciseIndex].exerciseName;
  workout.exercises[exerciseIndex].exerciseId = newExercise._id;
  workout.exercises[exerciseIndex].exerciseName = newExercise.name;
  workout.exercises[exerciseIndex].muscleGroup = newExercise.muscleGroup;
  workout.exercises[exerciseIndex].wasSubstituted = true;
  workout.exercises[exerciseIndex].substitutedFrom = oldName;
  
  // We keep the original planned sets/reps but reset completion status
  workout.exercises[exerciseIndex].sets.forEach(set => {
    set.completed = false;
    set.actualReps = 0;
    set.actualWeight = 0;
  });

  await workout.save();

  res.status(200).json({
    success: true,
    message: 'Exercise substituted successfully',
    workout
  });
});

/**
 * @desc    Confirm the AI generated tomorrow plan and overwrite the database
 * @route   POST /api/workouts/tomorrow/confirm-ai
 * @access  Private
 */
const confirmAiPlan = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');

  const { tomorrowPlan } = req.body;

  if (!tomorrowPlan || !tomorrowPlan.date) {
    res.status(400);
    throw new Error('Please provide the valid tomorrowPlan object');
  }

  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // The preview plan passed back from the client has the correct date
  const targetDate = new Date(tomorrowPlan.date);

  // Overwrite existing plan if it exists
  await Workout.deleteMany({ userId: user._id, date: targetDate });

  const newTomorrowPlan = await Workout.create({
    userId: user._id,
    date: targetDate,
    weekNumber: tomorrowPlan.weekNumber,
    dayOfWeek: tomorrowPlan.dayOfWeek,
    sessionType: tomorrowPlan.sessionType,
    status: tomorrowPlan.status,
    exercises: tomorrowPlan.exercises,
    planSource: tomorrowPlan.planSource
  });

  res.status(200).json({
    success: true,
    message: "Tomorrow's plan confirmed and saved",
    tomorrowPlan: newTomorrowPlan
  });
});
/**
 * @desc    Get summary for an already completed workout
 * @route   GET /api/workouts/:id/summary
 * @access  Private
 */
const getWorkoutSummary = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Workout = require('../models/Workout');
  const Metric = require('../models/Metrics');

  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const workout = await Workout.findOne({ _id: req.params.id, userId: user._id });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  if (workout.status !== 'completed') {
    res.status(400);
    throw new Error('Workout is not completed yet');
  }

  // Get tomorrow's plan
  const tomorrowDate = new Date(workout.date);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  tomorrowDate.setUTCHours(0, 0, 0, 0);
  
  const nextDayMidnight = new Date(tomorrowDate);
  nextDayMidnight.setDate(nextDayMidnight.getDate() + 1);

  const tomorrowPlan = await Workout.findOne({
    userId: user._id,
    date: { $gte: tomorrowDate, $lt: nextDayMidnight }
  });

  // Get metrics for PRs
  let metric = await Metric.findOne({ userId: user._id, weekNumber: user.currentWeekNumber });
  const newPRs = metric ? metric.newPRs : [];

  res.status(200).json({
    aiSummary: workout.aiSummary || "Great job completing your workout!",
    tomorrowPlan: tomorrowPlan,
    newPRs: newPRs,
    workout: workout
  });
});

module.exports = {
  createWorkout,
  getTodayWorkout,
  getWorkoutByOffset,
  getWorkoutHistory,
  getWorkoutProgress,
  getWorkoutById,
  logSet,
  addExercise,
  skipExercise,
  restoreExercise,
  swapMuscle,
  confirmPlan,
  completeWorkout,
  substituteExercise,
  confirmAiPlan,
  getWorkoutSummary
};
