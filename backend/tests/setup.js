const mongoose = require('mongoose');
const redis = require('../config/redis');

afterAll(async () => {
    await mongoose.connection.close();
    // await redis.quit();
});