const asyncHandler = require('express-async-handler');
const Metric = require('../models/Metrics');
const User = require('../models/User');
const WeeklySummary = require('../models/WeeklySummarize');

/**
 * @desc    Log Monday weight and generate weekly report
 * @route   POST /api/progress/weight-checkin
 * @access  Private
 */
const createMetric = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Metric = require('../models/Metrics');
  const WeeklySummary = require('../models/WeeklySummarize');

  const { weightKg } = req.body;

  if (!weightKg) {
    res.status(400);
    throw new Error('Please provide weightKg');
  }

  // Securely fetch User
  const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const weekNumber = user.currentWeekNumber || 1;

  // 128. Find or create this week's Metric document
  let metric = await Metric.findOne({ userId: user._id, weekNumber });
  if (!metric) {
    metric = new Metric({ userId: user._id, weekNumber });
  }

  // 129. Save weightKg
  metric.weightKg = weightKg;

  // 130. Find last week's Metric to calculate weightDeltaKg
  let weightDeltaKg = 0;
  const lastMetric = await Metric.findOne({ userId: user._id, weekNumber: { $lt: weekNumber } }).sort({ weekNumber: -1 });
  
  if (lastMetric && lastMetric.weightKg) {
    weightDeltaKg = weightKg - lastMetric.weightKg;
    metric.weightDeltaKg = weightDeltaKg;
  }

  // 131. Update User.currentWeightKg
  await User.findByIdAndUpdate(user._id, { currentWeightKg: weightKg });

  // 134. Check and award any new milestone badges
  // Make sure milestonesEarned array exists
  if (!metric.milestonesEarned) {
    metric.milestonesEarned = [];
  }

  // Example: first_kg_lost
  if (weightDeltaKg <= -1 && !metric.milestonesEarned.some(m => m.badgeId === 'first_kg_lost')) {
    metric.milestonesEarned.push({
      badgeId: 'first_kg_lost',
      badgeName: 'First Weight Lost!',
      badgeEmoji: '🔥',
      earnedAt: new Date()
    });
  }

  // Example: back_to_start_weight (if they gained back up to their start weight but we want a positive badge, let's just make one up or strictly use the delta)
  // We'll just stick to first_kg_lost for the mock as requested.
  
  await metric.save();

  // 132. If weekNumber >= 2: fetch last 4 WeeklySummary documents and call Claude (Call 09)
  let patternInsights = null;
  let weeklyReport = {
    headline: weightDeltaKg < 0 ? "Great job losing weight!" : "Keep pushing this week!",
    wins: ["Logged weight consistently"],
    focusNextWeek: "Maintain protein intake"
  };

  if (weekNumber >= 2) {
    // 133. Save patternInsights to this week's WeeklySummary
    // Check if it already has insights so we don't call Claude again
    let weeklySummary = await WeeklySummary.findOne({ userId: user._id, weekNumber });
    
    if (weeklySummary && weeklySummary.patternInsights && weeklySummary.patternInsights.length > 0) {
      // Already generated insights this week, use cache
      patternInsights = weeklySummary.patternInsights;
    } else {
      // MOCK CLAUDE CALL (Call 09)
      patternInsights = [
        {
          title: "Weekend Calories Spike",
          insight: "Your calories are 30% higher on weekends.",
          dataPoint: "avgDailyCalories",
          suggestion: "Try sticking to a 200 calorie buffer on Saturdays."
        }
      ];

      // Save to weekly summary
      weeklySummary = await WeeklySummary.findOneAndUpdate(
        { userId: user._id, weekNumber },
        { 
          $set: { patternInsights },
          $setOnInsert: { 
            weekStart: new Date(), 
            weekEnd: new Date(), 
            compressedSummary: "Placeholder for weekly cron task"
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  // 135. Return everything exactly as requested
  res.status(200).json({
    metric,
    weightDelta: weightDeltaKg,
    patternInsights,
    weeklyReport
  });
});

/**
 * @desc    Get latest metric
 * @route   GET /api/metrics/latest
 * @access  Private
 */
const getLatestMetric = asyncHandler(async (req, res) => {
  const metric = await Metric.findOne({ userId: req.user._id }).sort({ weekNumber: -1 });

  res.status(200).json({
    success: true,
    data: metric || {}
  });
});

/**
 * @desc    Get all metrics history
 * @route   GET /api/metrics/history
 * @access  Private
 */
const getMetricsHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const metrics = await Metric.find({ userId: req.user._id })
    .sort({ weekNumber: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Metric.countDocuments({ userId: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      metrics,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

module.exports = {
  createMetric,
  getLatestMetric,
  getMetricsHistory
};
