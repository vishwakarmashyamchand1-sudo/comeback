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
 * @desc    1. Add meal to today's log (or specific date)
 * @route   POST /api/diet/meal
 * @access  Private
 */
const addMeal = asyncHandler(async (req, res) => {
  const { date, mealType, items, photoUrl } = req.body;

  if (!mealType || !items || !Array.isArray(items)) {
    res.status(400);
    throw new Error('Please provide mealType and an array of items');
  }

  // Use provided date or default to today
  const logDate = date ? new Date(date) : new Date();
  logDate.setUTCHours(0, 0, 0, 0);

  let dietLog = await DietLog.findOne({ userId: req.user._id, date: logDate });

  if (!dietLog) {
    dietLog = new DietLog({
      userId: req.user._id,
      date: logDate,
      meals: [],
      waterGlasses: 0
    });
  }

  // Format food items mapping payload to schema exactly
  const formattedItems = items.map(item => ({
    name: item.foodName || item.name,
    quantityG: item.quantity,
    calories: item.calories,
    proteinG: item.proteinG,
    carbsG: item.carbsG,
    fatG: item.fatG,
    editedByUser: item.editedByUser || false
  }));

  const newMeal = {
    mealType,
    photoUrl,
    items: formattedItems,
    loggedAt: new Date()
  };

  dietLog.meals.push(newMeal);

  // Auto-calculate totals before save
  recalculateDailyTotals(dietLog);

  const savedLog = await dietLog.save();

  res.status(201).json({
    success: true,
    data: savedLog.meals[savedLog.meals.length - 1] // return the newly added meal
  });
});

/**
 * @desc    2. Update a specific meal
 * @route   PATCH /api/diet/meal/:mealId
 * @access  Private
 */
const updateMeal = asyncHandler(async (req, res) => {
  const { mealId } = req.params;
  const { mealType, items, photoUrl } = req.body;

  const dietLog = await DietLog.findOne({ 'meals._id': mealId, userId: req.user._id });

  if (!dietLog) {
    res.status(404);
    throw new Error('Meal not found');
  }

  const mealIndex = dietLog.meals.findIndex(m => m._id.toString() === mealId);
  
  if (mealIndex !== -1) {
    if (mealType) dietLog.meals[mealIndex].mealType = mealType;
    if (photoUrl !== undefined) dietLog.meals[mealIndex].photoUrl = photoUrl;
    
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
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const dietLog = await DietLog.findOne({ userId: req.user._id, date: today });

  if (!dietLog) {
    // Return empty log structure instead of 404 to gracefully handle new days
    return res.status(200).json({
      success: true,
      data: {
        userId: req.user._id,
        date: today,
        meals: [],
        totalCalories: 0,
        totalProteinG: 0,
        totalCarbsG: 0,
        totalFatG: 0
      }
    });
  }

  res.status(200).json({
    success: true,
    data: dietLog
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
 * @desc    7. Placeholder for photo URL storage (future R2 setup)
 * @route   POST /api/diet/photo
 * @access  Private
 */
const storePhoto = asyncHandler(async (req, res) => {
  const { photoUrl } = req.body;

  if (!photoUrl) {
    res.status(400);
    throw new Error('Please provide photoUrl');
  }

  // Placeholder logic: just echo it back. 
  // In the future this will be linked to Cloudflare R2 direct uploads and Claude parsing
  res.status(200).json({
    success: true,
    data: {
      photoUrl,
      message: 'Photo URL stored. AI parsing disabled for now.'
    }
  });
});

/**
 * @desc    Update water count
 * @route   PATCH /api/diet/water
 * @access  Private
 */
const updateWater = asyncHandler(async (req, res) => {
  const { date, waterGlasses } = req.body;

  if (waterGlasses === undefined) {
    res.status(400);
    throw new Error('Please provide waterGlasses count');
  }

  const logDate = date ? new Date(date) : new Date();
  logDate.setUTCHours(0, 0, 0, 0);

  let dietLog = await DietLog.findOne({ userId: req.user._id, date: logDate });

  if (!dietLog) {
    dietLog = new DietLog({
      userId: req.user._id,
      date: logDate,
      meals: [],
      waterGlasses
    });
  } else {
    dietLog.waterGlasses = waterGlasses;
  }

  const updatedLog = await dietLog.save();

  res.status(200).json({
    success: true,
    data: { waterGlasses: updatedLog.waterGlasses }
  });
});

/**
 * @desc    Get nutrition tip (Call 07 placeholder)
 * @route   GET /api/diet/tip
 * @access  Private
 */
const getDietTip = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { tip: 'Make sure to drink enough water and balance your macros!' }
  });
});

module.exports = {
  addMeal,
  updateMeal,
  deleteMeal,
  getTodayDiet,
  getDietHistory,
  getDietSummary,
  storePhoto,
  updateWater,
  getDietTip
};
