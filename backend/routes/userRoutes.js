const express = require('express');
const router = express.Router();
const {
  createUser,
  getUserProfile,
  updateUserProfile,
  updateWeight,
  updateGoals
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public route
router.post('/', createUser);

// Protected routes (require auth token / mock user ID header)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/weight', protect, updateWeight);
router.put('/goals', protect, updateGoals);

module.exports = router;
