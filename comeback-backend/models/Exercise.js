// models/Exercise.js
const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({

  // ── Identity ──────────────────────────────────
  sourceId:    { type: String, required: true, unique: true }, // from original dataset e.g. '0025'
  name:        { type: String, required: true, index: true },
  nameSlug:    { type: String, index: true },  // lowercase-hyphen for URL/search

  // ── Classification ───────────────────────────
  muscleGroup: {
    type: String,
    required: true,
    enum: ['Chest','Back','Shoulders','Biceps','Triceps',
           'Legs_Quads','Legs_Hamstrings','Glutes','Calves','Core','Forearms'],
    index: true
  },
  targetMuscle:     { type: String, required: true },  // e.g. 'pectorals'
  secondaryMuscles: [{ type: String }],                // e.g. ['triceps', 'shoulders']
  equipment: {
    type: String,
    enum: ['barbell','dumbbell','cable','body weight',
           'leverage machine','smith machine','kettlebell',
           'band','resistance band','weighted','other'],
    required: true,
    index: true
  },
  category: { type: String },
  bodyPart: { type: String },

  // ── Media ─────────────────────────────────────
  gifUrl:      { type: String, required: true }, // Cloudflare R2 public URL
  gifFileName: { type: String },                 // original filename for reference

  // ── AI-generated labels (Call 05 — cached) ──
  whyLabel:     { type: String },  // max 8 words e.g. 'Builds chest thickness and strength'
  beginnerTip:  { type: String },  // e.g. 'Keep elbows at 45 degrees'
  avoidIf:      [{ type: String }], // e.g. ['shoulder_injury', 'plantar_fasciitis']

  // ── Goal Tags (for keyword search — no vector DB) ──
  goalTags: [{ type: String }],
  // e.g. ['belly_fat', 'weight_loss', 'core', 'endurance']
  // Used when user types 'reduce belly fat' in Add Exercise

  // ── Instructions ──────────────────────────────
  instructionsEn: { type: String },

  // ── Meta ──────────────────────────────────────
  isActive: { type: Boolean, default: true }, // set false to hide without deleting

}, { timestamps: true });

// Compound index — most common query: muscleGroup + equipment
ExerciseSchema.index({ muscleGroup: 1, equipment: 1 });

module.exports = mongoose.model('Exercise', ExerciseSchema);