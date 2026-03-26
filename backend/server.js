require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const redis = require('./config/redis');
const { startLogWorker } = require('./services/logQueue.service');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const keyRoutes = require('./routes/key.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const authenticateKey = require('./middleware/authKey.middleware');
const checkIPBlock = require('./middleware/ipBlock.middleware');
const rateLimitMiddleware = require('./middleware/rateLimit.middleware');

const app = express();
const cors = require('cors')
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}))
app.use(express.json());
app.use(cookieParser());

connectDB();
startLogWorker();

app.use('/auth', authRoutes);
app.use('/keys', keyRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api', checkIPBlock, authenticateKey, rateLimitMiddleware);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Request allowed', plan: req.apiKey.plan });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
