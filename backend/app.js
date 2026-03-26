require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const keyRoutes = require('./routes/key.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const authenticateKey = require('./middleware/authKey.middleware');
const checkIPBlock = require('./middleware/ipBlock.middleware');
const rateLimitMiddleware = require('./middleware/rateLimit.middleware');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/keys', keyRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api', checkIPBlock, authenticateKey, rateLimitMiddleware);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Request allowed', plan: req.apiKey.plan });
});

module.exports = app;