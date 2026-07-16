const User = require('../models/User');
const Workout = require('../models/Workout');
const DietLog = require('../models/DietLog');
const WeeklySummary = require('../models/WeeklySummarize'); 

async function buildUserContext(userId, targetDate) {
  // Set up today's boundaries for querying
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Set up 3 days ago boundary
  const threeDaysAgo = new Date(startOfDay);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // 1. Get User Profile Basics
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  // 2. Get Last 3 Days of Workouts (including today)
  const recentWorkouts = await Workout.find({
    userId,
    date: { $gte: threeDaysAgo, $lte: endOfDay }
  }).sort({ date: 1 }).lean();

  // 3. Get Today's Diet Log
  const todayDiet = await DietLog.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).lean();

  // 4. Get the last 3 Weekly Summaries
  const pastSummaries = await WeeklySummary.find({ userId })
    .sort({ weekNumber: -1 })
    .limit(3)
    .lean();

  // 5. Construct the final Payload String for Antigravity
  let payload = `--- USER PROFILE ---\n`;
  payload += `Goal: ${user.primaryGoal || 'Not specified'}\n`;
  payload += `Current Weight: ${user.currentWeightKg}kg (Target: ${user.targetWeightKg}kg)\n`;
  payload += `Injuries/Conditions: ${(user.injuries || []).join(', ')}\n`;
  payload += `Diet: ${user.dietType}, Restrictions: ${(user.foodRestrictions || []).join(', ')}\n\n`;

  payload += `--- TODAY'S DIET ---\n`;
  if (todayDiet) {
    payload += `Calories Consumed: ${todayDiet.totalCalories} / Target: ${user.dailyCalorieTarget}\n`;
    payload += `Protein Consumed: ${todayDiet.totalProteinG}g / Target: ${user.dailyProteinTarget}g\n`;
  } else {
    payload += `No food logged yet today.\n`;
  }
  payload += `\n`;

  payload += `--- RECENT WORKOUTS (LAST 3 DAYS) ---\n`;
  if (recentWorkouts.length > 0) {
    recentWorkouts.forEach(w => {
      const wDate = new Date(w.date).toDateString();
      payload += `[${wDate}] Session: ${w.sessionType || 'General'} - Status: ${w.status}\n`;
      if (w.status === 'completed') {
        payload += `  Rating: ${w.sessionRating || 'N/A'}/10, Feel: ${w.sessionFeel || 'N/A'}\n`;
        if (w.exercises && w.exercises.length > 0) {
          payload += `  Exercises Details:\n`;
          w.exercises.forEach(ex => {
            const isSkipped = ex.wasSkipped;
            const completedSets = ex.sets ? ex.sets.filter(s => s.completed).length : 0;
            const totalSets = ex.sets ? ex.sets.length : 3;
            
            let exStatus = 'Completed';
            if (isSkipped) exStatus = 'Skipped (user did not do it)';
            else if (completedSets === 0) exStatus = 'Skipped (no sets completed)';
            else if (completedSets < totalSets) exStatus = `Partially Completed (${completedSets}/${totalSets} sets)`;
            else exStatus = `Fully Completed (${completedSets}/${totalSets} sets)`;

            payload += `    - ${ex.exerciseName}: ${exStatus}\n`;
          });
        }
      }
    });
  } else {
    payload += `No recent workouts found.\n`;
  }
  payload += `\n`;

  payload += `--- HISTORICAL CONTEXT (LAST 3 WEEKS) ---\n`;
  if (pastSummaries.length > 0) {
    pastSummaries.forEach(summary => {
      payload += `Week ${summary.weekNumber}:\n${summary.compressedSummary}\n\n`;
    });
  } else {
    payload += `New user. No historical weekly summaries yet.\n`;
  }
  
  // Find what is currently scheduled in the DB for tomorrow
  const tomorrowDate = new Date(targetDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  tomorrowDate.setUTCHours(0, 0, 0, 0);
  const nextDayMidnight = new Date(tomorrowDate);
  nextDayMidnight.setDate(nextDayMidnight.getDate() + 1);
  
  const tomorrowPlan = await Workout.findOne({
    userId,
    date: { $gte: tomorrowDate, $lt: nextDayMidnight }
  }).lean();
  
  payload += `\n--- SCHEDULE ---\n`;
  if (tomorrowPlan) {
    payload += `Tomorrow is pre-scheduled as: "${tomorrowPlan.sessionType}". You MUST generate this exact session type (e.g. if it says Pull Day, generate a Pull Day. If it says Rest, generate Rest). ONLY change it if the user specifically mentions an extreme injury today that requires urgent rest.\n`;
  }

  return payload;
}

module.exports = { buildUserContext };
