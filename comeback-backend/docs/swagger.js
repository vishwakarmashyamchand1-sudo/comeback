const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ComeBack API',
      version: '1.0.0',
      description: 'Production-ready backend API for the ComeBack Fitness App',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development server' }],
    components: {
      securitySchemes: {
        firebaseAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-mock-user-id',
          description: 'Mock user ID for testing'
        }
      }
    },
    security: [{ firebaseAuth: [] }],
    paths: {
      '/health': { get: { tags: ['Health'], summary: 'Check server health', responses: { 200: { description: 'Success' } } } },
      '/health/db': { get: { tags: ['Health'], summary: 'Check database connection health', responses: { 200: { description: 'Success' } } } },
      
      '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register a new user', responses: { 201: { description: 'Created' } } } },
      '/api/auth/me': { get: { tags: ['Auth'], summary: 'Get logged-in user', responses: { 200: { description: 'Success' } } } },

      '/api/onboarding/profile': { patch: { tags: ['Onboarding'], summary: 'Save onboarding step', responses: { 200: { description: 'Updated' } } } },
      '/api/onboarding/complete': { post: { tags: ['Onboarding'], summary: 'Generate Week 1 plan', responses: { 200: { description: 'Completed' } } } },

      '/api/workouts': { post: { tags: ['Workouts'], summary: 'Create a new workout', responses: { 201: { description: 'Created' } } } },

      '/api/workouts/today': { get: { tags: ['Workouts'], summary: 'Get today workout', responses: { 200: { description: 'Success' } } } },
      '/api/workouts/{id}/log-set': { patch: { tags: ['Workouts'], summary: 'Log a set', parameters: [{name: 'id', in: 'path', required: true, schema: {type: 'string'}}], responses: { 200: { description: 'Success' } } } },
      '/api/workouts/{id}/skip-exercise': { patch: { tags: ['Workouts'], summary: 'Skip an exercise', parameters: [{name: 'id', in: 'path', required: true, schema: {type: 'string'}}], responses: { 200: { description: 'Success' } } } },
      '/api/workouts/{id}/add-exercise': { post: { tags: ['Workouts'], summary: 'Add custom exercise', parameters: [{name: 'id', in: 'path', required: true, schema: {type: 'string'}}], responses: { 200: { description: 'Success' } } } },
      '/api/workouts/{id}/complete': { post: { tags: ['Workouts'], summary: 'Complete session + AI summary', parameters: [{name: 'id', in: 'path', required: true, schema: {type: 'string'}}], responses: { 200: { description: 'Success' } } } },
      '/api/workouts/tomorrow/swap-muscle': { post: { tags: ['Workouts'], summary: 'Swap muscle group', responses: { 200: { description: 'Success' } } } },
      '/api/workouts/{id}/confirm': { patch: { tags: ['Workouts'], summary: 'Save confirmed plan', parameters: [{name: 'id', in: 'path', required: true, schema: {type: 'string'}}], responses: { 200: { description: 'Success' } } } },
      '/api/workouts/history': { get: { tags: ['Workouts'], summary: 'Get workout history', responses: { 200: { description: 'Success' } } } },

      '/api/diet/today': { get: { tags: ['Diet'], summary: 'Get today diet log', responses: { 200: { description: 'Success' } } } },
      '/api/diet/analyze-photo': { post: { tags: ['Diet'], summary: 'Analyse food photo', responses: { 200: { description: 'Success' } } } },
      '/api/diet/log-meal': { post: { tags: ['Diet'], summary: 'Confirm and log meal', responses: { 200: { description: 'Success' } } } },
      '/api/diet/water': { patch: { tags: ['Diet'], summary: 'Update water count', responses: { 200: { description: 'Success' } } } },
      '/api/diet/tip': { get: { tags: ['Diet'], summary: 'Get nutrition tip', responses: { 200: { description: 'Success' } } } },

      '/api/coach/chat': { post: { tags: ['Coach'], summary: 'Coach chat message', responses: { 200: { description: 'Success' } } } },
      '/api/coach/confirm-plan': { post: { tags: ['Coach'], summary: 'Save chat-modified plan', responses: { 200: { description: 'Success' } } } },

      '/api/exercises': { get: { tags: ['Exercises'], summary: 'Browse exercise library', responses: { 200: { description: 'Success' } } } },
      '/api/exercises/{id}': { get: { tags: ['Exercises'], summary: 'Get exercise detail', parameters: [{name: 'id', in: 'path', required: true, schema: {type: 'string'}}], responses: { 200: { description: 'Success' } } } },

      '/api/progress/overview': { get: { tags: ['Progress'], summary: 'Get all progress data', responses: { 200: { description: 'Success' } } } },
      '/api/progress/weight-checkin': { post: { tags: ['Progress'], summary: 'Log weekly weight', responses: { 200: { description: 'Success' } } } },

      '/api/cron/weekly-summary': { post: { tags: ['Background CRON Jobs'], summary: 'Sunday 11:30 PM - Compress weekly data (Call 10)', responses: { 200: { description: 'Success' } } } },
      '/api/cron/next-week-plan': { post: { tags: ['Background CRON Jobs'], summary: 'Monday 6:00 AM - Generate next week plan (Call 11)', responses: { 200: { description: 'Success' } } } }
    }
  },
  apis: [],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
