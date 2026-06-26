const asyncHandler = require('express-async-handler');
const DietLog = require('../models/DietLog');

/**
 * Recalculate all totals at the document level
 */
const recalculateDailyTotals = (dietLog) => {
  let totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0;
  
  dietLog.meals.forEach(meal => {
    let mealCal = 0, mealPro = 0, mealCarb = 0, mealFat = 0;
    
    // Safety check in case items array is missing
    if (meal.items && Array.isArray(meal.items)) {
      meal.items.forEach(item => {
        mealCal += item.calories || 0;
        mealPro += item.proteinG || 0;
        mealCarb += item.carbsG || 0;
        mealFat += item.fatG || 0;
      });
    }

    meal.totalCalories = mealCal;
    meal.totalProteinG = mealPro;
    meal.totalCarbsG = mealCarb;
    meal.totalFatG = mealFat;

    totalCal += mealCal;
    totalPro += mealPro;
    totalCarb += mealCarb;
    totalFat += mealFat;
  });

  dietLog.totalCalories = totalCal;
  dietLog.totalProteinG = totalPro;
  dietLog.totalCarbsG = totalCarb;
  dietLog.totalFatG = totalFat;
};

/**
 * @desc    Confirm and save a meal to today's diet log
 * @route   POST /api/diet/log-meal
 * @access  Private
 */
const logMeal = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const DietLog = require('../models/DietLog');
  const { mealType, photoUrl, items, aiTip } = req.body;

  if (!mealType || !photoUrl || !items || !Array.isArray(items)) {
    res.status(400);
    throw new Error('Please provide mealType, photoUrl, and items array');
  }

  // Securely fetch User
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Step 82: Find or create today's DietLog for this user
  let dietLog = await DietLog.findOne({ userId: user._id, date: today });
  if (!dietLog) {
    dietLog = new DietLog({
      userId: user._id,
      date: today,
      meals: [],
      waterGlasses: 0,
      totalCalories: 0,
      totalProteinG: 0,
      totalCarbsG: 0,
      totalFatG: 0
    });
  }

  // Format food items and check for edits (Step 84)
  let mealCal = 0, mealPro = 0, mealCarb = 0, mealFat = 0;
  
  const formattedItems = items.map(item => {
    // Step 83: Calculate totals for this meal
    mealCal += item.calories || 0;
    mealPro += item.proteinG || 0;
    mealCarb += item.carbsG || 0;
    mealFat += item.fatG || 0;

    return {
      name: item.foodName || item.name,
      quantityG: item.quantityG || item.quantity,
      calories: item.calories,
      proteinG: item.proteinG,
      carbsG: item.carbsG,
      fatG: item.fatG,
      // Step 84: Mark if edited
      editedByUser: item.editedByUser || false
    };
  });

  const newMeal = {
    mealType,
    photoUrl,
    aiTip,
    items: formattedItems,
    totalCalories: mealCal,
    totalProteinG: mealPro,
    totalCarbsG: mealCarb,
    totalFatG: mealFat,
    loggedAt: new Date()
  };

  // Step 85: Push the new meal object into dietLog.meals array (this natively appends even if breakfast already exists)
  dietLog.meals.push(newMeal);

  // Step 86: Recalculate and update dietLog totals
  recalculateDailyTotals(dietLog);

  // Save the database
  const savedLog = await dietLog.save();

  // Step 87: Check if this is the 2nd meal logged today - trigger daily coach tip asynchronously
  if (savedLog.meals.length === 2) {
    // Fire and forget! Do not await this so the user isn't kept waiting.
    generateDailyNutritionTipAsync(user._id, savedLog._id).catch(err => console.error("Async AI Tip Failed:", err));
  }

  // Step 88: Return updated DietLog and running totals
  const runningTotals = {
    calories: savedLog.totalCalories || 0,
    proteinG: savedLog.totalProteinG || 0,
    carbsG: savedLog.totalCarbsG || 0,
    fatG: savedLog.totalFatG || 0,
    waterGlasses: savedLog.waterGlasses || 0
  };

  res.status(200).json({
    dietLog: savedLog,
    runningTotals: runningTotals
  });
});

// Helper for Step 87: Async trigger
const generateDailyNutritionTipAsync = async (userId, dietLogId) => {
  // In a real app, this calls Claude (Call 07)
  console.log(`[BACKGROUND] Triggering Claude AI for 2nd meal nutrition tip... User: ${userId}`);
};


/**
 * @desc    2. Update a specific meal
 * @route   PATCH /api/diet/meal/:mealId
 * @access  Private
 */
