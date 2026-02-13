const redis = require('redis');
const cacheService = require('../../src/services/cacheService');

describe('Cache Service - Unit Tests', () => {
  
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
  
  describe('setInCache and getFromCache', () => {
    
    test('should set and retrieve data from cache', async () => {
      const key = 'test:key';
      const value = { name: 'test', value: 123 };
      
      const setResult = await cacheService.setInCache(redisClient, key, value, 300);
      expect(setResult).toBe(true);
      
      const getResult = await cacheService.getFromCache(redisClient, key);
      expect(getResult).toEqual(value);
    });
    
    test('should return null for non-existent keys', async () => {
      const result = await cacheService.getFromCache(redisClient, 'non:existent:key');
      expect(result).toBeNull();
    });
    
    test('should set TTL correctly', async () => {
      const key = 'test:ttl:key';
      const value = { data: 'test' };
      
      await cacheService.setInCache(redisClient, key, value, 10);
      
      const ttl = await redisClient.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(10);
    });
  });
  
  describe('deleteFromCache', () => {
    
    test('should delete key from cache', async () => {
      const key = 'test:delete:key';
      const value = { data: 'test' };
      
      await cacheService.setInCache(redisClient, key, value, 300);
      const deleteResult = await cacheService.deleteFromCache(redisClient, key);
      
      expect(deleteResult).toBe(true);
      
      const retrieved = await cacheService.getFromCache(redisClient, key);
      expect(retrieved).toBeNull();
    });
  });
  
  describe('invalidatePattern', () => {
    
    test('should delete multiple keys matching pattern', async () => {
      await redisClient.set('metrics:daily:default', 'data1');
      await redisClient.set('metrics:hourly:default', 'data2');
      await redisClient.set('other:key', 'data3');
      
      const deletedCount = await cacheService.invalidatePattern(redisClient, 'metrics:*');
      
      expect(deletedCount).toBe(2);
      
      const daily = await redisClient.exists('metrics:daily:default');
      const hourly = await redisClient.exists('metrics:hourly:default');
      const other = await redisClient.exists('other:key');
      
      // 
      expect(daily).toBe(0);
      expect(hourly).toBe(0);
      expect(other).toBe(1);
    });
  });
});
