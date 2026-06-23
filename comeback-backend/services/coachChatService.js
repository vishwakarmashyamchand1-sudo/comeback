const crypto = require('crypto');

/**
 * Temporary In-Memory Storage for Pending Plans
 * Since Redis is not installed, we use a Map.
 * Key: pendingPlanId
 * Value: { plan: Array, expiresAt: Date }
 */
const pendingPlans = new Map();

/**
 * Service: Coach Chat
 * Purpose: Handles conversational queries from the user acting as an AI Coach
 */
const handleUserQuery = async (query, userContext, conversationHistory, intent) => {
  // 1. Build context (Mocking this step for now)
  console.log(`Building context for user ${userContext._id}...`);
  console.log(`Conversation history length: ${conversationHistory?.length || 0}`);

  let replyText = "I am your AI coach. How can I help you today?";
  let pendingPlanId = null;

  // 2. Mocking Call 08 Claude API Logic
  if (intent === 'modify_tomorrow') {
    // Simulate detecting a workout plan JSON block from Claude's response
    replyText = "I've modified tomorrow's workout to accommodate your shoulder pain. Here is the updated plan for you to review.";
    
    const simulatedPlan = [
      {
        "exerciseId": "60d5ecb8b392d700153c3000", // Mock ID, frontend should ideally send actual valid ObjectIds if it knows them, or backend resolves. We will just pass it through.
        "exerciseName": "Light Dumbbell Press",
        "muscleGroup": "Shoulders",
        "orderIndex": 1,
        "sets": [
          { "setNumber": 1, "plannedReps": 15, "plannedWeight": 5 },
          { "setNumber": 2, "plannedReps": 15, "plannedWeight": 5 }
        ]
      }
    ];

    // 3. Store temporarily with a 30-min TTL
    pendingPlanId = crypto.randomBytes(8).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    
    pendingPlans.set(pendingPlanId, {
      plan: simulatedPlan,
      expiresAt
    });

    // Cleanup expired plans periodically (simple garbage collection)
    for (const [key, value] of pendingPlans.entries()) {
      if (value.expiresAt < new Date()) {
        pendingPlans.delete(key);
      }
    }
  } else {
    // Normal conversational response
    replyText = `You said: "${query}". (This is a mock response from the Coach AI).`;
  }

  return { 
    reply: replyText,
    pendingPlanId
  };
};

/**
 * Retrieve and validate a pending plan
 */
const getPendingPlan = (planId) => {
  const data = pendingPlans.get(planId);
  if (!data) return null;
  
  if (data.expiresAt < new Date()) {
    pendingPlans.delete(planId);
    return null;
  }
  
  return data.plan;
};

/**
 * Clear a pending plan
 */
const clearPendingPlan = (planId) => {
  pendingPlans.delete(planId);
};

module.exports = {
  handleUserQuery,
  getPendingPlan,
  clearPendingPlan
};
