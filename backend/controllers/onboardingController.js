const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Save onboarding profile data (Phase 2)
 * @route   PATCH /api/onboarding/profile
 * @access  Private
 */
const saveOnboardingProfile = asyncHandler(async (req, res) => {
  const {
    age, // Optional: Not strictly in schema, but often collected during onboarding
    gender,
    heightCm,
    currentWeightKg,
    startWeightKg,
    goalWeightKg, // Maps to targetWeightKg
    fitnessGoal, // Maps to primaryGoal
    activityLevel, // Maps to fitnessLevel
    workoutDaysPerWeek, // Maps to daysPerWeek
    injuries,
    dietaryPreference, // Maps to dietType
    weeklyPlanSplit,
    isDiscoveryWeek,
    baselineLifts
  } = req.body;

  // Basic validation required fields
  if (heightCm === undefined || currentWeightKg === undefined || startWeightKg === undefined) {
    res.status(400);
    throw new Error('Please provide heightCm, currentWeightKg, and startWeightKg');
  }

  if (heightCm <= 0) {
    res.status(400);
    throw new Error('Height must be greater than 0');
  }

  if (currentWeightKg <= 0 || startWeightKg <= 0) {
    res.status(400);
    throw new Error('Weight must be greater than 0');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update fields mapping payload names to actual schema names
  if (gender) user.gender = gender;
  user.heightCm = heightCm;
  user.currentWeightKg = currentWeightKg;
  user.startWeightKg = startWeightKg;
  
  if (goalWeightKg !== undefined) user.targetWeightKg = goalWeightKg;
  if (fitnessGoal) user.primaryGoal = fitnessGoal;
  if (activityLevel) user.fitnessLevel = activityLevel;
  if (workoutDaysPerWeek) user.daysPerWeek = workoutDaysPerWeek;
  if (injuries) user.injuries = injuries;
  if (dietaryPreference) user.dietType = dietaryPreference;
  if (weeklyPlanSplit) user.weeklyPlanSplit = weeklyPlanSplit;
  if (isDiscoveryWeek !== undefined) user.isDiscoveryWeek = isDiscoveryWeek;
  if (baselineLifts) user.baselineLifts = baselineLifts;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: 'Onboarding profile data saved successfully',
    data: updatedUser
  });
});

/**
 * @desc    Complete onboarding flow
 * @route   POST /api/onboarding/complete
 * @access  Private
 */
const completeOnboarding = asyncHandler(async (req, res) => {
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

  // 2. Set onboardingComplete = true
  user.onboardingComplete = true;

  // 3. Generate Week 1 plan placeholder & 4. Set isDiscoveryWeek = true
  user.isDiscoveryWeek = true;
  
  // 5. Save generated weeklyPlanSplit
  // Assuming a generic default if not provided during profile step
  if (!user.weeklyPlanSplit || user.weeklyPlanSplit.length === 0) {
    user.weeklyPlanSplit = ['full', 'rest', 'full', 'rest', 'full', 'rest', 'rest'];
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Onboarding completed successfully',
    data: {
      onboardingComplete: true
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
