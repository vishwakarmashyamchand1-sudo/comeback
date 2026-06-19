const asyncHandler = require('express-async-handler');
const Metric = require('../models/Metrics');

/**
 * @desc    Log new weekly metric (Phase 6)
 * @route   POST /api/metrics
 * @access  Private
 */
const createMetric = asyncHandler(async (req, res) => {
  const { 
    weekNumber, 
    currentWeightKg, 
    // Schema doesn't have bodyFatPercentage, chestCm etc. so we use what's available
    sessionsCompleted,
    totalSetsLogged,
    avgDailyCalories,
    newPRs
  } = req.body;

  if (!weekNumber) {
    res.status(400);
    throw new Error('Please provide weekNumber');
  }

  let metric = await Metric.findOne({ userId: req.user._id, weekNumber });
  if (metric) {
    res.status(400);
    throw new Error('Metrics already logged for this week.');
  }

  // Calculate BMI and Delta logic could be added here later if past metric exists
  let weightDeltaKg = 0;
  const lastMetric = await Metric.findOne({ userId: req.user._id }).sort({ weekNumber: -1 });
  if (lastMetric && currentWeightKg) {
    weightDeltaKg = currentWeightKg - lastMetric.weightKg;
  }

  metric = await Metric.create({
    userId: req.user._id,
    weekNumber,
    weightKg: currentWeightKg,
    weightDeltaKg,
    sessionsCompleted: sessionsCompleted || 0,
    totalSetsLogged: totalSetsLogged || 0,
    avgDailyCalories: avgDailyCalories || 0,
    newPRs: newPRs || []
  });

  res.status(201).json({
    success: true,
    data: metric
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
