const redis = require('../config/redis');

const PLANS = {
  free: { requests: 100, window: 60 },
  pro: { requests: 1000, window: 60 }
};

const slidingWindowRateLimit = async (keyPrefix, plan) => {
  const { requests, window } = PLANS[plan] || PLANS.free;
  const redisKey = `ratelimit:${keyPrefix}`;
  const now = Date.now();
  const windowStart = now - window * 1000;

  const luaScript = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local windowStart = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    local window = tonumber(ARGV[4])

    redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

    local count = redis.call('ZCARD', key)

    if count >= limit then
      return {0, count}
    end

    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, window)

    return {1, count + 1}
  `;

  const result = await redis.eval(
    luaScript, 1, redisKey,
    now, windowStart, requests, window
  );

  return {
    allowed: result[0] === 1,
    current: result[1],
    limit: requests,
    remaining: Math.max(0, requests - result[1])
  };
};

module.exports = { slidingWindowRateLimit, PLANS };