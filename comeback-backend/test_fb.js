const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./config/firebase-service-account.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

console.log('App initialized:', !!app);
const auth = getAuth(app);
console.log('Auth initialized:', !!auth);
