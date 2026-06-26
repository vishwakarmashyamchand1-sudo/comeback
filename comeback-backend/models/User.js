// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  // ── Basic Info ──────────────────────────────
  name:            { type: String }, // Optional during signup, collected in Step 1
  email:           { type: String,  required: true, unique: true, index: true },
  firebaseUid:     { type: String,  required: true, unique: true, index: true },
  gender:          { type: String },
  dateOfBirth:     { type: Date },

  // ── Body Metrics ─────────────────────────────
  heightCm:        { type: Number },
  startWeightKg:   { type: Number },
  currentWeightKg: { type: Number },
  targetWeightKg:  { type: Number },
  targetDate:      { type: Date },

  // ── Fitness Background ───────────────────────
  fitnessLevel: { type: String },
  lastActive:       { type: String },
  equipmentAccess:  { type: String },
  preferredTime:    { type: String },
  daysPerWeek:      { type: Number, min: 1, max: 7 },

  // ── Goals ────────────────────────────────────
  primaryGoal: { type: String },
  upcomingEvent:    { type: String },
  urgencyLevel:     { type: String },

  // ── Targets (AI-calculated) ──────────────────
  dailyCalorieTarget:  { type: Number },
  dailyProteinTarget:  { type: Number },

  // ── Diet Profile ─────────────────────────────
  dietType: { type: String },
  foodRestrictions: [{ type: String }],  // e.g. ['no_dairy', 'no_gluten']
  supplements:      [{ type: String }],

  // ── Health & Injuries ─────────────────────────
  injuries:          [{ type: String }],  // e.g. ['plantar_fasciitis', 'knee']
  medicalConditions: [{ type: String }],
  exercisesToAvoid:  { type: String },

  // ── Baseline Performance (from onboarding) ───
  baselineLifts: {
    chestPressKg:    { type: Number },
    shoulderPressKg: { type: Number },
    squatKg:         { type: Number },
    deadliftKg:      { type: Number },
  },
  strongestMuscle: { type: String },   // e.g. 'chest'
  weakestMuscle:   { type: String },   // e.g. 'legs'

  // ── App State ─────────────────────────────────
  onboardingComplete: { type: Boolean, default: false },
  currentWeekNumber:  { type: Number,  default: 1 },
  weeklyPlanSplit:    [{ type: String }],  // ['push','pull','legs','full','rest']
  isDiscoveryWeek:    { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);