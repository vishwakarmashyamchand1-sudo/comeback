const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');


/**
 * @desc    Browse exercises with filters (Group 6)
 * @route   GET /api/exercises
 * @access  Private
 */
const getAllExercises = asyncHandler(async (req, res) => {
  const User = require('../models/User'); 
  
  // 1. Fetch the user so we can see their injuries
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 2. Accept query parameters (Step 111)
  const pageNum = parseInt(req.query.page) || 1;
  const limitNum = parseInt(req.query.limit) || 20;
  const skip = (pageNum - 1) * limitNum;
  
  const { muscleGroup, equipment, goalTag, search } = req.query;

  const filter = { isActive: true };

  // 3. Search regex match (Step 112 modified for universal search)
  if (search) {
    // Replace spaces with an expression that matches spaces or underscores
    // so searching "belly fat" matches the "belly_fat" goal tag!
    const flexibleSearch = search.trim().replace(/\s+/g, '[_\\s-]*');
    const searchRegex = new RegExp(flexibleSearch, 'i'); // Case-insensitive
    
    // Search across everything and anything as per Sir's updated instruction
    filter.$or = [
      { name: searchRegex },
      { goalTags: searchRegex },
      { targetMuscle: searchRegex },
      { secondaryMuscles: searchRegex },
      { equipment: searchRegex }
    ];
  }

  // 4. Filters (Step 113)
  // Check muscleGroup, targetMuscle, or bodyPart to make filters extremely robust
  if (muscleGroup) {
    const mgRegex = new RegExp('^' + muscleGroup, 'i');
    if (filter.$or) {
      filter.$and = [
        { $or: filter.$or },
        { $or: [{ muscleGroup: mgRegex }, { targetMuscle: mgRegex }, { bodyPart: mgRegex }] }
      ];
      delete filter.$or;
    } else {
      filter.$or = [
        { muscleGroup: mgRegex },
        { targetMuscle: mgRegex },
        { bodyPart: mgRegex }
      ];
    }
  }
  if (equipment) filter.equipment = new RegExp('^' + equipment + '$', 'i');
  if (goalTag) filter.goalTags = new RegExp('^' + goalTag + '$', 'i');

  // 5. Injury filtering (Step 114)
  // If the user has "plantar_fasciitis", MongoDB will automatically hide jumping exercises!
  if (user.injuries && user.injuries.length > 0) {
    filter.avoidIf = { $nin: user.injuries }; 
  }

  // 6. Execute the massive query
  const exercises = await Exercise.find(filter)
    .select('name gifUrl whyLabel equipment muscleGroup') // Return only required fields (Step 117)
    .sort({ name: 1 }) // Alphabetical sort (Step 115)
    .skip(skip)
    .limit(limitNum); // Paginate (Step 116)

  const total = await Exercise.countDocuments(filter);

  res.status(200).json({
    exercises: exercises,
    total: total
  });
});

/**
 * @desc    Get a single exercise by ID + User History (Group 6)
 * @route   GET /api/exercises/:id
 * @access  Private
 */
const getExerciseById = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  const User = require('../models/User');
  const Workout = require('../models/Workout'); // We need this to search history!
  
  const { id } = req.params;

  // 1. Securely get the user
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 2. Find Exercise (Step 118)
  // (Your friend actually wrote this part well—it allows searching by MongoDB ID or the Source ID)
  let exercise = await Exercise.findOne({ sourceId: id, isActive: true });
  if (!exercise && mongoose.Types.ObjectId.isValid(id)) {
    exercise = await Exercise.findById(id);
    if (exercise && !exercise.isActive) exercise = null; 
  }

  if (!exercise) {
    res.status(404);
    throw new Error('Exercise not found');
  }

  // 3. Query last 3 completed Workouts that contain this exercise (Step 119)
  const pastWorkouts = await Workout.find({
    userId: user._id,
    status: 'completed', // Only count finished workouts
    'exercises.exerciseId': exercise._id
  })
  .sort({ date: -1 }) // Sort by newest date first
  .limit(3);          // Only grab the last 3 times they did it

  // 4. Extract the actual weights and reps (Step 120)
  const userHistory = pastWorkouts.map(workout => {
    // Dig into the workout to find this specific exercise
    const workoutEx = workout.exercises.find(
      ex => ex.exerciseId.toString() === exercise._id.toString()
    );
    
    // Only grab sets that the user actually completed
    const completedSets = workoutEx.sets
      .filter(set => set.completed === true)
      .map(set => ({
        setNumber: set.setNumber,
        reps: set.actualReps,
        weight: set.actualWeight
      }));

    return {
      workoutDate: workout.date,
      sets: completedSets
    };
  });

  // 5. Return full exercise + history (Step 121)
  res.status(200).json({
    exercise: exercise,
    userHistory: userHistory
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

/**
 * @desc    Get dynamic substitutes for an exercise
 * @route   GET /api/exercises/:id/substitutes
 * @access  Private
 */
const getExerciseSubstitutes = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  const { id } = req.params;

  let exercise = await Exercise.findOne({ sourceId: id, isActive: true });
  if (!exercise && mongoose.Types.ObjectId.isValid(id)) {
    exercise = await Exercise.findById(id);
    if (exercise && !exercise.isActive) exercise = null; 
  }

  if (!exercise) {
    res.status(404);
    throw new Error('Exercise not found');
  }

  const limitNum = 4;
  
  // Find up to 4 exercises with the exact same target muscle, excluding the original exercise
  const substitutes = await Exercise.find({
    targetMuscle: exercise.targetMuscle,
    _id: { $ne: exercise._id },
    isActive: true
  })
    .select('name gifUrl whyLabel equipment muscleGroup')
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: substitutes
  });
});

module.exports = {
  getAllExercises,
  getExerciseById,
  getExercisesByMuscleGroup,
  getExercisesByEquipment,
  searchExercises,
  filterExercises,
  getExerciseSubstitutes
};
