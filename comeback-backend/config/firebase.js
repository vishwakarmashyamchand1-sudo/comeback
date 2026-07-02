const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let serviceAccount = null;

// If we are on Render (production), build the object from individual Environment Variables
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    // Render might escape the newlines in the private key, so we replace \n with actual newlines
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  };
} else {
  // If we are on your local computer, load the existing service-account JSON file
  try {
    const localServiceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
    serviceAccount = require(localServiceAccountPath);
  } catch (error) {
    console.warn("⚠️ Warning: serviceAccountKey.json not found. Firebase Admin will not be initialized.");
  }
}

let auth = null;
// Initialize the app if we have credentials
if (serviceAccount) {
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  auth = getAuth(app);
}

// Export the Auth module directly
module.exports = auth;


