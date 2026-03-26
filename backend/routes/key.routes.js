const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const ApiKey = require('../models/ApiKey.model');
const redis = require('../config/redis');

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Key name required' });

    const rawKey = `rl_${uuidv4().replace(/-/g, '')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 8);

    await ApiKey.create({
      userId: req.user.userId,
      keyHash,
      keyPrefix,
      name,
      plan: req.user.plan
    });

    res.status(201).json({
      message: 'API key generated',
      key: rawKey,
      keyPrefix,
      note: 'Save this key — it will not be shown again'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', verifyToken, async (req, res) => {
  try {
    const keys = await ApiKey.find(
      { userId: req.user.userId },
      { keyHash: 0 }
    );
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const keyDoc = await ApiKey.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isActive: false }
    );
    
    if (keyDoc) {
      await redis.del(`apikey_cache:${keyDoc.keyHash}`);
    }

    res.json({ message: 'Key deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;