const mongoose = require('mongoose');
const redis = require('../config/redis');

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ratelimiter_test');
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    await redis.quit();
});