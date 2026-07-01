const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateWorkoutPlan } = require('./planGenerationService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

const pendingPlans = new Map();

/**
 * Service: Coach Chat
 * Purpose: Handles conversational queries from the user acting as an AI Coach
 */
const handleUserQuery = async (query, userContextString, conversationHistory, intent) => {
  let replyText = "";
  let pendingPlanId = null;
  let simulatedPlan = null;

  if (intent === 'modify_tomorrow') {
    // 1. If they ask to change the workout, we use Step 5's logic!
    replyText = "I've modified tomorrow's workout to accommodate your request. Here is the updated plan for you to review.";
    simulatedPlan = await generateWorkoutPlan(userContextString);

    pendingPlanId = crypto.randomBytes(8).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); 
    
    pendingPlans.set(pendingPlanId, {
      plan: simulatedPlan,
      expiresAt
    });

  } else {
    // 2. Open-Ended Chat with Gemini
    console.log('[Antigravity Chat] Sending user query to Gemini...');

    // Format previous messages for Gemini. Gemini expects 'user' or 'model'.
    const formattedHistory = (conversationHistory || []).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are Comeback, a friendly, gentle, and highly encouraging personal fitness coach. 
        You are talking to your client right now.
        
        RULES:
        1. Always keep your answers extremely concise (under 3 or 4 sentences). The user might be at the gym and reading this quickly.
        2. Be extremely supportive and understanding. Praise their efforts and gently guide them back on track if they slip up.
        3. ALWAYS review their Context below before answering so you know their injuries, goals, and history.
        
        USER CONTEXT:
        ${userContextString}`
      });

      const chat = model.startChat({
        history: formattedHistory
      });

      const result = await chat.sendMessage(query);
      replyText = result.response.text().trim();
    } catch (error) {
      console.error("[Antigravity Chat Error]:", error);
      replyText = "I'm having a little trouble connecting right now, but I'm here for you! Let's try again in a moment.";
    }
  }

  // Cleanup expired plans
  for (const [key, value] of pendingPlans.entries()) {
    if (value.expiresAt < new Date()) {
      pendingPlans.delete(key);
    }
  }

  return { 
    reply: replyText,
    workoutPlanJson: simulatedPlan,
    pendingPlanId
  };
};

const getPendingPlan = (planId) => {
  const data = pendingPlans.get(planId);
  if (!data || data.expiresAt < new Date()) {
    pendingPlans.delete(planId);
    return null;
  }
  return data.plan;
};

const clearPendingPlan = (planId) => {
  pendingPlans.delete(planId);
};

module.exports = {
  handleUserQuery,
  getPendingPlan,
  clearPendingPlan
};
