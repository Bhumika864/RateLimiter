const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User.model');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ratelimiter_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('POST /auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com', password: '123456' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered');
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
    expect(res.body.error).toBe('Email already exists');
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com', password: '123456' });
  });

  it('should login with correct credentials and set httpOnly cookie', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.plan).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should reject unknown email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@test.com', password: '123456' });

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
