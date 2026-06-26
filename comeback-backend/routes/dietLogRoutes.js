const express = require('express');
const router = express.Router();
const {
  logMeal,
  updateMeal,
  deleteMeal,
  getTodayDiet,
  getDietHistory,
  getDietSummary,
  updateWater,
  getDietTip,
  analyzePhoto
} = require('../controllers/dietLogController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// POST /api/diet/analyze-photo
router.post('/analyze-photo', analyzePhoto);

// POST /api/diet/log-meal
router.post('/log-meal', logMeal);

// 2. PATCH /api/diet/meal/:mealId
router.patch('/meal/:mealId', updateMeal);

// 3. DELETE /api/diet/meal/:mealId
router.delete('/meal/:mealId', deleteMeal);

// 4. GET /api/diet/today
router.get('/today', getTodayDiet);

// 5. GET /api/diet/history
router.get('/history', getDietHistory);

// 6. GET /api/diet/summary
router.get('/summary', getDietSummary);

// 8. PATCH /api/diet/water
router.patch('/water', updateWater);

// 9. GET /api/diet/tip
router.get('/tip', getDietTip);

module.exports = router;
