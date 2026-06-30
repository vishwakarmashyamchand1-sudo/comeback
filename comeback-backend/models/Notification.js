const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // The content of the notification
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Categorization
  type: { 
    type: String, 
    enum: ['workout_reminder', 'diet_reminder', 'coach_nudge', 'milestone', 'system'],
    default: 'coach_nudge'
  },
  
  // Read state for the UI Bell icon
  isRead: { type: Boolean, default: false },

  // Optional link if tapping the notification should navigate somewhere (e.g. /workout/today)
  actionUrl: { type: String },

}, { timestamps: true });

// We often query unread notifications for a specific user to show the red dot on the bell icon
NotificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
