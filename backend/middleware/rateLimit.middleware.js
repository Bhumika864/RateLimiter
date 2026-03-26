const { slidingWindowRateLimit } = require('../services/rateLimiter.service');
const { pushLog } = require('../services/logQueue.service');

const rateLimitMiddleware = async (req, res, next) => {
  const { keyPrefix, apiKey, clientIP } = req;

  const result = await slidingWindowRateLimit(keyPrefix, apiKey.plan);

  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);

  pushLog({
    keyPrefix,
    endpoint: req.originalUrl,
    ip: clientIP,
    status: result.allowed ? 'allowed' : 'blocked',
    reason: result.allowed ? null : (result.reason || 'rate limit exceeded')
  });

  if (!result.allowed) {
    return res.status(429).json({
      error: result.banned ? 'You have been temporarily banned' : 'Rate limit exceeded',
      reason: result.reason,
      limit: result.limit,
      remaining: 0
    });
  }

  next();
};

module.exports = rateLimitMiddleware;