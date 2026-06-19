const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Create new user (called after Firebase Auth successful sign-up)
 * @route   POST /api/users
 * @access  Public (or protected by temporary token in real-world)
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, firebaseUid, gender, heightCm, startWeightKg, targetWeightKg, fitnessLevel, equipmentAccess, daysPerWeek, primaryGoal, dietType } = req.body;

  // Basic validation (extend based on exact requirements)
  if (!name || !email || !firebaseUid) {
    res.status(400);
    throw new Error('Please provide name, email, and firebaseUid');
  }

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { firebaseUid }] });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // AI-calculated defaults (placeholders, replace with actual logic or Claude API)
  const dailyCalorieTarget = 2000;
  const dailyProteinTarget = 120;
  
  // Set targetDate to 12 weeks from now as default
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (12 * 7));

  const user = await User.create({
    name,
    email,
    firebaseUid,
    gender,
    heightCm,
    startWeightKg,
    currentWeightKg: startWeightKg,
    targetWeightKg,
    targetDate,
    fitnessLevel,
    equipmentAccess,
    daysPerWeek,
    primaryGoal,
    dailyCalorieTarget,
    dailyProteinTarget,
    dietType,
    onboardingComplete: true
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Get logged in user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // Uses req.user set by authMiddleware
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: user
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.gender = req.body.gender || user.gender;
    user.profilePhotoUrl = req.body.profilePhotoUrl || user.profilePhotoUrl;
    user.dietType = req.body.dietType || user.dietType;
    user.equipmentAccess = req.body.equipmentAccess || user.equipmentAccess;
    
    // Support nested arrays/objects like foodRestrictions or baselineLifts
    if (req.body.foodRestrictions) user.foodRestrictions = req.body.foodRestrictions;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update current weight
 * @route   PUT /api/users/weight
 * @access  Private
 */
const updateWeight = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { currentWeightKg } = req.body;

  if (!currentWeightKg) {
    res.status(400);
    throw new Error('Please provide currentWeightKg');
  }

  if (user) {
    user.currentWeightKg = currentWeightKg;
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Weight updated successfully',
      data: { currentWeightKg: updatedUser.currentWeightKg }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update primary goal and targets
 * @route   PUT /api/users/goals
 * @access  Private
 */
const updateGoals = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { primaryGoal, targetWeightKg, targetDate, dailyCalorieTarget, dailyProteinTarget } = req.body;

  if (user) {
    user.primaryGoal = primaryGoal || user.primaryGoal;
    user.targetWeightKg = targetWeightKg || user.targetWeightKg;
    user.targetDate = targetDate ? new Date(targetDate) : user.targetDate;
    user.dailyCalorieTarget = dailyCalorieTarget || user.dailyCalorieTarget;
    user.dailyProteinTarget = dailyProteinTarget || user.dailyProteinTarget;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Goals updated successfully',
      data: {
        primaryGoal: updatedUser.primaryGoal,
        targetWeightKg: updatedUser.targetWeightKg,
        dailyCalorieTarget: updatedUser.dailyCalorieTarget,
        dailyProteinTarget: updatedUser.dailyProteinTarget
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  createUser,
  getUserProfile,
  updateUserProfile,
  updateWeight,
  updateGoals
};
