const express = require('express');
const router = express.Router();
const {
  getAllExercises,
  getExerciseById,
  getExercisesByMuscleGroup,
  getExercisesByEquipment,
  searchExercises,
  filterExercises
} = require('../controllers/exerciseController');

// NOTE: Specific/Static routes must be declared ABOVE dynamic '/:id' routes
router.get('/search', searchExercises);
router.get('/filter', filterExercises);

router.get('/muscle-group/:muscleGroup', getExercisesByMuscleGroup);
router.get('/equipment/:equipment', getExercisesByEquipment);

router.get('/', getAllExercises);

// Dynamic ID route must be last
router.get('/:id', getExerciseById);

module.exports = router;
