const asyncHandler = require('express-async-handler');
const Workout = require('../models/Workout');
const Metric = require('../models/Metrics');
const WeeklySummary = require('../models/WeeklySummarize');

/**
 * @desc    Get holistic progress dashboard (Phase 8)
 * @route   GET /api/progress/dashboard
 * @access  Private
 */
const getProgressDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 122. Query Metric documents for this user, sorted by weekNumber
  const metrics = await Metric.find({ userId }).sort({ weekNumber: 1 });

  // 123. Extract histories
  const weightHistory = metrics.map(m => ({ weekNumber: m.weekNumber, weightKg: m.weightKg, date: m.recordedAt }));
  const weeklySessionCounts = metrics.map(m => ({ weekNumber: m.weekNumber, count: m.sessionsCompleted }));
  const weeklyProteinAvgs = metrics.map(m => ({ weekNumber: m.weekNumber, avgProteinG: m.avgDailyProteinG }));

  // 124. Get the most recent WeeklySummary and extract patternInsights
  const recentSummary = await WeeklySummary.findOne({ userId }).sort({ weekNumber: -1 });
  const patternInsights = recentSummary ? recentSummary.patternInsights : [];

  // 125. Query all Metric documents for milestonesEarned — flatten into a single array
  let milestones = [];
  metrics.forEach(m => {
    if (m.milestonesEarned && m.milestonesEarned.length > 0) {
      milestones = milestones.concat(m.milestonesEarned);
    }
  });

  // 126. Calculate currentStreak from Workout documents
  const allCompleted = await Workout.find({ userId, status: 'completed' }).sort({ date: -1 }).select('date');
  let currentStreak = 0;
  if (allCompleted.length > 0) {
    let expectedDate = new Date();
    expectedDate.setUTCHours(0,0,0,0);
    const lastWorkoutDate = new Date(allCompleted[0].date);
    lastWorkoutDate.setUTCHours(0,0,0,0);
    
    // Valid streak if last workout was today or yesterday
    if (Math.abs(expectedDate - lastWorkoutDate) <= (1000 * 60 * 60 * 24)) {
      currentStreak = 1;
      let curr = new Date(lastWorkoutDate);
      for (let i = 1; i < allCompleted.length; i++) {
        let prev = new Date(allCompleted[i].date);
        prev.setUTCHours(0,0,0,0);
        curr.setDate(curr.getDate() - 1);
        if (prev.getTime() === curr.getTime()) currentStreak++;
        else break;
      }
    }
  }

  // Calculate totalSessionsCompleted
  const totalSessionsCompleted = allCompleted.length;

  // 127. Return everything in a single response
  res.status(200).json({
    success: true,
    data: {
      weightHistory,
      weeklySessionCounts,
      weeklyProteinAvgs,
      currentStreak,
      totalSessionsCompleted,
      patternInsights,
      milestones
    }
  });
});

module.exports = {
  getProgressDashboard
};
