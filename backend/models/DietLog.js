// models/DietLog.js
const mongoose = require('mongoose');

// Sub-schema for a single food item in a meal
const FoodItemSchema = new mongoose.Schema({
  name:         { type: String, required: true },  // e.g. 'Dal tadka'
  quantityG:    { type: Number },                  // grams
  calories:     { type: Number },
  proteinG:     { type: Number },
  carbsG:       { type: Number },
  fatG:         { type: Number },
  confidence:   { type: String, enum: ['high','medium','low'] },
  editedByUser: { type: Boolean, default: false }, // true if user corrected AI estimate
}, { _id: false });

// Sub-schema for a meal slot
const MealSchema = new mongoose.Schema({
  mealType:   { type: String, enum: ['breakfast','lunch','snack','dinner'], required: true },
  loggedAt:   { type: Date, default: Date.now },
  photoUrl:   { type: String },   // Cloudflare R2 URL of the food photo
  items:      [FoodItemSchema],   // AI-detected and user-confirmed items
  totalCalories: { type: Number, default: 0 },
  totalProteinG: { type: Number, default: 0 },
  totalCarbsG:   { type: Number, default: 0 },
  totalFatG:     { type: Number, default: 0 },
  aiTip:      { type: String },   // one-line tip Claude gave after this meal
}, { _id: false });

// Main DietLog document
const DietLogSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date:   { type: Date, required: true, index: true },

  // ── Meals ─────────────────────────────────────
  meals:  [MealSchema],

  // ── Running Daily Totals ─────────────────────
  totalCalories: { type: Number, default: 0 },
  totalProteinG: { type: Number, default: 0 },
  totalCarbsG:   { type: Number, default: 0 },
  totalFatG:     { type: Number, default: 0 },
  waterGlasses:  { type: Number, default: 0 },

  // ── Daily Coach Tip ───────────────────────────
  dailyCoachTip:     { type: String },   // Claude Call 07
  dailyTipGeneratedAt: { type: Date },

}, { timestamps: true });

// Compound index — userId + date is the primary lookup
DietLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DietLog', DietLogSchema);