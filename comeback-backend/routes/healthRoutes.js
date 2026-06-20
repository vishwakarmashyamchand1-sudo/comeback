const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /health
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// GET /health/db
router.get('/db', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    status: states[dbState] || 'unknown',
    database: 'comeback'
  });
});

module.exports = router;
