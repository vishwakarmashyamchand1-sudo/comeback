// models/WeeklySummary.js
const mongoose = require('mongoose');

const WeeklySummarySchema = new mongoose.Schema({

  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekNumber: { type: Number, required: true },
  weekStart:  { type: Date, required: true },  // Monday date of that week
  weekEnd:    { type: Date, required: true },  // Sunday date of that week

  // ── Workout Summary ───────────────────────────
  sessionsCompleted:  { type: Number, default: 0 },
  sessionsPlanned:    { type: Number, default: 0 },
  sessionsMissed:     { type: Number, default: 0 },

  // Peak lifts this week — one entry per exercise
  peakLifts: [{
    exerciseName: { type: String },
    weightKg:     { type: Number },
    reps:         { type: Number },
    _id: false
  }],

  // Planned vs Actual deltas — core of pattern analysis
  plannedVsActual: {
    skippedExercises:    [{ type: String }],
    underperformed:      [{ type: String }], // 'Leg press: planned 40kg, did 30kg'
    overperformed:       [{ type: String }], // 'Chest press: planned 10kg, did 12kg'
    userAddedExercises:  [{ type: String }],
  },

  // Session feel patterns
  feelPattern: { type: String }, // e.g. 'Hard on Thu and Fri consistently'
  sessionRatings: [{
    day:    { type: String },
    rating: { type: Number },
    feel:   { type: String },
    _id: false
  }],

  // ── Diet Summary ──────────────────────────────
  avgDailyCalories: { type: Number },
  avgDailyProteinG: { type: Number },
  avgDailyWaterGlasses: { type: Number },
  dietPattern: { type: String }, // e.g. 'Protein low on weekends'
  lowProteinDays: [{ type: String }], // ['Saturday', 'Sunday']

  // ── Weight ────────────────────────────────────
  weightKg:       { type: Number },  // Monday weigh-in
  weightDeltaKg:  { type: Number },  // vs previous week

  // ── AI Narrative (from cron Call 10) ─────────
  compressedSummary: { type: String, required: true },
  // This is the ~300 token compressed text Claude produces
  // It replaces raw daily data in the context after this week passes

  // ── Pattern Insight Cards (from Call 09) ─────
  patternInsights: [{
    title:      { type: String },
    insight:    { type: String },
    dataPoint:  { type: String },
    suggestion: { type: String },
    _id: false
  }],

  cronRunAt: { type: Date },  // when the cron job ran for this week

}, { timestamps: true });

WeeklySummarySchema.index({ userId: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('WeeklySummary', WeeklySummarySchema);