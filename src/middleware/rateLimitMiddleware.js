const { ApiError } = require('../utils/errorHandler');

// Token Bucket Rate Limiter Implementation
function rateLimitMiddleware(redisClient) {
  return async (req, res, next) => {
    try {
      const clientId = getClientIdentifier(req);
      const maxRequests = parseInt(process.env.RATE_LIMIT_REQUESTS || '10');
      const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '60');
      
      const rateLimitKey = `rate-limit:${clientId}`;
      const resetKey = `rate-limit-reset:${clientId}`;
      
      // Get current request count
      const currentCount = await redisClient.incr(rateLimitKey);
      
      // Set expiry on first request
      if (currentCount === 1) {
        await redisClient.expire(rateLimitKey, windowSeconds);
      }
      
      // Get TTL for this client's window
      const ttl = await redisClient.ttl(rateLimitKey);
      const remaining = Math.max(0, maxRequests - currentCount);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);
      
      if (currentCount > maxRequests) {
        res.setHeader('Retry-After', ttl);
        
        return res.status(429).json({
          success: false,
          error: {
            message: 'Too Many Requests',
            
            statusCode: 429,
            retryAfter: ttl
          }
        });
      }
      
      next();
    } catch (err) {
      console.error('Rate limit error:', err);
      next(); // Allow request if rate limit check fails
    }
  };
}

function getClientIdentifier(req) {
  // Use API Key if available, otherwise use IP address
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    return `key:${apiKey}`;
  }
  
  const ip = req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             req.connection.socket.remoteAddress;
  
  return `ip:${ip}`;
}

module.exports = rateLimitMiddleware;