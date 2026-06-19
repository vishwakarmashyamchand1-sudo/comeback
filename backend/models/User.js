// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  // ── Basic Info ──────────────────────────────
  name:            { type: String,  required: true },
  email:           { type: String,  required: true, unique: true, index: true },
  firebaseUid:     { type: String,  required: true, unique: true, index: true },
  gender:          { type: String,  enum: ['male', 'female', 'other'] },
  dateOfBirth:     { type: Date },
  profilePhotoUrl: { type: String },

  // ── Body Metrics ─────────────────────────────
  heightCm:        { type: Number,  required: true },
  startWeightKg:   { type: Number,  required: true },
  currentWeightKg: { type: Number,  required: true },
  targetWeightKg:  { type: Number,  required: true },
  targetDate:      { type: Date,    required: true },

  // ── Fitness Background ───────────────────────
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'returning', 'active'],
    required: true
  },
  lastActivePeriod: { type: String },  // e.g. 'Jan 2024'
  equipmentAccess:  { type: String, enum: ['full_gym', 'home', 'none'], required: true },
  daysPerWeek:      { type: Number, required: true, min: 1, max: 7 },
  preferredTime:    { type: String, enum: ['morning', 'evening', 'flexible'] },

  // ── Goals ────────────────────────────────────
  primaryGoal: {
    type: String,
    enum: ['fat_loss', 'muscle_gain', 'fitness_energy'],
    required: true
  },
  motivationEvent:  { type: String },  // e.g. 'Wedding anniversary'
  urgencyLevel:     { type: String, enum: ['relaxed', 'moderate', 'intensive'] },

  // ── Targets (AI-calculated) ──────────────────
  dailyCalorieTarget:  { type: Number, required: true },
  dailyProteinTarget:  { type: Number, required: true },

  // ── Diet Profile ─────────────────────────────
  dietType: {
    type: String,
    enum: ['vegetarian', 'eggetarian', 'non_veg'],
    required: true
  },
  foodRestrictions: [{ type: String }],  // e.g. ['no_dairy', 'no_gluten']
  supplementsTaken: [{ type: String }],  // e.g. ['creatine', 'vitamin_d']

  // ── Health & Injuries ─────────────────────────
  injuries:   [{ type: String }],  // e.g. ['plantar_fasciitis', 'knee']
  conditions: [{ type: String }],  // e.g. ['diabetes', 'hypertension']
  exercisesToAvoid: [{ type: String }],
  doctorClearance: { type: Boolean, default: false },

  // ── Baseline Performance (from onboarding) ───
  baselineLifts: {
    chestPresKg:     { type: Number },
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