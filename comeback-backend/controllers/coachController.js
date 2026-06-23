const asyncHandler = require('express-async-handler');
const { handleUserQuery, getPendingPlan, clearPendingPlan } = require('../services/coachChatService');
const Workout = require('../models/Workout');

/**
 * @desc    Coach chat message (Call 08 placeholder)
 * @route   POST /api/coach/chat
 * @access  Private
 */
const coachChat = asyncHandler(async (req, res) => {
  const { message, conversationHistory, intent } = req.body;
  
  if (!message || !conversationHistory || !Array.isArray(conversationHistory)) {
    res.status(400);
    throw new Error('Please provide a message and a conversationHistory array');
  }

  // Calls the AI service
  const response = await handleUserQuery(message, req.user, conversationHistory, intent);

  res.status(200).json({
    success: true,
    data: response
  });
});

/**
 * @desc    Save chat-modified plan
 * @route   POST /api/coach/confirm-plan
 * @access  Private
 */
const confirmCoachPlan = asyncHandler(async (req, res) => {
  const { pendingPlanId, targetDate } = req.body;

  if (!pendingPlanId || !targetDate) {
    res.status(400);
    throw new Error('Please provide pendingPlanId and targetDate');
  }

  // 1. Retrieve the pending plan
  const plan = getPendingPlan(pendingPlanId);
  if (!plan) {
    res.status(404);
    throw new Error('Pending plan not found or expired');
  }

  // 2. Find the Workout document for targetDate
  const logDate = new Date(targetDate);
  logDate.setUTCHours(0, 0, 0, 0);

  const workout = await Workout.findOne({ userId: req.user._id, date: logDate });
  if (!workout) {
    res.status(404);
    throw new Error('Target workout not found for this date');
  }

  // 3. Replace exercises array with confirmed plan
  workout.exercises = plan;
  workout.planSource = 'coach_chat';

  // 4. Save workout
  await workout.save();

  // 5. Delete pending plan from temp storage
  clearPendingPlan(pendingPlanId);

  res.status(200).json({
    success: true,
    message: "Tomorrow's plan saved successfully",
    workout
  });
});

module.exports = {
  coachChat,
  confirmCoachPlan
};
