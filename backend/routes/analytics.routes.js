const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Log = require('../models/Log.model');
const redis = require('../config/redis');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/summary/:keyPrefix', verifyToken, async (req, res) => {
  try {
    const { keyPrefix } = req.params;

    const total = await Log.countDocuments({ keyPrefix });
    const allowed = await Log.countDocuments({ keyPrefix, status: 'allowed' });
    const blocked = await Log.countDocuments({ keyPrefix, status: 'blocked' });

    const current = await redis.zcard(`ratelimit:${keyPrefix}`);

    res.json({ keyPrefix, total, allowed, blocked, currentWindowUsage: current });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/block-ip', verifyToken, async (req, res) => {
  try {
    const { ip, ttl } = req.body;
    await redis.set(`blocklist:${ip}`, '1', 'EX', ttl || 3600);
    res.json({ message: `IP ${ip} blocked for ${ttl || 3600} seconds` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;