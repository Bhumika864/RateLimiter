const crypto = require('crypto');
const ApiKey = require('../models/ApiKey.model');
const redis = require('../config/redis');

const authenticateKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing' });
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const cacheKey = `apikey_cache:${keyHash}`;

  try {
    const cachedKey = await redis.get(cacheKey);
    if (cachedKey) {
      const parsed = JSON.parse(cachedKey);
      req.apiKey = parsed;
      req.keyPrefix = parsed.keyPrefix;
      return next();
    }
  } catch (err) {
    console.warn('Redis cache read failed for API Key:', err);
  }

  const keyDoc = await ApiKey.findOne({ keyHash, isActive: true });

  if (!keyDoc) {
    return res.status(401).json({ error: 'Invalid or inactive API key' });
  }

  try {
    await redis.set(cacheKey, JSON.stringify(keyDoc), 'EX', 300);
  } catch (err) {
    console.warn('Redis cache write failed for API Key:', err);
  }

  req.apiKey = keyDoc;
  req.keyPrefix = keyDoc.keyPrefix;
  next();
};

module.exports = authenticateKey;