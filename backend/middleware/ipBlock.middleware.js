const redis = require('../config/redis');

const checkIPBlock = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;

    const isBlocked = await redis.get(`blocklist:${ip}`);

    if (isBlocked) {
      return res.status(403).json({ error: 'IP blocked' });
    }

    req.clientIP = ip;
    next();
  } catch (err) {
    console.error('IP block check error:', err.message);
    next();
  }
};

module.exports = checkIPBlock;