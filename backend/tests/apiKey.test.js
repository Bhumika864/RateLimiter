const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User.model');
const ApiKey = require('../models/ApiKey.model');
const redis = require('../config/redis');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ratelimiter_test');
});

afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
    }
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
    // await redis.quit();
});

beforeEach(async () => {
    await User.deleteMany({});
    await ApiKey.deleteMany({});
    await redis.flushall();
});

describe('Auth Routes', () => {

    describe('POST /auth/register', () => {

        it('should register a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'test@test.com', password: '123456' });

            expect(res.statusCode).toBe(201);
            expect(res.body.userId).toBeDefined();
        });

        it('should reject duplicate email', async () => {
            await request(app)
                .post('/auth/register')
                .send({ email: 'test@test.com', password: '123456' });

            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'test@test.com', password: 'abcdef' });

            expect(res.statusCode).toBe(400);
        });

        it('should reject missing email', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ password: '123456' });

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'invalid', password: '123456' });

            expect(res.statusCode).toBe(400);
        });

    });

    describe('POST /auth/login', () => {

        beforeEach(async () => {
            await request(app)
                .post('/auth/register')
                .send({ email: 'test@test.com', password: '123456' });
        });

        it('should login successfully', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com', password: '123456' });

            expect(res.statusCode).toBe(200);
            expect(res.body.plan).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
        });

        it('should reject wrong password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com', password: 'wrong' });

            expect(res.statusCode).toBe(401);
        });

        it('should reject unknown email', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'no@test.com', password: '123456' });

            expect(res.statusCode).toBe(401);
        });

    });

    describe('POST /auth/logout', () => {
        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/auth/logout');

            expect(res.statusCode).toBe(200);
        });
    });

});