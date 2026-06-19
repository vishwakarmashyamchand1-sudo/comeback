const express = require('express');
const router = express.Router();
const { coachChat, confirmCoachPlan } = require('../controllers/coachController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/chat', coachChat);
router.post('/confirm-plan', confirmCoachPlan);

module.exports = router;
