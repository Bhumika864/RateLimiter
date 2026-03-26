
const redis = require('../config/redis');

const PLANS = {
  free: { requests: 100, window: 60 },
  pro: { requests: 1000, window: 60 }
};

const VIOLATION_LIMIT = 5;
const VIOLATION_WINDOW = 60;
const BAN_DURATION = 300;

const slidingWindowRateLimit = async (keyPrefix, plan) => {
  const { requests, window } = PLANS[plan] || PLANS.free;
  const redisKey = `ratelimit:${keyPrefix}`;
  const violationKey = `violations:${keyPrefix}`;
  const banKey = `banned:${keyPrefix}`;
  const now = Date.now();
  const windowStart = now - window * 1000;

  const isBanned = await redis.get(banKey);
  
  if (isBanned) {
    return {
      allowed: false,
      current: requests,
      limit: requests,
      remaining: 0,
      banned: true,
      reason: 'temporarily banned'
    };
  }

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

  const allowed = result[0] === 1;

  if (!allowed) {
    const violations = await redis.incr(violationKey);
    await redis.expire(violationKey, VIOLATION_WINDOW);
    console.log('violations count:', violations);

    if (violations >= VIOLATION_LIMIT) {
      await redis.set(banKey, '1', 'EX', BAN_DURATION);
      await redis.del(violationKey);
      return {
        allowed: false,
        current: result[1],
        limit: requests,
        remaining: 0,
        banned: true,
        reason: `auto-banned for ${BAN_DURATION} seconds after ${VIOLATION_LIMIT} violations`
      };
    }
  }

  return {
    allowed,
    current: result[1],
    limit: requests,
    remaining: Math.max(0, requests - result[1]),
    banned: false
  };
};

module.exports = { slidingWindowRateLimit, PLANS };