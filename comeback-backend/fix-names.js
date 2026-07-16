require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');

async function fixNames() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({ name: 'Athlete' });
  for (let user of users) {
    if (user.email) {
      const prefix = user.email.split('@')[0];
      const newName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      user.name = newName;
      await user.save();
      console.log(`Updated user ${user.email} name to ${newName}`);
    }
  }
  
  const allUsers = await User.find({});
  for (let user of allUsers) {
    console.log(`Email: ${user.email}, Name: "${user.name}"`);
  }
  
  console.log('Done');
  process.exit(0);
}

fixNames();
