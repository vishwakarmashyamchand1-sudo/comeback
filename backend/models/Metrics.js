// models/Metric.js
const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({

  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekNumber: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now },

  // ── Weekly Weight ─────────────────────────────
  weightKg:      { type: Number },  // Monday check-in
  weightDeltaKg: { type: Number },  // vs last week (negative = lost weight)
  bmi:           { type: Number },  // calculated: weight / (height/100)^2

  // ── Weekly Workout Stats ──────────────────────
  sessionsCompleted: { type: Number, default: 0 },
  totalSetsLogged:   { type: Number, default: 0 },
  avgSessionRating:  { type: Number },

  // ── Weekly Nutrition Stats ────────────────────
  avgDailyCalories:  { type: Number },
  avgDailyProteinG:  { type: Number },
  avgWaterGlasses:   { type: Number },

  // ── Personal Records (PRs) this week ─────────
  newPRs: [{
    exerciseName: { type: String },
    previousBest: { type: String },  // '10kg x 10 reps'
    newBest:      { type: String },  // '12kg x 10 reps'
    achievedAt:   { type: Date },
    _id: false
  }],

  // ── Milestone Badges ─────────────────────────
  milestonesEarned: [{
    badgeId:      { type: String },   // e.g. 'first_week', 'first_kg_lost', 'streak_5'
    badgeName:    { type: String },   // e.g. 'Week 1 Complete!'
    badgeEmoji:   { type: String },   // e.g. '🏆'
    earnedAt:     { type: Date },
    _id: false
  }],

}, { timestamps: true });

MetricSchema.index({ userId: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('Metric', MetricSchema);