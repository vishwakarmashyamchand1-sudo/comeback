const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Load the JSON key
const serviceAccount = require('./firebase-service-account.json');

// Initialize the app
const app = initializeApp({
  credential: cert(serviceAccount)
});

// Export the Auth module directly
const auth = getAuth(app);
module.exports = auth;


