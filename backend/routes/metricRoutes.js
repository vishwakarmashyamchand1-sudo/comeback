const express = require('express');
const router = express.Router();
const {
  createMetric,
  getLatestMetric,
  getMetricsHistory
} = require('../controllers/metricController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createMetric);
router.get('/latest', getLatestMetric);
router.get('/history', getMetricsHistory);

module.exports = router;
