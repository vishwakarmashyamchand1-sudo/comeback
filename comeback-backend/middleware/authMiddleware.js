const asyncHandler = require('express-async-handler');
const auth = require('../config/firebase');

const protect = asyncHandler(async (req, res, next) => {
   // --- POSTMAN CHEAT CODE ---
  if (req.headers['x-postman-bypass']) {
    // Blindly trust whatever UID we type in Postman!
    req.user = { uid: req.headers['x-postman-bypass'] }; 
    return next();
  }
  // --------------------------

  let token;

  // 1. Check if the frontend sent a Bearer token in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract just the token part
      token = req.headers.authorization.split(' ')[1];

      // 3. Ask Google Firebase to verify if this token is real
      const decodedToken = await auth.verifyIdToken(token);

      // 4. Google says it's real! Attach the decoded user
      req.user = decodedToken;
      
      next(); // Let them pass!
    } catch (error) {
      console.error('Firebase Token Error:', error);
      res.status(401);
      throw new Error('Not authorized, invalid token');
    }
  }

  // 5. If they tried to enter without sending a token at all
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no valid token found');
  }
});

module.exports = { protect };