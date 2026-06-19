const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

/**
 * @desc    1. Get all exercises (with pagination, sorting, and optional filtering)
 * @route   GET /api/exercises
 * @access  Public
 */
const getAllExercises = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Filtering (e.g., ?isActive=true)
  const filter = { isActive: true };

  // Sorting
  // Default sort by name ascending, can be overridden via ?sort=-createdAt etc.
  let sortBy = { name: 1 };
  if (req.query.sort) {
    const sortField = req.query.sort.replace('-', '');
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
    sortBy = { [sortField]: sortOrder };
  }

  // Execute query
  const exercises = await Exercise.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  const total = await Exercise.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      exercises,
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
 * @desc    2. Get a single exercise by ID (Searches sourceId first, then Mongo _id)
 * @route   GET /api/exercises/:id
 * @access  Public
 */
const getExerciseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let exercise;

  // First priority: search by sourceId (e.g., '0025')
  exercise = await Exercise.findOne({ sourceId: id, isActive: true });

  // Second priority: If not found by sourceId, try searching by MongoDB ObjectId
  if (!exercise && mongoose.Types.ObjectId.isValid(id)) {
    exercise = await Exercise.findById(id);
    // Ensure it's active if found
    if (exercise && !exercise.isActive) {
      exercise = null; 
    }
  }

  if (!exercise) {
    res.status(404);
    throw new Error('Exercise not found');
  }

  res.status(200).json({
    success: true,
    data: exercise
  });
});

/**
 * @desc    3. Get exercises by muscle group
 * @route   GET /api/exercises/muscle-group/:muscleGroup
 * @access  Public
 */
const getExercisesByMuscleGroup = asyncHandler(async (req, res) => {
  const muscleGroup = req.params.muscleGroup;
  
  // Utilizes the schema index on muscleGroup
  const exercises = await Exercise.find({ muscleGroup, isActive: true })
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: exercises
  });
});

/**
 * @desc    4. Get exercises by equipment
 * @route   GET /api/exercises/equipment/:equipment
 * @access  Public
 */
const getExercisesByEquipment = asyncHandler(async (req, res) => {
  const equipment = req.params.equipment;
  
  // Utilizes the schema index on equipment (via compound index)
  const exercises = await Exercise.find({ equipment, isActive: true })
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: exercises
  });
});

/**
 * @desc    5. Search exercises via keyword
 * @route   GET /api/exercises/search?q=
 * @access  Public
 */
const searchExercises = asyncHandler(async (req, res) => {
  const query = req.query.q;

  if (!query) {
    res.status(400);
    throw new Error('Please provide a search query (q)');
  }

  const searchRegex = new RegExp(query, 'i');

  // Search across multiple relevant fields
  const exercises = await Exercise.find({
    isActive: true,
    $or: [
      { name: searchRegex },
      { targetMuscle: searchRegex },
      { secondaryMuscles: { $in: [searchRegex] } },
      { goalTags: { $in: [searchRegex] } }
    ]
  }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: exercises
  });
});

/**
 * @desc    6. Combined filtering
 * @route   GET /api/exercises/filter
 * @access  Public
 */
const filterExercises = asyncHandler(async (req, res) => {
  const { muscleGroup, equipment, goalTags } = req.query;
  const filter = { isActive: true };

  // Apply filters dynamically if provided
  if (muscleGroup) {
    filter.muscleGroup = muscleGroup;
  }
  
  if (equipment) {
    filter.equipment = equipment;
  }

  if (goalTags) {
    // If client sends multiple tags (e.g. goalTags=fat_loss&goalTags=core),
    // req.query.goalTags could be an array or string. Handle both:
    const tagsArray = Array.isArray(goalTags) ? goalTags : [goalTags];
    
    // $all ensures exercise contains ALL the provided tags
    filter.goalTags = { $all: tagsArray };
  }

  // Utilizes the compound index { muscleGroup: 1, equipment: 1 } if both are present
  const exercises = await Exercise.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: exercises
  });
});

module.exports = {
  getAllExercises,
  getExerciseById,
  getExercisesByMuscleGroup,
  getExercisesByEquipment,
  searchExercises,
  filterExercises
};
