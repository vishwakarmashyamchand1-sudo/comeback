// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  // ── Basic Info ──────────────────────────────
  name:            { type: String,  required: true },
  email:           { type: String,  required: true, unique: true, index: true },
  firebaseUid:     { type: String,  required: true, unique: true, index: true },
  gender:          { type: String,  enum: ['male', 'female', 'other'] },
  dateOfBirth:     { type: Date },

  // ── Body Metrics ─────────────────────────────
  heightCm:        { type: Number },
  startWeightKg:   { type: Number },
  currentWeightKg: { type: Number },
  targetWeightKg:  { type: Number },
  targetDate:      { type: Date },

  // ── Fitness Background ───────────────────────
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'returning', 'active']
  },
  equipmentAccess:  { type: String, enum: ['full_gym', 'home', 'none'] },
  daysPerWeek:      { type: Number, min: 1, max: 7 },

  // ── Goals ────────────────────────────────────
  primaryGoal: {
    type: String,
    enum: ['fat_loss', 'muscle_gain', 'fitness_energy']
  },

  // ── Targets (AI-calculated) ──────────────────
  dailyCalorieTarget:  { type: Number },
  dailyProteinTarget:  { type: Number },

  // ── Diet Profile ─────────────────────────────
  dietType: {
    type: String,
    enum: ['vegetarian', 'eggetarian', 'non_veg']
  },
  foodRestrictions: [{ type: String }],  // e.g. ['no_dairy', 'no_gluten']

  // ── Health & Injuries ─────────────────────────
  injuries:   [{ type: String }],  // e.g. ['plantar_fasciitis', 'knee']

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