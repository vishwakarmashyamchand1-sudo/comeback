/**
 * Job: Weekly Summary Generator
 * Frequency: Weekly on Sunday at 11:30 PM (cron: '30 23 * * 0')
 * Purpose: Aggregates week data and calls Claude to generate compressed summaries
 */
const User = require('../models/User');
const Workout = require('../models/Workout');
const DietLog = require('../models/DietLog');
const WeeklySummary = require('../models/WeeklySummarize');

// Helper function to delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runWeeklySummaryJob = async () => {
  console.log('[JOB] Starting Weekly Compression Job (Call 10)...');

  try {
    // 136. Get all users where onboardingComplete: true
    const users = await User.find({ onboardingComplete: true });

    if (users.length === 0) {
      console.log('[JOB] No users found requiring compression. Exiting.');
      return;
    }

    const past7Days = new Date();
    past7Days.setDate(past7Days.getDate() - 7);

    // 137. For each user (run sequentially with a small delay)
    for (const user of users) {
      try {
        console.log(`[JOB] Processing user: ${user._id}`);

        // 138. Fetch all Workout documents for this user for the past 7 days
        const recentWorkouts = await Workout.find({
          userId: user._id,
          date: { $gte: past7Days }
        });

        // 139. Fetch all DietLog documents for the past 7 days
        const recentDietLogs = await DietLog.find({
          userId: user._id,
          date: { $gte: past7Days }
        });

        // 140. Build the compression prompt (mocking the JSON payload construction)
        const rawWeekData = {
          workouts: recentWorkouts,
          diets: recentDietLogs
        };

        // 141. Call Claude API. (MOCK RESPONSE)
        const mockClaudeSummary = {
          sessionsCompleted: recentWorkouts.filter(w => w.status === 'completed').length,
          peakLifts: { bench: 100, squat: 140 }, // mock
          plannedVsActual: { missedSets: 2 }, // mock
          feelPattern: "High energy on push days", // mock
          avgProtein: 150, // mock
          dietPattern: "Missed protein target on weekend", // mock
          compressedSummary: "Solid week overall. Nailed protein goals M-F but fell off on weekend."
        };

        // 142 & 143. Create or upsert a WeeklySummary document
        await WeeklySummary.findOneAndUpdate(
          { userId: user._id, weekNumber: user.currentWeekNumber || 1 },
          {
            $set: {
              weekStart: past7Days,
              weekEnd: new Date(),
              compressedSummary: mockClaudeSummary.compressedSummary,
              sessionsCompleted: mockClaudeSummary.sessionsCompleted,
              peakLifts: mockClaudeSummary.peakLifts,
              plannedVsActual: mockClaudeSummary.plannedVsActual,
              feelPattern: mockClaudeSummary.feelPattern,
              avgProtein: mockClaudeSummary.avgProtein,
              dietPattern: mockClaudeSummary.dietPattern
            }
          },
          { upsert: true, new: true }
        );

        console.log(`[JOB] Successfully processed user: ${user._id}`);
      } catch (err) {
        // Important Notes: If Claude fails for a user: log the error and continue
        console.error(`[JOB] Error processing user ${user._id}:`, err.message);
      }

      // Important Notes: Add a 2-second delay between each user's Claude call
      await sleep(2000);
    }

    // 144. Log completion
    console.log('[JOB] Weekly Compression Job completed successfully.');
  } catch (error) {
    console.error('[JOB] FATAL Error running Weekly Compression Job:', error);
  }
};

module.exports = { runWeeklySummaryJob };
