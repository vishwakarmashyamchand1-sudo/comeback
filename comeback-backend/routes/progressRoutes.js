const express = require('express');
const router = express.Router();
const { getProgressOverview } = require('../controllers/progressController');
const { createMetric } = require('../controllers/metricController');
const { protect } = require('../middleware/authMiddleware');
const { runWeeklySummaryJob } = require('../jobs/weeklySummaryJob');
const { runWeeklyPlanGeneration } = require('../jobs/weeklyPlanJob');

router.use(protect);

router.get('/overview', getProgressOverview);
router.post('/weight-checkin', createMetric);

// HIDDEN DEVELOPER ROUTE: Manually trigger the Sunday night cron job for testing!
router.post('/test-cron', async (req, res) => {
  // Fire the background job (don't await it so we don't block the response)
  runWeeklySummaryJob();
  res.status(200).json({ message: "Background Cron Job manually triggered! Check your backend terminal for the logs." });
});

// HIDDEN DEVELOPER ROUTE: Manually trigger the Monday morning cron job for testing!
router.post('/test-cron-monday', async (req, res) => {
  runWeeklyPlanGeneration();
  res.status(200).json({ message: "Monday Plan Generation Cron manually triggered! Check backend terminal for logs." });
});

module.exports = router;
