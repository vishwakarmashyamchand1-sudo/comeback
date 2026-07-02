const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import Routes
const exerciseRoutes = require('./routes/exerciseRoutes');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const dietLogRoutes = require('./routes/dietLogRoutes');
const weeklySummaryRoutes = require('./routes/weeklySummaryRoutes');
const metricRoutes = require('./routes/metricRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const progressRoutes = require('./routes/progressRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const coachRoutes = require('./routes/coachRoutes');
const cronRoutes = require('./routes/cronRoutes');
const requestLogger = require('./middleware/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security Layer (Phase 15)
app.use(helmet());
// Increased rate limit to 5000 for local development (was 100)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5000 });
app.use('/api', limiter);

// Global Logger (Phase 16)
app.use(requestLogger);

// Swagger Docs (Phase 13)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'ComeBack API is running...' });
});

// Mount Routes
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/diet', dietLogRoutes);
app.use('/api/weekly-summaries', weeklySummaryRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/cron', cronRoutes);
app.use('/health', healthRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
