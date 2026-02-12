
const express = require('express');
const redis = require('redis');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes and middleware
const metricsRoutes = require('./routes/metrics');
const cacheMiddleware = require('./middleware/cacheMiddleware');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// ============================================================================
// REDIS CLIENT INITIALIZATION
// ============================================================================
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Max Redis connection attempts reached');
        return new Error('Max retries reached');
      }
      return retries * 50;
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✓ Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('✓ Redis client is ready');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1);
  }
})();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Pass Redis client to request object
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/health', async (req, res) => {
  try {
    // Check Redis connection
    const ping = await redisClient.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      redis: ping === 'PONG' ? 'connected' : 'disconnected',
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

// Apply rate limiting and caching middleware to analytics endpoints
app.use('/api/v1/metrics', rateLimitMiddleware(redisClient));
app.use('/api/v1/metrics', cacheMiddleware(redisClient));

// Mount metrics routes
app.use('/api/v1/metrics', metricsRoutes);

// Cache invalidation endpoint (protected by API key)
app.post('/api/v1/cache/invalidate', authMiddleware, async (req, res, next) => {
  try {
    // Clear all cache entries matching pattern
    const keys = await redisClient.keys('metrics:*');
    
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    
    res.status(200).json({
      success: true,
      message: 'Cache invalidated successfully',
      keysDeleted: keys.length
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 404 HANDLER
// ============================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      statusCode: 404,
      path: req.path
    }
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
app.use(errorHandler);

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await redisClient.quit();
  process.exit(0);
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║       Analytics API Server Started Successfully              ║
║                                                                ║
║  Server:     http://localhost:${PORT}                                   ║
║  Environment: ${process.env.NODE_ENV || 'development'}                        ║
║  Health:     http://localhost:${PORT}/health                        ║
║  Metrics:    http://localhost:${PORT}/api/v1/metrics/daily         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;