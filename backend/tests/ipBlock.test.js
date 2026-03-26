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

    rawKey = 'ip-test-key';
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

describe('IP Blocking', () => {

    it('should block request if IP is blacklisted', async () => {
        await redis.set('blocklist:127.0.0.1', '1');
        await redis.set('blocklist:::ffff:127.0.0.1', '1');

        const res = await request(app)
            .get('/api/test')
            .set('x-api-key', rawKey);

        expect(res.statusCode).toBe(403);
    });

});