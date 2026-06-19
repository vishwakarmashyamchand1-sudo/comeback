const express = require('express');
const router = express.Router();
const { createUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', createUser);

// GET /api/auth/me
router.get('/me', protect, getUserProfile);

module.exports = router;
