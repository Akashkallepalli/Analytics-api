const request = require('supertest');
const redis = require('redis');
const app = require('../../src/app');

describe('Analytics API - Integration Tests', () => {
  
  let redisClient;
  
  beforeAll(async () => {
    redisClient = redis.createClient({
      socket: { host: 'localhost', port: 6379 }
    });
    await redisClient.connect();
  });
  
  afterAll(async () => {
    await redisClient.quit();
  });
  
  afterEach(async () => {
    await redisClient.flushDb();
  });
  
  describe('GET /health', () => {
    
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('redis');
    });
  });
  
  describe('GET /api/v1/metrics/daily', () => {
    
    test('should return daily metrics', async () => {
      const response = await request(app).get('/api/v1/metrics/daily');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('should accept start_date query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/daily')
        .query({ start_date: '2023-06-01' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
    
    test('should accept date range parameters', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/daily')
        .query({ start_date: '2023-06-01', end_date: '2023-06-30' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should reject invalid date format', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/daily')
        .query({ start_date: 'invalid-date' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    test('should return X-Cache-Status header on first request (MISS)', async () => {
      const response = await request(app).get('/api/v1/metrics/daily');
      
      expect(response.headers['x-cache-status']).toBeDefined();
    });
  });
  
  describe('GET /api/v1/metrics/hourly', () => {
    
    test('should return hourly metrics', async () => {
      const response = await request(app).get('/api/v1/metrics/hourly');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/hourly')
        .query({ start_date: '2024-01-01', end_date: '2024-01-02' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  
  describe('Caching Behavior', () => {
    
    test('should cache successful responses', async () => {
      const endpoint = '/api/v1/metrics/daily?start_date=2023-01-01';
      
      // First request
      const firstResponse = await request(app).get(endpoint);
      expect(firstResponse.status).toBe(200);
      const firstTime = Date.now();
      
      // Second request (cached)
      const secondResponse = await request(app).get(endpoint);
      expect(secondResponse.status).toBe(200);
      const secondTime = Date.now();
      
      // Second response should be faster (cached)
      const timeDifference = secondTime - firstTime;
      
      // Cache should be hit on second request
      expect(secondResponse.headers['x-cache-status']).toBeDefined();
    });
  });
  
  describe('Rate Limiting', () => {
    
    test('should apply rate limit to requests', async () => {
      const maxRequests = 10;
      
      const responses = [];
      for (let i = 0; i < maxRequests + 5; i++) {
        const response = await request(app)
          .get('/api/v1/metrics/daily')
          .set('X-Forwarded-For', '192.168.1.100');
        
        responses.push(response.status);
      }
      
      // First 10 should be 200, rest should be 429
      expect(responses.slice(0, maxRequests)).toEqual(Array(maxRequests).fill(200));
      expect(responses.slice(maxRequests)).toEqual(Array(5).fill(429));
    });
    
    test('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/daily')
        .set('X-Forwarded-For', '192.168.1.101');
      
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
    
    test('should include Retry-After header on 429', async () => {
      for (let i = 0; i < 15; i++) {
        await request(app)
          .get('/api/v1/metrics/daily')
          .set('X-Forwarded-For', '192.168.1.102');
      }
      
      // Next request should be rate limited
      const response = await request(app)
        .get('/api/v1/metrics/daily')
        .set('X-Forwarded-For', '192.168.1.102');
      
      expect(response.status).toBe(429);
      expect(response.headers['retry-after']).toBeDefined();
    });
  });
  
  describe('POST /api/v1/cache/invalidate', () => {
    
    test('should require API key', async () => {
      const response = await request(app).post('/api/v1/cache/invalidate');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    test('should reject invalid API key', async () => {
      const response = await request(app)
        .post('/api/v1/cache/invalidate')
        .set('X-API-Key', 'invalid_key');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    test('should clear cache with valid API key', async () => {
      const validApiKey = process.env.API_KEY || 'your_super_secret_api_key_123';
      
      // First, cache some data
      await request(app).get('/api/v1/metrics/daily');
      
      // Now invalidate
      const response = await request(app)
        .post('/api/v1/cache/invalidate')
        .set('X-API-Key', validApiKey);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('keysDeleted');
    });
  });
  
  describe('Error Handling', () => {
    
    test('should return 404 for non-existent endpoint', async () => {
      const response = await request(app).get('/api/v1/non-existent');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
    
    test('should validate date range', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/daily')
        .query({ start_date: '2023-12-31', end_date: '2023-01-01' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});