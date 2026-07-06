const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllExercises,
  getExerciseById,
  getExerciseSubstitutes
} = require('../controllers/exerciseController');

// 1. Activate the Bouncer! (The Sir requested: "Auth required: Yes")
router.use(protect);

// 2. The Master Catalog Route
router.get('/', getAllExercises);

// 3. Get substitutes
router.get('/:id/substitutes', getExerciseSubstitutes);

// 4. Get single exercise (must be at the bottom)
router.get('/:id', getExerciseById);

module.exports = router;