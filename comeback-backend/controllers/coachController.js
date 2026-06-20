const asyncHandler = require('express-async-handler');
const { handleUserQuery } = require('../services/coachChatService');

/**
 * @desc    Coach chat message (Call 08 placeholder)
 * @route   POST /api/coach/chat
 * @access  Private
 */
const coachChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  // Calls the AI service placeholder
  const response = await handleUserQuery(message, req.user);

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
  const { workoutId, modifiedExercises } = req.body;

  res.status(200).json({
    success: true,
    message: 'Chat-modified plan saved successfully (Placeholder)'
  });
});

module.exports = {
  coachChat,
  confirmCoachPlan
};
