/**
 * Job: Weekly Plan Generator (Call 11)
 * Frequency: Weekly on Monday at 6:00 AM (cron: '0 6 * * 1')
 * Purpose: Generates the next 7 days of workouts for all users
 */
const User = require('../models/User');
const Metric = require('../models/Metrics');
const WeeklySummary = require('../models/WeeklySummarize');
const Workout = require('../models/Workout');
const adminAuth = require('../config/firebase');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runWeeklyPlanGeneration = async () => {
  console.log('[JOB] Starting Weekly Plan Generation Job (Call 11)...');

  try {
    // 145. Get all users where onboardingComplete: true
    const users = await User.find({ onboardingComplete: true });

    if (users.length === 0) {
      console.log('[JOB] No users found requiring weekly plans. Exiting.');
      return;
    }

    // 146. For each user:
    for (const user of users) {
      try {
        console.log(`[JOB] Generating plan for user: ${user._id}`);

        // 147. Fetch the last 4 WeeklySummary documents
        const last4Summaries = await WeeklySummary.find({ userId: user._id })
          .sort({ weekNumber: -1 })
          .limit(4);

        // 148. Fetch user's latest weight from Metric (fallback to startWeightKg)
        const latestMetric = await Metric.findOne({ userId: user._id })
          .sort({ weekNumber: -1 });
        const latestWeight = latestMetric ? latestMetric.weightKg : user.startWeightKg;

        // 149. Build the planning prompt (mocking the JSON payload construction)
        const planningContext = {
          profile: user,
          summaries: last4Summaries,
          latestWeight
        };

        // 150. Call Claude API. (MOCK RESPONSE)
        const mockClaude7DayPlan = [
          { day: 1, focus: "Push", exercises: [{ exerciseName: "Bench Press", sets: 3 }] },
          { day: 2, focus: "Pull", exercises: [{ exerciseName: "Pull-ups", sets: 3 }] },
          { day: 3, focus: "Rest", exercises: [] },
          { day: 4, focus: "Legs", exercises: [{ exerciseName: "Squats", sets: 3 }] },
          { day: 5, focus: "Full Body", exercises: [{ exerciseName: "Deadlift", sets: 3 }] },
          { day: 6, focus: "Rest", exercises: [] },
          { day: 7, focus: "Active Recovery", exercises: [] }
        ];

        // 151. Create 7 new Workout documents (Mon-Sun) with status "planned"
        let baseDate = new Date();
        // Shift to today (Monday), assuming this runs on Monday morning.
        
        for (let i = 0; i < 7; i++) {
          let workoutDate = new Date(baseDate);
          workoutDate.setDate(workoutDate.getDate() + i);
          workoutDate.setUTCHours(0, 0, 0, 0);

          let dayPlan = mockClaude7DayPlan[i];

          await Workout.findOneAndUpdate(
            { userId: user._id, date: workoutDate },
            {
              $set: {
                splitType: dayPlan.focus,
                status: 'planned',
                planSource: 'weekly_ai_batch',
                exercises: dayPlan.exercises.map((ex, idx) => ({
                  exerciseName: ex.exerciseName,
                  muscleGroup: dayPlan.focus,
                  orderIndex: idx,
                  sets: Array.from({ length: ex.sets }).map((_, sIdx) => ({
                    setNumber: sIdx + 1,
                    plannedReps: 10,
                    plannedWeight: 20
                  }))
                }))
              }
            },
            { upsert: true, new: true }
          );
        }

        // 152. Increment User.currentWeekNumber
        const nextWeek = (user.currentWeekNumber || 1) + 1;
        await User.findByIdAndUpdate(user._id, { currentWeekNumber: nextWeek });

        // 153. Send a push notification (Mocking FCM Call)
        console.log(`[FCM-MOCK] Push Notification sent to ${user.email}: "Your Week ${nextWeek} plan is ready 💪"`);

        console.log(`[JOB] Successfully generated plan for user: ${user._id}`);
      } catch (err) {
        // Log error and continue to next user
        console.error(`[JOB] Error processing user ${user._id}:`, err.message);
      }

      // Important Notes: 2 second delay between calls
      await sleep(2000);
    }

    console.log('[JOB] Weekly Plan Generation Job completed successfully.');
  } catch (error) {
    console.error('[JOB] FATAL Error running Weekly Plan Generation Job:', error);
  }
};

module.exports = { runWeeklyPlanGeneration };
