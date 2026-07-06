const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

/**
 * Service: Plan Generation
 * Purpose: Connects with Antigravity (Gemini) to generate workout plans.
 */

// 1. Generate Week 1 Plan (Called during Onboarding)
const generateWeek1Plan = async (user, baselineData, isRetry = false) => {
  try {
    console.log('[Antigravity] Generating 7-day Week 1 plan...');
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Call 01 Prompt (Returning User with Baseline) vs Call 02 Prompt (Beginner)
    const isReturning = baselineData && Object.keys(baselineData).length > 0;
    
    let prompt = `You are Comeback, an elite personal trainer.
Create a 7-day workout plan for a new user starting their journey.
You MUST return ONLY a valid JSON array of 7 objects (one for each day, starting with Day 1). Do not include markdown code blocks.

User Profile:
- Goal: ${user.primaryGoal} (Urgency: ${user.urgencyLevel || 'Normal'}, Event: ${user.upcomingEvent || 'None'})
- Experience: ${user.fitnessLevel} (Last Active: ${user.lastActive || 'Not specified'})
- Gender: ${user.gender || 'Not specified'}
- Height: ${user.heightCm ? user.heightCm + 'cm' : 'Not specified'}
- Weight: ${user.currentWeightKg}kg (Target: ${user.targetWeightKg}kg by ${user.targetDate ? new Date(user.targetDate).toLocaleDateString() : 'Not specified'})
- Equipment Access: ${user.equipmentAccess || 'Full Gym'}
- Days Per Week: ${user.daysPerWeek || 'Not specified'}
- Preferred Workout Time: ${user.preferredTime || 'Not specified'}
- Split: Please determine the optimal 7-day split based on their Experience and Days Per Week.
- Injuries/Medical: ${(user.injuries || []).join(', ')} | ${(user.medicalConditions || []).join(', ')}
- Exercises to Avoid: ${user.exercisesToAvoid || 'None'}
- Strongest Muscle: ${user.strongestMuscle || 'Not specified'}
- Weakest Muscle: ${user.weakestMuscle || 'Not specified'}
`;

    if (isReturning) {
      prompt += `- Baseline Data: ${JSON.stringify(baselineData)}\n`;
      prompt += `Important: Since they are a returning user, use their baseline lifts to estimate challenging starting weights for their core lifts.\n`;
    } else {
      prompt += `- Baseline Data: None provided (Beginner)\n`;
      prompt += `Important: Since they are a beginner, suggest lighter weights (e.g. 5-10kg), machines, or bodyweight exercises to safely build their foundation. Keep the volume manageable.\n`;
    }

    prompt += `
Each of the 7 daily objects must match this schema:
- 'dayName' (string: e.g., "Day 1")
- 'sessionType' (string: e.g., "Push Day", "Rest")
- 'isRestDay' (boolean)
- 'exercises' (array of objects, empty if rest day)
  - 'exerciseName' (string)
  - 'muscleGroup' (string)
  - 'sets' (array of objects: 'setNumber' (number), 'plannedReps' (number), 'plannedWeight' (number)). CRITICAL: Do NOT make every set identical! You must simulate progressive overload or warm-ups (e.g., Set 1: 15 reps @ 10kg, Set 2: 12 reps @ 15kg, Set 3: 10 reps @ 20kg).
  - 'antigravityReasoning' (string)
  - 'benefits' (string)`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    try {
      const parsedPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
      console.log('[Antigravity] Successfully generated Week 1 plan.');
      return parsedPlan;
    } catch (parseError) {
      if (!isRetry) {
        console.warn("[Antigravity Warning] JSON parsing failed. Retrying once...");
        return await generateWeek1Plan(user, baselineData, true);
      }
      throw new Error("JSON parsing failed twice.");
    }
    
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

// 3. Generate Daily Nutrition Tip
const generateDietTip = async (mealsData, totals, proteinAvg) => {
  try {
    console.log('[Antigravity] Generating daily nutrition tip...');
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    let prompt = `You are Comeback, an elite personal trainer and nutritionist.
The user has logged their meals for today. Provide a SINGLE, concise 1-2 sentence nutrition tip or encouraging remark.
Do NOT use markdown, emojis, or formatting. Just plain text.

Today's Running Totals:
- Calories: ${Math.round(totals.calories || 0)} kcal
- Protein: ${Math.round(totals.proteinG || 0)}g
- Carbs: ${Math.round(totals.carbsG || 0)}g
- Fats: ${Math.round(totals.fatG || 0)}g
- Water: ${totals.waterGlasses || 0} glasses

Today's Meals:
${mealsData.map(m => `- ${m.mealType}: ${m.totalCalories} kcal, ${m.totalProteinG}g protein. Items: ${m.items.map(it => it.name).join(', ')}`).join('\n')}

Last 3-Day Protein Average: ${Math.round(proteinAvg || 0)}g

Give a specific, practical, and highly personalized tip based on this data.`;

    const result = await model.generateContent(prompt);
    const tip = result.response.text().trim();
    return tip;
  } catch (error) {
    console.error("[Antigravity Error]:", error);
    return "Keep up the great work with your nutrition today!"; // Fallback tip
  }
};

module.exports = {
  generateWeek1Plan,
  generateTomorrowPlan,
  generateDietTip
};
