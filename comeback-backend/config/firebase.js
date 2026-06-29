const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let serviceAccount;

// If we are on Render (production), build the object from individual Environment Variables
if (process.env.FIREBASE_PROJECT_ID) {
  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    // Render might escape the newlines in the private key, so we replace \\n with actual newlines
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
  };
} else {
  // If we are on your local computer, load the file
  serviceAccount = require('../serviceAccountKey.json');
}

// Initialize the app
const app = initializeApp({
  credential: cert(serviceAccount)
});

// Export the Auth module directly
const auth = getAuth(app);
module.exports = auth;


