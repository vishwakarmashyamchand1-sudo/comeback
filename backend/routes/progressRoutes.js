const express = require('express');
const router = express.Router();
const { getProgressDashboard } = require('../controllers/progressController');
const { createMetric } = require('../controllers/metricController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/overview', getProgressDashboard);
router.post('/weight-checkin', createMetric);

module.exports = router;
