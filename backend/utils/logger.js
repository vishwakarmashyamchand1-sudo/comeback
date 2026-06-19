/**
 * Utility: Basic Logger
 * Purpose: Centralized logging for requests and internal events
 */

const logInfo = (message, meta = {}) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
};

const logError = (message, error) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
};

module.exports = {
  logInfo,
  logError
};
