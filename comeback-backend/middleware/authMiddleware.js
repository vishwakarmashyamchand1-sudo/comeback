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

      let user;
      let decodedTokenUid = null;
      let decodedTokenEmail = null;
      let decodedTokenName = null;

      // 2. Verify token with Firebase Admin
      if (adminAuth) {
        const decodedToken = await adminAuth.verifyIdToken(token);
        decodedTokenUid = decodedToken.uid;
        decodedTokenEmail = decodedToken.email;
        decodedTokenName = decodedToken.name;
        // 3. Find user in database by firebaseUid
        user = await User.findOne({ firebaseUid: decodedTokenUid });
      } else {
        // Fallback for local development if serviceAccountKey.json is missing
        console.warn("⚠️ Warning: Bypassing Firebase auth check because adminAuth is not initialized.");
        user = await User.findOne(); // Just pick the first user for local dev testing
        if (!user) {
           // Mock a user if database is empty
           user = { _id: "mock-id", injuries: [] };
        }
      }

      if (!user && adminAuth) {
        // If user isn't found, it might be a new registration in progress. 
        // Wait 500ms and check again to allow /register to finish first!
        await new Promise(resolve => setTimeout(resolve, 500));
        user = await User.findOne({ firebaseUid: decodedTokenUid });
      }

      if (user) {
        req.user = user;
        return next();
      } else {
        // If the token is valid but user isn't in DB yet (e.g. during registration)
        // Attach the uid so the controller can use it
        req.user = { 
          firebaseUid: decodedTokenUid,
          email: decodedTokenEmail,
          name: decodedTokenName
        };
        return next();
      }
    } catch (error) {
      console.error('❌ Firebase Auth Error:', error.message);
      res.status(401);
      throw new Error(`Not authorized, token failed: ${error.message}`);
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