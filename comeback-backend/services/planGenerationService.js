const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

/**
 * Service: Plan Generation
 * Purpose: Connects with Antigravity (Gemini) to generate workout plans.
 */

// 1. Generate Week 1 Plan (Called during Onboarding)
const generateWeek1Plan = async (user, baselineData) => {
  try {
    console.log('[Antigravity] Generating 7-day Week 1 plan...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let prompt = `You are Comeback, an elite personal trainer.
Create a 7-day workout plan for a new user starting their journey.
You MUST return ONLY a valid JSON array of 7 objects (one for each day, starting with Day 1). Do not include markdown code blocks.

User Profile:
- Goal: ${user.primaryGoal}
- Experience: ${user.fitnessLevel}
- Weight: ${user.currentWeightKg}kg
- Target Weight: ${user.targetWeightKg}kg
- Split: ${user.weeklyPlanSplit ? user.weeklyPlanSplit.join(', ') : 'Not specified'}
- Injuries: ${(user.injuries || []).join(', ')}
- Baseline Data: ${baselineData ? JSON.stringify(baselineData) : 'None provided'}

Each of the 7 daily objects must match this schema:
- 'dayName' (string: e.g., "Day 1")
- 'sessionType' (string: e.g., "Push Day", "Rest")
- 'isRestDay' (boolean)
- 'exercises' (array of objects, empty if rest day)
  - 'exerciseName' (string)
  - 'muscleGroup' (string)
  - 'sets' (array of objects: 'setNumber' (number), 'plannedReps' (number), 'plannedWeight' (number))
  - 'antigravityReasoning' (string)
  - 'benefits' (string)`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const parsedPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    
    console.log('[Antigravity] Successfully generated Week 1 plan.');
    return parsedPlan;
  } catch (error) {
    console.error("[Antigravity Error]:", error);
    throw new Error("Failed to generate week plan");
  }
};

// 2. Generate Tomorrow Plan & Summary (Called on Workout Complete)
const generateTomorrowPlan = async (contextPayload) => {
  try {
    console.log('[Antigravity] Generating tomorrow plan and today summary...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let prompt = `You are Comeback, an elite personal trainer.
Review the user's Context String, which contains their profile, the last 3 days of workouts, and how they felt today.
You MUST return ONLY a valid JSON object matching this schema. Do not include markdown code blocks.

{
  "summary": "String. A 2-3 sentence honest, encouraging post-workout feedback based on today's performance.",
  "tomorrow": {
    "sessionType": "String. The name of tomorrow's workout (e.g. Pull Day, Legs, Rest)",
    "isRestDay": boolean,
    "exercises": [
      {
        "exerciseName": "String",
        "muscleGroup": "String",
        "sets": [
          { "setNumber": 1, "plannedReps": 10, "plannedWeight": 20 }
        ],
        "antigravityReasoning": "String",
        "benefits": "String"
      }
    ]
  }
}

Here is the Context String:
${contextPayload}

Generate the strict JSON response.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsedPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    
    console.log('[Antigravity] Successfully generated tomorrow plan.');
    return parsedPlan;
  } catch (error) {
    console.error("[Antigravity Error]:", error);
    throw new Error("Failed to generate tomorrow plan");
  }
};

module.exports = {
  generateWeek1Plan,
  generateTomorrowPlan
};
