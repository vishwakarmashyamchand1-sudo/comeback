const mongoose = require('mongoose');
const User = require('./models/User.js');

async function checkNames() {
  await mongoose.connect('mongodb://localhost:27017/fitcoach');
  const users = await User.find({});
  for (let user of users) {
    console.log(`Email: ${user.email}, Name: "${user.name}"`);
  }
  console.log('Done');
  process.exit(0);
}

checkNames();
