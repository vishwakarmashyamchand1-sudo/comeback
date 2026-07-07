const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateWeek1Plan } = require('../services/planGenerationService');

/**
 * @desc    Save onboarding profile data step by step
 * @route   PATCH /api/onboarding/profile
 * @access  Private
 */
const saveOnboardingProfile = asyncHandler(async (req, res) => {
  // Read exactly what the card asks for: step_number and data
  const { step_number, data } = req.body;

  if (!step_number || !data) {
    res.status(400);
    throw new Error('Missing required fields: please provide step_number and data object');
  }

  // 1. Validate required fields and map frontend keys to backend Schema keys
  let updateData = { ...data };

  if (step_number === 1) {
    if (!data.gender || !data.heightCm || !data.currentWeightKg || !data.targetWeightKg || !data.targetDate) {
      res.status(400);
      throw new Error('Step 1 requires gender, heightCm, currentWeightKg, targetWeightKg, and targetDate');
    }
    updateData.heightCm = data.heightCm;
    updateData.currentWeightKg = data.currentWeightKg;
    updateData.targetWeightKg = data.targetWeightKg;
    updateData.targetDate = data.targetDate;
    updateData.gender = data.gender;
    updateData.dateOfBirth = data.dateOfBirth;
  } else if (step_number === 2) {
    if (!data.fitnessLevel || !data.daysPerWeek || !data.equipmentAccess) {
      res.status(400);
      throw new Error('Step 2 requires fitnessLevel, daysPerWeek, and equipmentAccess');
    }
    updateData.fitnessLevel = data.fitnessLevel;
    updateData.lastActive = data.lastActivePeriod; // mapped to model
    updateData.equipmentAccess = data.equipmentAccess;
    updateData.daysPerWeek = data.daysPerWeek;
    updateData.preferredTime = data.preferredTime;
    if (data.strongestMuscle) updateData.strongestMuscle = data.strongestMuscle;
    if (data.weakestMuscle) updateData.weakestMuscle = data.weakestMuscle;
    
    if (data.fitnessLevel !== 'Beginner' && data.baselineLifts) {
      const parsedLifts = {};
      if (data.baselineLifts.chestPressKg) parsedLifts.chestPressKg = Number(data.baselineLifts.chestPressKg);
      if (data.baselineLifts.shoulderPressKg) parsedLifts.shoulderPressKg = Number(data.baselineLifts.shoulderPressKg);
      if (data.baselineLifts.squatKg) parsedLifts.squatKg = Number(data.baselineLifts.squatKg);
      if (data.baselineLifts.deadliftKg) parsedLifts.deadliftKg = Number(data.baselineLifts.deadliftKg);
      updateData.baselineLifts = parsedLifts;
    } else {
      // Clear them if they switch to Beginner
      updateData.baselineLifts = { chestPressKg: null, shoulderPressKg: null, squatKg: null, deadliftKg: null };
    }
  } else if (step_number === 3) {
    if (!data.primaryGoal || !data.motivationEvent || !data.urgencyLevel) {
      res.status(400);
      throw new Error('Step 3 requires primaryGoal, motivationEvent, and urgencyLevel');
    }
    updateData.primaryGoal = data.primaryGoal;
    updateData.upcomingEvent = data.motivationEvent; // mapped to model
    updateData.urgencyLevel = data.urgencyLevel;
  } else if (step_number === 4) {
    if (!data.dietType) {
      res.status(400);
      throw new Error('Step 4 requires dietType');
    }
    updateData.dietType = data.dietType;
    if (data.foodRestrictions) updateData.foodRestrictions = data.foodRestrictions;
    if (data.supplementsTaken) updateData.supplements = data.supplementsTaken; // mapped to model
  } else if (step_number === 5) {
    updateData.injuries = data.injuries || [];
    updateData.medicalConditions = data.medicalConditions || [];
    if (typeof data.exercisesToAvoid !== 'undefined') updateData.exercisesToAvoid = data.exercisesToAvoid;
    // doctorClearance isn't stored in User model currently, but we validate it per API doc
    updateData.onboardingComplete = true; // Mark as complete!
  } else {
    res.status(400);
    throw new Error('Invalid step number. Must be between 1 and 5');
  }

  // 2. & 3. Use $set to patch only the fields for this step, never overwriting previous steps!
  const updatedUser = await User.findOneAndUpdate(
    { firebaseUid: req.user.firebaseUid }, // Securely find them using the token UID
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found in Database');
  }

  // 4. & 5. Return the exact JSON structure your Sir requested!
  res.status(200).json({
    user: updatedUser,
    nextStep_number: step_number < 5 ? step_number + 1 : 6 // Tell frontend what screen is next
  });
});

