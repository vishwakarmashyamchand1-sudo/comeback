const asyncHandler = require('express-async-handler');
const Metric = require('../models/Metrics');
const User = require('../models/User');
const WeeklySummary = require('../models/WeeklySummarize');

/**
 * @desc    Log new weekly metric (Phase 6)
 * @route   POST /api/metrics
 * @access  Private
 */
const createMetric = asyncHandler(async (req, res) => {
  const { 
    weekNumber, 
    weightKg 
  } = req.body;

  if (!weekNumber || !weightKg) {
    res.status(400);
    throw new Error('Please provide weekNumber and weightKg');
  }

  // 1. Find or create this week's Metric document
  let metric = await Metric.findOne({ userId: req.user._id, weekNumber });
  if (!metric) {
    metric = new Metric({ userId: req.user._id, weekNumber });
  }

  // 2. Save weightKg
  metric.weightKg = weightKg;

  // 3. Find last week's Metric to calculate weightDeltaKg
  let weightDeltaKg = 0;
  const lastMetric = await Metric.findOne({ userId: req.user._id, weekNumber: { $lt: weekNumber } }).sort({ weekNumber: -1 });
  if (lastMetric && lastMetric.weightKg) {
    weightDeltaKg = weightKg - lastMetric.weightKg;
    metric.weightDeltaKg = weightDeltaKg;
  }

  // 4. Update User.currentWeightKg
  await User.findByIdAndUpdate(req.user._id, { currentWeightKg: weightKg });

  // 5. Award Milestone Badges (Basic example logic)
  if (weightDeltaKg < 0 && !metric.milestonesEarned.some(m => m.badgeId === 'first_kg_lost')) {
    metric.milestonesEarned.push({
      badgeId: 'first_kg_lost',
      badgeName: 'First Weight Lost!',
      badgeEmoji: '🔥',
      earnedAt: new Date()
    });
  }

  await metric.save();

  // 6. If weekNumber >= 2: fetch last 4 WeeklySummary documents and call Claude (Call 09)
  let patternInsights = null;
  if (weekNumber >= 2) {
    // Simulated AI Call 09: Weekly Pattern Insight Generation
    patternInsights = [
      {
        title: "Weekend Calories Spike",
        insight: "Your calories are 30% higher on weekends.",
        dataPoint: "avgDailyCalories",
        suggestion: "Try sticking to a 200 calorie buffer on Saturdays."
      }
    ];

    // 7. Save patternInsights to this week's WeeklySummary
    await WeeklySummary.findOneAndUpdate(
      { userId: req.user._id, weekNumber },
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

  // 8. Return everything
  res.status(200).json({
    success: true,
    metric,
    weightDelta: weightDeltaKg,
    patternInsights,
    weeklyReport: {
      headline: weightDeltaKg < 0 ? "Great job losing weight!" : "Keep pushing this week!",
      wins: ["Logged weight consistently"],
      focusNextWeek: "Maintain protein intake"
    }
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
