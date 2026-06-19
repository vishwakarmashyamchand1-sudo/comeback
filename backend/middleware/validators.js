const { body } = require('express-validator');

// Auth Validations
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
  body('heightCm').isNumeric().withMessage('Height must be a number'),
  body('currentWeightKg').isNumeric().withMessage('Weight must be a number')
];

// Onboarding Validations
const onboardingValidation = [
  body('heightCm').optional().isNumeric().withMessage('Height must be a number'),
  body('currentWeightKg').optional().isNumeric().withMessage('Weight must be a number'),
  body('goalWeightKg').optional().isNumeric(),
  body('workoutDaysPerWeek').optional().isInt({ min: 1, max: 7 })
];

// Workout Validations
const workoutValidation = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('weekNumber').isInt().withMessage('Week number must be an integer'),
  body('sessionType').notEmpty().withMessage('Session type is required')
];

// Diet Validations
const mealValidation = [
  body('mealType').isIn(['breakfast', 'lunch', 'snack', 'dinner']).withMessage('Invalid meal type'),
  body('items').isArray().withMessage('Items must be an array of foods')
];

// Metric Validations
const metricValidation = [
  body('weekNumber').isInt().withMessage('Week number is required'),
  body('currentWeightKg').isNumeric().withMessage('Weight must be numeric')
];

module.exports = {
  registerValidation,
  onboardingValidation,
  workoutValidation,
  mealValidation,
  metricValidation
};
