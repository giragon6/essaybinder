const redis = require('redis');

let client = null;

const initRedis = async () => {
  if (!client) {
    try {
      client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      client.on('connect', () => {
        console.log('Redis client connected');
      });

      await client.connect();
    } catch (error) {
      console.error('Redis initialization failed:', error);
      client = null;
    }
  }
  return client;
};

const getRedisClient = () => {
  return client;
};

// Cache key generators
const getCacheKey = (type, userId, identifier = '') => {
  return `essaybinder:${type}:${userId}${identifier ? ':' + identifier : ''}`;
};

// Cache with TTL
const setCache = async (key, data, ttlSeconds = 300) => {
  try {
    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
      return true;
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
  return false;
};

// Get from cache
const getCache = async (key) => {
  try {
    const redisClient = getRedisClient();
    if (redisClient) {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
  }
  return null;
};

// Delete from cache
const deleteCache = async (pattern) => {
  try {
    const redisClient = getRedisClient();
    if (redisClient) {
      if (pattern.includes('*')) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        await redisClient.del(pattern);
      }
      return true;
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
  return false;
};

module.exports = {
  initRedis,
  getRedisClient,
  getCacheKey,
  setCache,
  getCache,
  deleteCache
};
