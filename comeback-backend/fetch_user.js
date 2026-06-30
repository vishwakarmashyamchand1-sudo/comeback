const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://vishwakarmashyamchand1_db_user:F4DnApUSYzyKuXa2@cluster6.5fnqp2l.mongodb.net/comeback?retryWrites=true&w=majority')
  .then(async () => {
    const user = await User.findOne({ firebaseUid: 'uid_123' }).lean();
    console.log("USER:", JSON.stringify(user, null, 2));
    process.exit(0);
  })
  .catch(err => console.error(err));
