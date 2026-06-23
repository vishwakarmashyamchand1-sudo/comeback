const asyncHandler = require('express-async-handler');
const adminAuth = require('../config/firebase');
const User = require('../models/User');

/**
 * Auth Middleware
 * Verifies the Firebase JWT token from the Authorization header.
 * Attaches the authenticated user to `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token with Firebase Admin
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // 3. Find user in database by firebaseUid
      const user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (user) {
        req.user = user;
        return next();
      } else {
        // If the token is valid but user isn't in DB yet (e.g. during registration)
        // Attach the uid so the controller can use it
        req.user = { firebaseUid: decodedToken.uid };
        return next();
      }
    } catch (error) {
      console.error('❌ Firebase Auth Error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // Fallback for Postman testing (Mock User ID)
  // This allows you to continue testing without a real frontend app
  const mockUserId = req.headers['x-mock-user-id'];
  if (mockUserId) {
    console.warn('⚠️ WARNING: Using mock authentication. Do not use in production.');
    const user = await User.findOne({ firebaseUid: mockUserId });
    if (user) {
      req.user = user;
      return next();
    }
  }

  if (!token && !mockUserId) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

module.exports = { protect };