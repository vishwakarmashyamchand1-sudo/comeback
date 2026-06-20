const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Save onboarding profile data (Phase 2)
 * @route   PATCH /api/onboarding/profile
 * @access  Private
 */
const saveOnboardingProfile = asyncHandler(async (req, res) => {
  const { step, data } = req.body;

  if (!step || !data) {
    res.status(400);
    throw new Error('Please provide step number and data object');
  }

  // 1. Validate required fields based on step
  if (step === 1) {
    if (!data.heightCm || !data.currentWeightKg || !data.targetWeightKg || !data.targetDate) {
      res.status(400);
      throw new Error('Step 1 requires heightCm, currentWeightKg, targetWeightKg, and targetDate');
    }
  } else if (step === 2) {
    if (!data.fitnessLevel || !data.equipmentAccess || !data.daysPerWeek) {
      res.status(400);
      throw new Error('Step 2 requires fitnessLevel, equipmentAccess, and daysPerWeek');
    }
  } else if (step === 3) {
    if (!data.primaryGoal) {
      res.status(400);
      throw new Error('Step 3 requires primaryGoal');
    }
  } else if (step === 4) {
    if (!data.dietType) {
      res.status(400);
      throw new Error('Step 4 requires dietType');
    }
  } else if (step === 5) {
    // Step 5 fields (injuries, conditions, etc.) can be empty arrays, but the step itself should be valid
  } else {
    res.status(400);
    throw new Error('Invalid step number. Must be between 1 and 5');
  }

  // 2. Use MongoDB updateOne with $set to patch only the fields for this step
  // 3. Do NOT overwrite fields from previous steps
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // 4. Return the updated user
  res.status(200).json({
    success: true,
    message: `Onboarding Step ${step} saved successfully`,
    data: updatedUser
  });
});

/**
 * @desc    Complete onboarding flow
 * @route   POST /api/onboarding/complete
 * @access  Private
 */
const completeOnboarding = asyncHandler(async (req, res) => {
  const Workout = require('../models/Workout');
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 1. Verify onboarding data exists
  if (!user.heightCm || !user.currentWeightKg || !user.primaryGoal || !user.fitnessLevel) {
    res.status(400);
    throw new Error('Incomplete onboarding profile data. Please fill required fields before completing.');
  }

  const { baselineLifts, strongestMuscle } = req.body;

  // 1. Save baseline data
  if (baselineLifts) user.baselineLifts = baselineLifts;
  if (strongestMuscle) user.strongestMuscle = strongestMuscle;

  // 2. Calculate dailyCalorieTarget and dailyProteinTarget (Harris-Benedict approximate)
  let bmr = 0;
  const age = user.dateOfBirth ? (new Date().getFullYear() - user.dateOfBirth.getFullYear()) : 30; // default 30
  if (user.gender === 'female') {
    bmr = 447.593 + (9.247 * user.currentWeightKg) + (3.098 * user.heightCm) - (4.330 * age);
  } else {
    bmr = 88.362 + (13.397 * user.currentWeightKg) + (4.799 * user.heightCm) - (5.677 * age);
  }
  
  // TDEE multiplier based on daysPerWeek
  const activityMultiplier = user.daysPerWeek >= 5 ? 1.55 : 1.375; 
  let tdee = bmr * activityMultiplier;

  if (user.primaryGoal === 'fat_loss') tdee -= 500;
  if (user.primaryGoal === 'muscle_gain') tdee += 300;

  user.dailyCalorieTarget = Math.round(tdee);
  user.dailyProteinTarget = Math.round(user.currentWeightKg * 2.0); // 2g per kg

  // 3. Determine user type
  const isReturningWithBaseline = user.fitnessLevel === 'returning' && user.baselineLifts && Object.keys(user.baselineLifts).length > 0;
  
  // 4. Simulate Claude API Call (Placeholder)
  // In reality: const claudeResponse = await generateWorkoutPlan(user);
  
  // 5. Create 7 Workout documents
  await Workout.deleteMany({ userId: user._id, weekNumber: 1 }); // Clear if exists

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    
    await Workout.create({
      userId: user._id,
      date: d,
      weekNumber: 1,
      dayOfWeek: days[d.getDay() === 0 ? 6 : d.getDay() - 1], // roughly Mon-Sun
      sessionType: i % 2 === 0 ? 'Full Body' : 'Rest',
      status: i % 2 === 0 ? 'planned' : 'rest_day',
      exercises: [] // To be populated by Claude in real implementation
    });
  }

  // 6. Update user state
  user.onboardingComplete = true;
  user.currentWeekNumber = 1;
  user.isDiscoveryWeek = !isReturningWithBaseline;

  if (!user.weeklyPlanSplit || user.weeklyPlanSplit.length === 0) {
    user.weeklyPlanSplit = ['full', 'rest', 'full', 'rest', 'full', 'rest', 'rest'];
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Onboarding completed successfully',
    data: {
      onboardingComplete: true,
      dailyCalorieTarget: user.dailyCalorieTarget,
      dailyProteinTarget: user.dailyProteinTarget
    }
  });
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
