const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User.model');
const redis = require('../config/redis');

beforeEach(async () => {
    await User.deleteMany({});
    await redis.flushall();
});

describe('Auth Routes', () => {

    describe('POST /auth/register', () => {

        it('should register a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'test@test.com', password: 'password123' });

            expect(res.statusCode).toBe(201);
            expect(res.body.userId).toBeDefined();
        });

        it('should reject duplicate email', async () => {
            await User.create({ email: 'test@test.com', password: 'password123', plan: 'free' });

            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'test@test.com', password: 'newpassword' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Email already exists');
        });

    });

    describe('POST /auth/login', () => {

        beforeEach(async () => {
            await request(app)
                .post('/auth/register')
                .send({ email: 'test@test.com', password: 'password123' });
        });

        it('should login successfully and set cookie', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com', password: 'password123' });

            expect(res.statusCode).toBe(200);
            expect(res.body.plan).toBe('free');
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/token=/);
        });

        it('should reject wrong password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com', password: 'wrongpassword' });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });

    });

    describe('POST /auth/logout', () => {

        it('should clear the cookie on logout', async () => {
            const res = await request(app)
                .post('/auth/logout');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logged out');
        });

    });

});
