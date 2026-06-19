const express = require('express');
const router = express.Router();
const {
  createWorkout,
  getTodayWorkout,
  getWorkoutHistory,
  getWorkoutProgress,
  getWorkoutById,
  logSet,
  addExercise,
  skipExercise,
  swapMuscle,
  confirmPlan,
  completeWorkout
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// 1. POST /api/workouts
router.post('/', createWorkout);

// 2. GET /api/workouts/today
router.get('/today', getTodayWorkout);

// 3. GET /api/workouts/history
router.get('/history', getWorkoutHistory);

// 9. GET /api/workouts/progress (Must be before /:id)
router.get('/progress', getWorkoutProgress);

// Call 04: POST /api/workouts/tomorrow/swap-muscle
router.post('/tomorrow/swap-muscle', swapMuscle);

// 4. GET /api/workouts/:id
router.get('/:id', getWorkoutById);

// 5. PATCH /api/workouts/:id/log-set
router.patch('/:id/log-set', logSet);

// 6. POST /api/workouts/:id/add-exercise
router.post('/:id/add-exercise', addExercise);

// 7. PATCH /api/workouts/:id/skip-exercise
router.patch('/:id/skip-exercise', skipExercise);

// PATCH /api/workouts/:id/confirm
router.patch('/:id/confirm', confirmPlan);

// 8. POST /api/workouts/:id/complete
router.post('/:id/complete', completeWorkout);

module.exports = router;
