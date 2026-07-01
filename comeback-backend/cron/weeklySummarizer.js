const cron = require('node-cron');
const User = require('../models/User');
const Workout = require('../models/Workout');
const DietLog = require('../models/DietLog');
const WeeklySummary = require('../models/WeeklySummarize');
const Notification = require('../models/Notification');

// Export an initialization function so server.js can start it
const initWeeklySummarizer = () => {
  // Run every Sunday at 11:59 PM
  cron.schedule('59 23 * * 0', async () => {
    console.log('[CRON] Starting Weekly Summarizer for all users...');
    try {
      const users = await User.find({});
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (const user of users) {
        // 1. Fetch raw data for the last 7 days
        const workouts = await Workout.find({ 
          userId: user._id, 
          date: { $gte: oneWeekAgo } 
        }).lean();

        const diets = await DietLog.find({ 
          userId: user._id, 
          date: { $gte: oneWeekAgo } 
        }).lean();

        // 2. Ask Antigravity (Mocking this until we reach Step 6 Prompt Engineering)
        const mockCompressedSummary = "You worked out consistently but missed your protein target on 4 out of 7 days. Next week's focus should be meal prep to hit those protein goals.";
        
        const mockInsights = [
          {
            title: "Protein Deficit",
            insight: "You missed your protein target on 4 days.",
            dataPoint: "avg 80g / 120g",
            suggestion: "Try adding a protein shake after your workouts."
          },
          {
            title: "Great Consistency",
            insight: "You completed 4 workouts this week!",
            dataPoint: "4 sessions",
            suggestion: "Keep up this exact schedule."
          }
        ];

        // We will calculate actual week number based on user join date later
        const weekNumber = 1; 

        // 3. Save to Database
        await WeeklySummary.findOneAndUpdate(
          { userId: user._id, weekNumber: weekNumber },
          {
            userId: user._id,
            weekNumber: weekNumber,
            weekStart: oneWeekAgo,
            weekEnd: new Date(),
            compressedSummary: mockCompressedSummary,
            patternInsights: mockInsights,
            cronRunAt: new Date()
          },
          { upsert: true, new: true }
        );

        // 4. Send Notification to User
        await Notification.create({
          userId: user._id,
          title: "Weekly Insights Ready! 📊",
          message: "Antigravity has finished analyzing your week. Tap here to see your progress and insights for next week.",
          type: "system",
          actionUrl: "/progress/weekly"
        });

        console.log(`[CRON] Processed Weekly Summary for user ${user._id}`);
      }
      
      console.log('[CRON] Weekly Summarizer completed successfully.');
    } catch (error) {
      console.error('[CRON] Error running Weekly Summarizer:', error);
    }
  });
  
  console.log('[CRON] Weekly Summarizer job scheduled for Sunday 11:59 PM.');
};

module.exports = initWeeklySummarizer;
