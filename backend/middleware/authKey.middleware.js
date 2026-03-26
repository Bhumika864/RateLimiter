const crypto = require('crypto');
const ApiKey = require('../models/ApiKey.model');
const redis = require('../config/redis');

const authenticateKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing' });
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  // const keyPrefix = apiKey.substring(0, 8);
  const keyPrefix = keyHash.slice(0, 12);
  const cacheKey = `apikey_cache:${keyHash}`;

  try {
    const cachedKey = await redis.get(cacheKey);
    if (cachedKey) {
      req.apiKey = JSON.parse(cachedKey);
      req.keyPrefix = keyPrefix;
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
  req.keyPrefix = keyPrefix;
  next();
};

module.exports = authenticateKey;