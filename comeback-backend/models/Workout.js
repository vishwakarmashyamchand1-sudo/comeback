// models/Workout.js
const mongoose = require('mongoose');

// Sub-schema for a single set
const SetSchema = new mongoose.Schema({
  setNumber:    { type: Number, required: true },  // 1, 2, 3...
  plannedReps:  { type: Number },
  plannedWeight:{ type: Number },  // in kg
  actualReps:   { type: Number },  // filled by user
  actualWeight: { type: Number },  // filled by user
  completed:    { type: Boolean, default: false },
}, { _id: false });

// Sub-schema for one exercise in a session
const WorkoutExerciseSchema = new mongoose.Schema({
  exerciseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  exerciseName: { type: String, required: true },  // denormalised for speed
  muscleGroup:  { type: String },
  sets:         [SetSchema],
  wasSkipped:   { type: Boolean, default: false },
  skipReason:   { type: String },
  addedByUser:  { type: Boolean, default: false }, // true = user added, not AI planned
  userNotes:    { type: String },
  orderIndex:   { type: Number }, // display order in the workout table
}, { _id: false });

// Main Workout document
const WorkoutSchema = new mongoose.Schema({

  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date:        { type: Date, required: true, index: true },
  weekNumber:  { type: Number, required: true },
  dayOfWeek:   { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
  sessionType: { type: String }, // e.g. 'Push', 'Pull', 'Legs', 'Full Body', 'Rest'

  // ── Status ───────────────────────────────────
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'skipped', 'rest_day'],
    default: 'planned',
    index: true
  },

  // ── Exercises ────────────────────────────────
  exercises: [WorkoutExerciseSchema],

  // ── Post-session Data (filled after completion) ──
  sessionRating: { type: Number, min: 1, max: 10 },
  sessionFeel:   { type: String, enum: ['Easy', 'Good', 'Hard', 'Exhausted'] },
  sessionDurationMins: { type: Number },

  // ── AI Output ────────────────────────────────
  aiSummary:    { type: String }, // Claude's post-session feedback text
  aiGeneratedAt:{ type: Date },

  // ── Plan Source ──────────────────────────────
  planSource: {
    type: String,
    enum: ['ai_generated', 'user_modified', 'muscle_swap', 'coach_chat'],
    default: 'ai_generated'
  },

}, { timestamps: true });

// Compound index — most common query: userId + date
WorkoutSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Workout', WorkoutSchema);