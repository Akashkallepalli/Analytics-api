const cacheService = require('../services/cacheService');

function cacheMiddleware(redisClient) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key from URL and query parameters
    const cacheKey = generateCacheKey(req);
    req.cacheKey = cacheKey;
    
    try {
      // Try to get data from cache
      const cachedData = await cacheService.getFromCache(redisClient, cacheKey);
      
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        
        // Send cached response
        res.setHeader('X-Cache-Status', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        
        return res.status(200).json({
          ...cachedData,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`Cache MISS: ${cacheKey}`);
      res.setHeader('X-Cache-Status', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);
      req.cached = false;
      
      // Store original send function
      const originalSend = res.json.bind(res);
      
      // Override send to cache successful responses
      res.json = function(data) {
        if (res.statusCode === 200 && data.success) {
          cacheService.setInCache(
            redisClient,
            cacheKey,
            data,
            process.env.CACHE_TTL_SECONDS
          ).catch(err => console.error('Error caching response:', err));
        }
        
        return originalSend(data);
      };
      
      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
}

function generateCacheKey(req) {
  const queryParams = Object.keys(req.query)
    .sort()
    .map(key => `${key}=${req.query[key]}`)
    .join('&');
  
  const path = req.path.replace(/\//g, ':');
  return `metrics:${path}:${queryParams || 'default'}`;
}

module.exports = cacheMiddleware;