const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const ApiKey = require('../models/ApiKey.model');
const redis = require('../config/redis');
const crypto = require('crypto');

let rawKey;

beforeEach(async () => {
    await ApiKey.deleteMany({});
    await redis.flushall();

    rawKey = 'rate-limit-key';
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

describe('Rate Limiter', () => {

    it('should block after exceeding limit', async () => {
        let res;

        for (let i = 0; i < 105; i++) {
            res = await request(app)
                .get('/api/test')
                .set('x-api-key', rawKey);
        }

        expect(res.statusCode).toBe(429);
    });

    it('should eventually ban user after repeated violations', async () => {
        let res;

        for (let i = 0; i < 200; i++) {
            res = await request(app)
                .get('/api/test')
                .set('x-api-key', rawKey);
        }

        expect(res.body.error).toMatch(/banned/i);
    });

});