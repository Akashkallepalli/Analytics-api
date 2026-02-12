
async function getFromCache(redisClient, key) {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache retrieval error:', err);
    return null;
  }
}

async function setInCache(redisClient, key, value, ttl) {
  try {
    const ttlSeconds = ttl || parseInt(process.env.CACHE_TTL_SECONDS || '300');
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Cache set error:', err);
    return false;
  }
}

async function deleteFromCache(redisClient, key) {
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.error('Cache delete error:', err);
    return false;
  }
}

async function invalidatePattern(redisClient, pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return keys.length;
  } catch (err) {
    console.error('Cache invalidation error:', err);
    return 0;
  }
}

async function getCacheStats(redisClient) {
  try {
    const info = await redisClient.info('stats');
    const dbSize = await redisClient.dbSize();
    
    return {
      dbSize,
      info
    };
  } catch (err) {
    console.error('Cache stats error:', err);
    return null;
  }
}

module.exports = {
  getFromCache,
  setInCache,
  deleteFromCache,
  invalidatePattern,
  getCacheStats
};