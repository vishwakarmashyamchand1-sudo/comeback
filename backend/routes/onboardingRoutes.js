const express = require('express');
const router = express.Router();
const {
  saveOnboardingProfile,
  completeOnboarding,
  getOnboardingStatus
} = require('../controllers/onboardingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.patch('/profile', saveOnboardingProfile);
router.post('/complete', completeOnboarding);
router.get('/status', getOnboardingStatus);

module.exports = router;
