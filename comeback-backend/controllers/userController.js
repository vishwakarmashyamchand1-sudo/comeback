const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Create new user (called after Firebase Auth successful sign-up)
 * @route   POST /api/users
 * @access  Public (or protected by temporary token in real-world)
 */
const createUser = asyncHandler(async (req, res) => {
  const { name,email, firebaseUid } = req.body;

  // Basic validation (extend based on exact requirements)
  if (!name || !email || !firebaseUid) {
    res.status(400);
    throw new Error('Please provide name,email and firebaseUid');
  }

  // 1. Check if user already exists
  const existingUser = await User.findOne({ firebaseUid });
  
  // 2. If yes — this is a re-login, not a new user. Return the existing user with isNewUser: false.
  if (existingUser) {
    // RACE CONDITION FIX: If /me auto-created the user first, it used the fallback name "Athlete".
    // We need to update it with their real name from the registration form before returning!
    if (name && (!existingUser.name || existingUser.name === 'Athlete')) {
      existingUser.name = name;
      await existingUser.save();
    }

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: existingUser,
      isNewUser: false
    });
  }

    // 2.5 Check if email is already taken by a different Firebase account
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(409);
    throw new Error('User already exists with this email (different Firebase account)');
  }

  // 3. If no — create a new User document with the provided fields. Set onboardingComplete: false.
  let user;
  try {
    user = await User.create({
      name,
      email,
      firebaseUid,
      onboardingComplete: false
    });
  } catch (err) {
    if (err.code === 11000) {
      console.warn("Race condition during register, user already exists. Fetching...");
      user = await User.findOne({ firebaseUid }) || await User.findOne({ email });
      // If /me auto-created the user first, it used the fallback name "Athlete".
      // We need to update it with their real name from the registration form!
      if (user && name && (!user.name || user.name === 'Athlete')) {
        user.name = name;
        await user.save();
      }
    } else {
      throw err;
    }
  }

  if (user) {
    // 4. Return the new user object and isNewUser: true.
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
      isNewUser: true
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
  // 1. The protect middleware already fetched the user from MongoDB!
  let user = req.user;

  // 2. If the middleware only found a Firebase token but no MongoDB record
  if (!user || !user._id) {
    console.warn("Firebase user exists but no MongoDB record. Auto-creating record...");
    if (!user.firebaseUid) {
      res.status(401);
      throw new Error("Invalid token data. Missing firebaseUid.");
    }
    
    const existingEmailUser = await User.findOne({ email: user.email });

    if (existingEmailUser) {
      console.warn("Email already exists in MongoDB. Updating firebaseUid to link accounts...");
      existingEmailUser.firebaseUid = user.firebaseUid;
      await existingEmailUser.save();
      user = existingEmailUser;
    } else {
      // Do NOT auto-create the MongoDB user here. It causes race conditions with /register
      // where the fallback name "Athlete" overwrites the real name.
      res.status(404);
      throw new Error("User record not found in database. Please register first.");
    }
  }

  // 3. Return full user object!
  res.status(200).json({
    success: true,
    user: user,
    onboardingComplete: user.onboardingComplete
  });
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
