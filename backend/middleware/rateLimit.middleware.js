const { slidingWindowRateLimit } = require('../services/rateLimiter.service');
const Log = require('../models/Log.model');

const rateLimitMiddleware = async (req, res, next) => {
  const { keyPrefix, apiKey, clientIP } = req;

  const result = await slidingWindowRateLimit(keyPrefix, apiKey.plan);

  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);

  await Log.create({
    keyPrefix,
    endpoint: req.originalUrl,
    ip: clientIP,
    status: result.allowed ? 'allowed' : 'blocked',
    reason: result.allowed ? null : 'rate limit exceeded'
  });

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      limit: result.limit,
      remaining: 0
    });
  }

  next();
};

module.exports = rateLimitMiddleware;