const { Anthropic } = require('@anthropic-ai/sdk');

// Ensure ANTHROPIC_API_KEY is available in environment
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'PLACEHOLDER_KEY',
});

module.exports = anthropic;
