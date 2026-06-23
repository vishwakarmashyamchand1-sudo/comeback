const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllExercises,
  getExerciseById
} = require('../controllers/exerciseController');

// 1. Activate the Bouncer! (The Sir requested: "Auth required: Yes")
router.use(protect);

// 2. The Master Catalog Route
router.get('/', getAllExercises);

// 3. Get single exercise (must be at the bottom)
router.get('/:id', getExerciseById);

module.exports = router;