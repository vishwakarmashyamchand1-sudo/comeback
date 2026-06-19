const asyncHandler = require('express-async-handler');
const Workout = require('../models/Workout');
const DietLog = require('../models/DietLog');
const Metric = require('../models/Metrics');

/**
 * @desc    Get holistic progress dashboard (Phase 8)
 * @route   GET /api/progress/dashboard
 * @access  Private
 */
const getProgressDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Total Workouts & Completion Percentage
  const totalWorkouts = await Workout.countDocuments({ userId });
  const completedWorkouts = await Workout.countDocuments({ userId, status: 'completed' });
  const completionPercentage = totalWorkouts > 0 ? ((completedWorkouts / totalWorkouts) * 100).toFixed(2) : 0;

  // 2. Workout Streak (simplified logic)
  const allCompleted = await Workout.find({ userId, status: 'completed' }).sort({ date: -1 }).select('date');
  let streak = 0;
  if (allCompleted.length > 0) {
    let expectedDate = new Date();
    expectedDate.setUTCHours(0,0,0,0);
    const lastWorkoutDate = new Date(allCompleted[0].date);
    lastWorkoutDate.setUTCHours(0,0,0,0);
    
    // Valid streak if last workout was today or yesterday
    if (Math.abs(expectedDate - lastWorkoutDate) <= (1000 * 60 * 60 * 24)) {
      streak = 1;
      let curr = new Date(lastWorkoutDate);
      for (let i = 1; i < allCompleted.length; i++) {
        let prev = new Date(allCompleted[i].date);
        prev.setUTCHours(0,0,0,0);
        curr.setDate(curr.getDate() - 1);
        if (prev.getTime() === curr.getTime()) streak++;
        else break;
      }
    }
  }

  // 3. Weight Trend (last 10 metrics)
  const metrics = await Metric.find({ userId }).sort({ weekNumber: 1 }).limit(10).select('weekNumber weightKg');
  const weightTrend = metrics.map(m => ({ week: m.weekNumber, weight: m.weightKg }));

  // 4. Total Calories & Average Protein (last 7 days average)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setUTCHours(0,0,0,0);
  
  const dietLogs = await DietLog.find({ userId, date: { $gte: sevenDaysAgo } });
  
  let totalCalories7d = 0;
  let totalProtein7d = 0;
  
  dietLogs.forEach(log => {
    totalCalories7d += log.totalCalories || 0;
    totalProtein7d += log.totalProteinG || 0;
  });

  const avgProtein = dietLogs.length > 0 ? (totalProtein7d / dietLogs.length).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalWorkouts,
      completionPercentage: `${completionPercentage}%`,
      streak,
      weightTrend,
      totalCalories7d,
      avgProtein7d: parseFloat(avgProtein)
    }
  });
});

module.exports = {
  getProgressDashboard
};