const updateMeal = asyncHandler(async (req, res) => {
  const { mealId } = req.params;
  const { mealType, items, aiTip } = req.body;

  const dietLog = await DietLog.findOne({ 'meals._id': mealId, userId: req.user._id });

  if (!dietLog) {
    res.status(404);
    throw new Error('Meal not found');
  }

  const mealIndex = dietLog.meals.findIndex(m => m._id.toString() === mealId);
  
  if (mealIndex !== -1) {
    if (mealType) dietLog.meals[mealIndex].mealType = mealType;
    if (aiTip !== undefined) dietLog.meals[mealIndex].aiTip = aiTip;
    
    if (items && Array.isArray(items)) {
      dietLog.meals[mealIndex].items = items.map(item => ({
        name: item.foodName || item.name,
        quantityG: item.quantity,
        calories: item.calories,
        proteinG: item.proteinG,
        carbsG: item.carbsG,
        fatG: item.fatG,
        editedByUser: true // Explicitly set to true when user edits existing food
      }));
    }
    
    // Auto-calculate totals before save
    recalculateDailyTotals(dietLog);
    const updatedLog = await dietLog.save();

    res.status(200).json({
      success: true,
      data: updatedLog.meals[mealIndex]
    });
  } else {
    res.status(404);
    throw new Error('Meal not found in log');
  }
});

/**
 * @desc    3. Delete a specific meal
 * @route   DELETE /api/diet/meal/:mealId
 * @access  Private
 */
const deleteMeal = asyncHandler(async (req, res) => {
  const { mealId } = req.params;

  const dietLog = await DietLog.findOne({ 'meals._id': mealId, userId: req.user._id });

  if (!dietLog) {
    res.status(404);
    throw new Error('Meal not found');
  }

  const initialLength = dietLog.meals.length;
  dietLog.meals = dietLog.meals.filter(m => m._id.toString() !== mealId);
  
  if (dietLog.meals.length === initialLength) {
    res.status(404);
    throw new Error('Meal not found in log');
  }

  // Auto-calculate totals before save
  recalculateDailyTotals(dietLog);
  await dietLog.save();

  res.status(200).json({
    success: true,
    data: { message: 'Meal deleted successfully' }
  });
});

/**
 * @desc    4. Get today's diet log
 * @route   GET /api/diet/today
 * @access  Private
 */
const getTodayDiet = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const DietLog = require('../models/DietLog');

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Step 73: Fetch user's daily targets securely
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Step 70: Find DietLog for userId + today's date
  let dietLog = await DietLog.findOne({ userId: user._id, date: today });

  // Step 71: If no log exists yet: create an empty DietLog document for today
  if (!dietLog) {
    dietLog = await DietLog.create({
      userId: user._id,
      date: today,
      meals: [],
      waterGlasses: 0,
      totalCalories: 0,
      totalProteinG: 0,
      totalCarbsG: 0,
      totalFatG: 0
    });
  }

  // Step 72: Calculate runningTotals
  const runningTotals = {
    calories: dietLog.totalCalories || 0,
    proteinG: dietLog.totalProteinG || 0,
    carbsG: dietLog.totalCarbsG || 0,
    fatG: dietLog.totalFatG || 0,
    waterGlasses: dietLog.waterGlasses || 0
  };

  const targets = {
    dailyCalorieTarget: user.dailyCalorieTarget || 0,
    dailyProteinTarget: user.dailyProteinTarget || 0
  };

  // Step 74: Calculate remainingProtein
  let remainingProtein = targets.dailyProteinTarget - runningTotals.proteinG;
  if (remainingProtein < 0) remainingProtein = 0; // Don't show negative remaining

  // Step 75: Return everything exactly as requested
  res.status(200).json({
    dietLog: dietLog,
    runningTotals: runningTotals,
    targets: targets,
    remainingProtein: remainingProtein
  });
});

/**
 * @desc    5. Get diet history with pagination
 * @route   GET /api/diet/history
 * @access  Private
 */
const getDietHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const dietLogs = await DietLog.find({ userId: req.user._id })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await DietLog.countDocuments({ userId: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      dietLogs,
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
 * @desc    6. Get diet summary for a specific date or today
 * @route   GET /api/diet/summary
 * @access  Private
 */
const getDietSummary = asyncHandler(async (req, res) => {
  let targetDate = new Date();
  if (req.query.date) {
    targetDate = new Date(req.query.date);
  }
  targetDate.setUTCHours(0, 0, 0, 0);

  const dietLog = await DietLog.findOne({ userId: req.user._id, date: targetDate });

  res.status(200).json({
    success: true,
    data: {
      totalCalories: dietLog ? dietLog.totalCalories : 0,
      totalProteinG: dietLog ? dietLog.totalProteinG : 0,
      mealsCount: dietLog ? dietLog.meals.length : 0
    }
  });
});

/**
 * @desc    Update water count
 * @route   PATCH /api/diet/water
 * @access  Private
 */
const updateWater = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const DietLog = require('../models/DietLog');
  const { glasses } = req.body;

  if (glasses === undefined) {
    res.status(400);
    throw new Error('Please provide the full glasses count');
  }

  // Securely fetch User
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Step 89: Find today's DietLog
  let dietLog = await DietLog.findOne({ userId: user._id, date: today });

  if (!dietLog) {
    dietLog = new DietLog({
      userId: user._id,
      date: today,
      meals: [],
      waterGlasses: glasses
    });
  } else {
    // Step 90: Set waterGlasses to the provided value
    dietLog.waterGlasses = glasses;
  }

  const updatedLog = await dietLog.save();

  // Step 91: Return updated value exactly as requested
  res.status(200).json({
    waterGlasses: updatedLog.waterGlasses
  });
});

/**
 * @desc    Get or generate today's daily nutrition coach tip
 * @route   GET /api/diet/tip
 * @access  Private
 */
const getDietTip = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const DietLog = require('../models/DietLog');

  // Securely fetch User
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Step 92: Check today's DietLog
  let dietLog = await DietLog.findOne({ userId: user._id, date: today });

  if (!dietLog) {
    // If no diet log exists for today yet, create an empty one so we have a place to save the tip!
    dietLog = new DietLog({
      userId: user._id,
      date: today,
      meals: [],
      waterGlasses: 0
    });
  }

  // Step 93: The Critical Caching Check!
  if (dietLog.dailyCoachTip && dietLog.dailyTipGeneratedAt) {
    const generatedDate = new Date(dietLog.dailyTipGeneratedAt);
    generatedDate.setUTCHours(0, 0, 0, 0);

    if (generatedDate.getTime() === today.getTime()) {
      // Tip was already generated today. Return the cached tip and DO NOT call Claude!
      return res.status(200).json({
        tip: dietLog.dailyCoachTip,
        generatedAt: dietLog.dailyTipGeneratedAt
      });
    }
  }

  // Step 94 & 95: (MOCK) Call Claude API to generate a new tip
  const mockNewTip = "Your protein intake has been perfectly consistent over the last 3 days! Remember to hydrate around your workout window today to maximize recovery.";
  const generationTime = new Date();

  dietLog.dailyCoachTip = mockNewTip;
  dietLog.dailyTipGeneratedAt = generationTime;

  // Save the new tip to the database so it gets cached for the rest of the day
  await dietLog.save();

  // Step 96: Return the newly generated tip
  res.status(200).json({
    tip: mockNewTip,
    generatedAt: generationTime
  });
});

/**
 * @desc    Upload food photo and get AI nutrition breakdown
 * @route   POST /api/diet/analyze-photo
 * @access  Private
 */
const analyzePhoto = asyncHandler(async (req, res) => {
  const { photo, mealType } = req.body;

  if (!photo || !mealType) {
    res.status(400);
    throw new Error('Please provide a base64 photo string and mealType');
  }

  // Step 76: (MOCK) Upload to Cloudflare R2
  const photoUrl = `https://r2.comeback-app.com/food-logs/${req.user._id}/${Date.now()}/${mealType}.jpg`;

  // Step 77, 78, 79: (MOCK) Build Claude Vision prompt and call Claude API
  // In a real scenario, we would pass the base64 image to Claude Vision and get this JSON back
  const mockClaudeResponse = {
    items: [
      {
        name: "Grilled Chicken Breast",
        quantityG: 200,
        calories: 330,
        proteinG: 62,
        carbsG: 0,
        fatG: 7,
        confidence: "High"
      },
      {
        name: "Brown Rice",
        quantityG: 150,
        calories: 168,
        proteinG: 3.5,
        carbsG: 35,
        fatG: 1.5,
        confidence: "High"
      }
    ],
    totalCalories: 498,
    totalProteinG: 65.5,
    oneTip: "Great protein intake! Consider adding some greens for fiber."
  };

  // Step 80: Return items, totals, tip, and photoUrl (Step 81: DO NOT save to DietLog yet!)
  res.status(200).json({
    items: mockClaudeResponse.items,
    totalCalories: mockClaudeResponse.totalCalories,
    totalProteinG: mockClaudeResponse.totalProteinG,
    oneTip: mockClaudeResponse.oneTip,
    photoUrl: photoUrl
  });
});

module.exports = {
  logMeal,
  updateMeal,
  deleteMeal,
  getTodayDiet,
  getDietHistory,
  getDietSummary,
  updateWater,
  getDietTip,
  analyzePhoto
};
