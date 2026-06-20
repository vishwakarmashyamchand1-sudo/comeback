/**
 * Cloudflare R2 Configuration Placeholder
 * Will configure AWS SDK (S3 client) to point to Cloudflare R2 endpoints
 */
const r2Config = {
  endpoint: process.env.R2_ENDPOINT || 'https://placeholder.r2.cloudflarestorage.com',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || 'placeholder_access_key',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'placeholder_secret_key',
  bucketName: process.env.R2_BUCKET_NAME || 'comeback-assets'
};

module.exports = r2Config;
