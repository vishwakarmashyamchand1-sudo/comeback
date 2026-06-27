require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({}).sort({ createdAt: -1 }).limit(5); // Get latest 5 users
  console.log('Total latest users:', users.length);
  for (const u of users) {
    console.log(`User: ${u.email}`);
    console.log(`  onboardingComplete: ${u.onboardingComplete}, isDiscoveryWeek: ${u.isDiscoveryWeek}`);
    console.log(`  heightCm: ${u.heightCm}, weightKg: ${u.currentWeightKg}, fitnessLevel: ${u.fitnessLevel}, primaryGoal: ${u.primaryGoal}`);
    console.log('---');
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
