const dotenv = require('dotenv');
dotenv.config();

// Validate Environment before starting (Phase 17)
const validateEnv = require('./config/env');
validateEnv();

const app = require('./app');
const connectDB = require('./config/db');
const cron = require('node-cron');
const { runDailyTipJob } = require('./jobs/dailyTipJob');
const { runWeeklySummaryJob } = require('./jobs/weeklySummaryJob');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Schedule CRON Jobs (Background calls 10 & 11)
    // Sunday 11:30 PM - Compress weekly data (Call 10)
    cron.schedule('30 23 * * 0', () => {
      runWeeklySummaryJob();
    });

    // Monday 6:00 AM - Generate next week plan (Call 11)
    cron.schedule('0 6 * * 1', () => {
      runDailyTipJob(); // Reusing placeholder for now
      console.log('[JOB] Generating next week plan');
    });

  });
});
