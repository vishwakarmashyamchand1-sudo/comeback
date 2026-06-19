const mongoose = require('mongoose');

const validateEnv = () => {
  const requiredEnvs = [
    'MONGO_URI',
    'PORT',
    // 'CLAUDE_API_KEY', // Commenting out to allow local dev without AI key yet, but adding check structure
    // 'R2_ACCESS_KEY_ID',
    // 'R2_SECRET_ACCESS_KEY'
  ];

  const missingEnvs = requiredEnvs.filter(envVar => !process.env[envVar]);

  if (missingEnvs.length > 0) {
    console.error(`❌ FATAL ERROR: Missing required environment variables: ${missingEnvs.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
};

module.exports = validateEnv;