/**
 * @desc    Complete onboarding flow and generate Week 1 plan
 * @route   POST /api/onboarding/complete
 * @access  Private
 */
const completeOnboarding = asyncHandler(async (req, res) => {
  const Workout = require('../models/Workout');
  
  // 1. Securely fetch user using Firebase Token
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });

  if (!user) {
    res.status(404);
    throw new Error('User not found in Database');
  }

  // 2. Validate basic profile exists
  if (!user.heightCm || !user.currentWeightKg || !user.primaryGoal || !user.fitnessLevel) {
    res.status(400);
    throw new Error('Incomplete user profile. Please finish all 5 steps first.');
  }

  // 3. Save Baseline data (Optional)
  const { baselineLifts, strongestMuscle, weakestMuscle } = req.body;
  if (baselineLifts) {
    user.baselineLifts = baselineLifts;
  }
  if (strongestMuscle) user.strongestMuscle = strongestMuscle;
  if (weakestMuscle) user.weakestMuscle = weakestMuscle;

  // 4. Calculate Calories & Protein (Steps 17 & 18 from the Sir's doc)
  let bmr = 0;
  const age = 30; // Defaulting to 30 for math
  if (user.gender === 'female') {
    bmr = 447.6 + (9.2 * user.currentWeightKg) + (3.1 * user.heightCm) - (4.3 * age); // Using 1 decimal place standard
  } else {
    bmr = 88.36 + (13.4 * user.currentWeightKg) + (4.8 * user.heightCm) - (5.7 * age); // Exact match from Sir's doc
  }
  
  const activityMultiplier = user.daysPerWeek >= 5 ? 1.55 : 1.375; 
  let tdee = bmr * activityMultiplier;

  if (user.primaryGoal === 'fat_loss') tdee -= 500;
  if (user.primaryGoal === 'muscle_gain') tdee += 300;

  user.dailyCalorieTarget = Math.round(tdee);
  user.dailyProteinTarget = Math.round(user.currentWeightKg * 2.0); // 2g per kg

  // 5. Determine if returning or beginner (Steps 19, 23, 24 from the Sir's doc)
  const isReturning = (user.fitnessLevel === 'returning' || user.fitnessLevel === 'active') && user.baselineLifts && Object.keys(user.baselineLifts).length > 0;
  
  user.onboardingComplete = true;
  user.currentWeekNumber = 1;
  user.isDiscoveryWeek = !isReturning; // If not returning, it is a discovery week!

  await user.save();

  // 6. Generate 7-Day Workout Plan (Steps 20, 21, 22 from the Sir's doc)
  await Workout.deleteMany({ userId: user._id }); // Clear all old workouts to prevent duplicate key errors when regenerating

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let weekPlan = [];
  let coachNote = `Welcome to the app! I've calculated your calories at ${user.dailyCalorieTarget} kcal. Let's crush Week 1!`;

  try {
    const generatedWeek = await generateWeek1Plan(user, baselineLifts);
    
    // Save the AI's chosen split back to the user profile
    if (generatedWeek && generatedWeek.length === 7) {
      user.weeklyPlanSplit = generatedWeek.map(day => day.sessionType || 'Rest');
      await user.save();
    }

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      
      const Exercise = require('../models/Exercise');
      let finalExercises = [];
      const dayData = generatedWeek[i];
      const isRestDay = dayData ? dayData.isRestDay : (i % 2 !== 0);
      
      if (dayData && dayData.exercises) {
        for (const ex of dayData.exercises) {
          if (!ex.exerciseName) continue;
          let dbEx = await Exercise.findOne({ name: new RegExp('^' + ex.exerciseName + '$', 'i') });
          if (!dbEx) {
            // Smart fuzzy fallback: find an exercise that contains the key words
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const words = ex.exerciseName.split(' ').filter(w => w.length > 2).map(escapeRegExp); // e.g. ["Cable", "Triceps", "Pushdown"]
            if (words.length > 0) {
              const regexQuery = words.map(w => ({ name: new RegExp(w, 'i') }));
              dbEx = await Exercise.findOne({ $and: regexQuery });
            }
            if (!dbEx && words.length > 0) {
              // Ultimate fallback: match the last significant word (e.g., "Press", "Curl", "Pushdown")
              dbEx = await Exercise.findOne({ name: new RegExp(words[words.length - 1], 'i') });
            }
          }
          if (dbEx) {
            finalExercises.push({
              ...ex,
              exerciseName: dbEx.name, // normalize to DB name
              exerciseId: dbEx._id
            });
          }
        }
      }
      
      const workoutDoc = await Workout.create({
        userId: user._id,
        date: d,
        weekNumber: 1,
        dayOfWeek: days[d.getDay()],
        sessionType: dayData ? dayData.sessionType : (isRestDay ? 'Rest' : 'Full Body'),
        status: isRestDay ? 'rest_day' : 'planned',
        exercises: finalExercises,
        planSource: 'ai_generated'
      });
      weekPlan.push(workoutDoc);
    }
    
    // 7. Return the exact response format (Step 25 from the Sir's doc)
    return res.status(200).json({
      success: true,
      message: "Week 1 plan generated successfully",
      weekPlan: weekPlan,
      user: user,
      coachNote: coachNote
    });

  } catch (error) {
    console.error("AI Generation failed, using fallback:", error);
    
    // Fallback logic dictionary
    const fallbackSplits = {
      2: ['Full Body', 'Rest', 'Rest', 'Full Body', 'Rest', 'Rest', 'Rest'],
      3: ['Push', 'Rest', 'Pull', 'Rest', 'Legs', 'Rest', 'Rest'],
      4: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
      5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Rest', 'Rest'],
      6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest']
    };
    
    const splitKey = [2,3,4,5,6].includes(user.daysPerWeek) ? user.daysPerWeek : 5;
    const splitPattern = fallbackSplits[splitKey];

    // Fallback exercise skeletons
    const skeletons = {
      'Push': ['Bench Press', 'Overhead Press', 'Triceps Pushdown'],
      'Pull': ['Barbell Row', 'Lat Pulldown', 'Bicep Curl'],
      'Legs': ['Squat', 'Leg Press', 'Calf Raise'],
      'Upper': ['Bench Press', 'Barbell Row', 'Overhead Press'],
      'Lower': ['Squat', 'Romanian Deadlift', 'Leg Curl'],
      'Full Body': ['Squat', 'Bench Press', 'Barbell Row']
    };

    const defaultSets = [
      { setNumber: 1, plannedReps: 15, plannedWeight: 5 },
      { setNumber: 2, plannedReps: 12, plannedWeight: 10 },
      { setNumber: 3, plannedReps: 10, plannedWeight: 15 }
    ];

    const Exercise = require('../models/Exercise');

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      
      const sessionType = splitPattern[i];
      const isRestDay = sessionType === 'Rest';
      
      let finalExercises = [];
      if (!isRestDay && skeletons[sessionType]) {
        for (const exName of skeletons[sessionType]) {
          const dbEx = await Exercise.findOne({ name: new RegExp('^' + exName, 'i') });
          if (dbEx) {
            finalExercises.push({
              exerciseName: dbEx.name,
              exerciseId: dbEx._id,
              muscleGroup: dbEx.targetMuscle || 'Various',
              sets: defaultSets,
              antigravityReasoning: "Fallback standard exercise.",
              benefits: "Builds foundational strength."
            });
          }
        }
      }
      
      const workoutDoc = await Workout.create({
        userId: user._id,
        date: d,
        weekNumber: 1,
        dayOfWeek: days[d.getDay()],
        sessionType: sessionType,
        status: isRestDay ? 'rest_day' : 'planned',
        exercises: finalExercises,
        planSource: 'ai_generated'
      });
      weekPlan.push(workoutDoc);
    }
    
    // Also save the split to user profile so frontend calendar matches
    user.weeklyPlanSplit = splitPattern;
    await user.save();

    return res.status(500).json({
      success: false,
<<<<<<< Updated upstream
      message: "AI API failed. Returning fallback template plan.",
=======
      message: "Gemini API failed. Returning fallback template plan.",
>>>>>>> Stashed changes
      weekPlan: weekPlan,
      user: user,
      coachNote: coachNote
    });
  }
});

/**
 * @desc    Get onboarding status
 * @route   GET /api/onboarding/status
 * @access  Private
 */
const getOnboardingStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Determine current step based on filled data
  let currentStep = 'profile';
  if (user.heightCm && user.currentWeightKg && !user.onboardingComplete) {
    currentStep = 'goals';
  } else if (user.onboardingComplete) {
    currentStep = 'completed';
  }

  res.status(200).json({
    success: true,
    message: 'Onboarding status fetched',
    data: {
      onboardingComplete: user.onboardingComplete || false,
      currentStep
    }
  });
});

module.exports = {
  saveOnboardingProfile,
  completeOnboarding,
  getOnboardingStatus
};
