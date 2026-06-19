const asyncHandler = require('express-async-handler');
const WeeklySummary = require('../models/WeeklySummarize');

/**
 * @desc    Get current (latest) weekly summary
 * @route   GET /api/weekly-summary/current
 * @access  Private
 */
const getCurrentSummary = asyncHandler(async (req, res) => {
  // Sort by weekNumber descending to get the most recent one
  const summary = await WeeklySummary.findOne({ userId: req.user._id }).sort({ weekNumber: -1 });

  res.status(200).json({
    success: true,
    data: summary || {}
  });
});

/**
 * @desc    Get weekly summary history (Paginated)
 * @route   GET /api/weekly-summary/history
 * @access  Private
 */
const getSummaryHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const summaries = await WeeklySummary.find({ userId: req.user._id })
    .sort({ weekNumber: -1 })
    .skip(skip)
    .limit(limit);

  const total = await WeeklySummary.countDocuments({ userId: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      summaries,
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
  getCurrentSummary,
  getSummaryHistory
};
