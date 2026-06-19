const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Placeholder Auth Middleware
 * Currently just passes through. In the future, this will verify the Firebase token
 * and attach the user document to `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  // Placeholder: Mock user attachment for testing.
  // In production:
  // 1. Get token from req.headers.authorization
  // 2. Verify with firebase-admin
  // 3. Find user in MongoDB by firebaseUid
  // 4. Attach to req.user
  
  // For now, if you want to test protected routes, you can pass a mock user ID in headers
  // e.g., 'x-mock-user-id'
  const mockUserId = req.headers['x-mock-user-id'];
  
  if (mockUserId) {
    const user = await User.findById(mockUserId);
    if (user) {
      req.user = user;
    }
  }

  // To truly protect routes, uncomment below:
  /*
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no valid token found');
  }
  */
  
  next();
});

module.exports = { protect };
