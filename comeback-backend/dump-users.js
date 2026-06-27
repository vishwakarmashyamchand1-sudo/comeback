const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/comeback').then(async () => {
  const users = await User.find({});
  console.log(JSON.stringify(users, null, 2));
  process.exit();
});
