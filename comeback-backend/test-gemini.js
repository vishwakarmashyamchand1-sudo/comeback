require('dotenv').config();
const { generateWeek1Plan, generateTomorrowPlan } = require('./services/planGenerationService');

async function runTests() {
  console.log("==========================================");
  console.log("🧪 GEMINI AI TESTING SCRIPT");
  console.log("==========================================\n");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is not set in .env!");
    return;
  }

  // --- TEST 1: Week 1 Plan Generation (Onboarding) ---
  console.log("▶️ TEST 1: Generating Week 1 Plan (Onboarding)");
  const mockUser = {
    primaryGoal: 'Build Muscle',
    fitnessLevel: 'Intermediate',
    currentWeightKg: 75,
    targetWeightKg: 80,
    weeklyPlanSplit: ['Push', 'Pull', 'Legs', 'Rest'],
    injuries: ['Mild lower back pain']
  };
  
  const mockBaseline = {
    benchPressWeight: 60,
    squatWeight: 80
  };

  try {
    const startTime = Date.now();
    const weekPlan = await generateWeek1Plan(mockUser, mockBaseline);
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Success! Response time: ${timeTaken}s`);
    console.log(`📋 Plan Length: ${weekPlan.length} days`);
    console.log(`📄 Sample Day 1 Output:\n`, JSON.stringify(weekPlan[0], null, 2));
  } catch (err) {
    console.error("❌ Test 1 Failed:", err.message);
  }

  console.log("\n------------------------------------------\n");

  // --- TEST 2: Post Workout Summary & Tomorrow's Plan ---
  console.log("▶️ TEST 2: Generating Post-Workout Summary & Tomorrow Plan");
  
  const mockContext = `
  User: Intermediate, 75kg, Goal: Build Muscle.
  Today's Workout: Push Day (Bench Press, Incline Press, OHP).
  Performance: Hit 60kg for 10 reps on Bench (New PR). 
  Feedback: "Felt strong but shoulders are a bit exhausted. Need a good rest or pull day tomorrow."
  `;

  try {
    const startTime2 = Date.now();
    const tomorrowPlan = await generateTomorrowPlan(mockContext);
    const timeTaken2 = ((Date.now() - startTime2) / 1000).toFixed(2);
    
    console.log(`✅ Success! Response time: ${timeTaken2}s`);
    console.log(`💬 Summary Generated: "${tomorrowPlan.summary}"`);
    console.log(`🏋️ Tomorrow's Session: ${tomorrowPlan.tomorrow.sessionType} (Rest? ${tomorrowPlan.tomorrow.isRestDay})`);
    if (!tomorrowPlan.tomorrow.isRestDay) {
      console.log(`📄 First Exercise for Tomorrow: ${tomorrowPlan.tomorrow.exercises[0]?.exerciseName}`);
    }
  } catch (err) {
    console.error("❌ Test 2 Failed:", err.message);
  }
  
  console.log("\n==========================================");
  console.log("🏁 TESTING COMPLETE");
  console.log("==========================================");
}

runTests();
