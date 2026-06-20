const { logInfo } = require('../utils/logger');

/**
 * Middleware: Global HTTP Logger
 * Purpose: Logs incoming requests and their response times (Phase 16)
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logInfo(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = requestLogger;
