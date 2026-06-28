const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let serviceAccount;

// If we are on Render (production), load from Environment Variable
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // If we are on your local computer, load the file
  serviceAccount = require('./firebase-service-account.json');
}

// Initialize the app
const app = initializeApp({
  credential: cert(serviceAccount)
});

// Export the Auth module directly
const auth = getAuth(app);
module.exports = auth;


