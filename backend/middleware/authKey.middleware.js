const crypto = require('crypto');
const ApiKey = require('../models/ApiKey.model');

const authenticateKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing' });
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyPrefix = apiKey.substring(0, 8);

  const keyDoc = await ApiKey.findOne({ keyHash, isActive: true });

  if (!keyDoc) {
    return res.status(401).json({ error: 'Invalid or inactive API key' });
  }

  req.apiKey = keyDoc;
  req.keyPrefix = keyPrefix;
  next();
};

module.exports = authenticateKey;