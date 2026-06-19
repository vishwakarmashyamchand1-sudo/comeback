const express = require('express');
const router = express.Router();
const {
  getCurrentSummary,
  getSummaryHistory
} = require('../controllers/weeklySummaryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/current', getCurrentSummary);
router.get('/history', getSummaryHistory);

module.exports = router;
