require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({ onboardingComplete: false });
  console.log(`Found ${users.length} users with onboardingComplete = false`);
  for (const u of users) {
    console.log(`Fixing user: ${u.email}`);
    console.log(`  height: ${u.heightCm}, weight: ${u.currentWeightKg}, goal: ${u.primaryGoal}, level: ${u.fitnessLevel}`);
    u.onboardingComplete = true;
    u.isDiscoveryWeek = true;
    u.weeklyPlanSplit = ['full', 'rest', 'full', 'rest', 'full', 'rest', 'rest'];
    await u.save();
  }
  console.log('Done fixing users.');
  process.exit(0);
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
