const express = require('express');
const router = express.Router();
const { runDailyTipJob } = require('../jobs/dailyTipJob');
const { runWeeklySummaryJob } = require('../jobs/weeklySummaryJob');

/**
 * @desc    Trigger Weekly Summary Job (Manual trigger for CRON Call 10)
 * @route   POST /api/cron/weekly-summary
 */
router.post('/weekly-summary', async (req, res) => {
  await runWeeklySummaryJob();
  res.status(200).json({ success: true, message: 'Weekly summary compression job triggered' });
});

/**
 * @desc    Trigger Next Week Plan Job (Manual trigger for CRON Call 11)
 * @route   POST /api/cron/next-week-plan
 */
router.post('/next-week-plan', async (req, res) => {
  await runDailyTipJob(); // Placeholder logic
  res.status(200).json({ success: true, message: 'Next week plan generation job triggered' });
});

module.exports = router;
