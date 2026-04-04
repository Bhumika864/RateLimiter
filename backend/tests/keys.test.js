const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User.model');
const ApiKey = require('../models/ApiKey.model');
const redis = require('../config/redis');
const jwt = require('jsonwebtoken');

let token;
let userId;

beforeEach(async () => {
    await User.deleteMany({});
    await ApiKey.deleteMany({});
    await redis.flushall();

    const user = await User.create({
        email: 'test@test.com',
        password: 'password123',
        plan: 'free'
    });
    userId = user._id;

    token = jwt.sign(
        { userId: user._id, plan: user.plan },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
    );
});

describe('API Key Management', () => {

    it('should generate a new API key', async () => {
        const res = await request(app)
            .post('/keys/generate')
            .set('Cookie', [`token=${token}`])
            .send({ name: 'My Test Key' });

        expect(res.statusCode).toBe(201);
        expect(res.body.key).toBeDefined();
        expect(res.body.keyPrefix).toBeDefined();
        expect(res.body.message).toBe('API key generated');

        const keyDoc = await ApiKey.findOne({ userId });
        expect(keyDoc).toBeDefined();
        expect(keyDoc.name).toBe('My Test Key');
    });

    it('should list all active API keys for a user', async () => {
        await ApiKey.create({
            userId,
            keyHash: 'hash1',
            keyPrefix: 'pref1',
            name: 'Key 1',
            plan: 'free'
        });

        const res = await request(app)
            .get('/keys/list')
            .set('Cookie', [`token=${token}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Key 1');
    });

    it('should deactivate an API key', async () => {
        const key = await ApiKey.create({
            userId,
            keyHash: 'hash2',
            keyPrefix: 'pref2',
            name: 'Key 2',
            plan: 'free'
        });

        const res = await request(app)
            .delete(`/keys/${key._id}`)
            .set('Cookie', [`token=${token}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Key deactivated');

        const updatedKey = await ApiKey.findById(key._id);
        expect(updatedKey.isActive).toBe(false);
    });

});
