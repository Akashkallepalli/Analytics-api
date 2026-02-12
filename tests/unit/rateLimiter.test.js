const redis = require('redis');

describe('Rate Limiter - Unit Tests', () => {
  
  let redisClient;
  
  beforeAll(async () => {
    redisClient = redis.createClient({
      socket: { host: 'localhost', port: 6379 }
    });
    await redisClient.connect();
  });
  
  afterAll(async () => {
    await redisClient.flushDb();
    await redisClient.quit();
  });
  
  afterEach(async () => {
    await redisClient.flushDb();
  });
  
  describe('Token Bucket Algorithm', () => {
    
    test('should allow requests within limit', async () => {
      const clientId = 'test:client:1';
      const rateLimitKey = `rate-limit:${clientId}`;
      const maxRequests = 10;
      const windowSeconds = 60;
      
      const results = [];
      for (let i = 0; i < 10; i++) {
        const currentCount = await redisClient.incr(rateLimitKey);
        if (currentCount === 1) {
          await redisClient.expire(rateLimitKey, windowSeconds);
        }
        results.push(currentCount <= maxRequests);
      }
      
      expect(results).toEqual(Array(10).fill(true));
    });
    
    test('should block requests exceeding limit', async () => {
      const clientId = 'test:client:2';
      const rateLimitKey = `rate-limit:${clientId}`;
      const maxRequests = 5;
      const windowSeconds = 60;
      
      const results = [];
      for (let i = 0; i < 10; i++) {
        const currentCount = await redisClient.incr(rateLimitKey);
        if (currentCount === 1) {
          await redisClient.expire(rateLimitKey, windowSeconds);
        }
        results.push(currentCount <= maxRequests);
      }
      
      expect(results.slice(0, 5)).toEqual(Array(5).fill(true));
      expect(results.slice(5, 10)).toEqual(Array(5).fill(false));
    });
    
    test('should reset counter after window expires', async () => {
      const clientId = 'test:client:3';
      const rateLimitKey = `rate-limit:${clientId}`;
      const windowSeconds = 2; // 2 second window for testing
      
      const currentCount = await redisClient.incr(rateLimitKey);
      await redisClient.expire(rateLimitKey, windowSeconds);
      
      expect(currentCount).toBe(1);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 2100));
      
      const newCount = await redisClient.incr(rateLimitKey);
      expect(newCount).toBe(1);
    });
  });
});