const request = require('supertest');
const redis = require('../config/redis');
const mongoose = require('mongoose');
const app = require('../app');
const ApiKey = require('../models/ApiKey.model');
const crypto = require('crypto');

let rawKey;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ratelimiter_test');
});

afterAll(async () => {
    await mongoose.connection.close();
    // await redis.quit();
});

beforeEach(async () => {
    await ApiKey.deleteMany({});
    await redis.flushall();

    rawKey = 'log-test-key';
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    await ApiKey.create({
        userId: new mongoose.Types.ObjectId(),
        keyHash,
        keyPrefix: keyHash.slice(0, 12),
        name: 'test',
        plan: 'free',
        isActive: true
    });
});

describe('Logging Queue', () => {

    it('should push logs into Redis queue', async () => {
        await request(app)
            .get('/api/test')
            .set('x-api-key', rawKey);
        // pushLog() is fire-and-forget in middleware; wait briefly for Redis write.
        await new Promise((resolve) => setTimeout(resolve, 100));
        const length = await redis.llen('api:log_queue');
        expect(length).toBeGreaterThan(0);
    });

});