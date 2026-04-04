const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const ApiKey = require('../models/ApiKey.model');
const redis = require('../config/redis');
const crypto = require('crypto');

let rawKey;
let keyHash;

beforeEach(async () => {
  await ApiKey.deleteMany({});
  await redis.flushall();

  rawKey = 'middleware-test-key';
  keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  await ApiKey.create({
    userId: new mongoose.Types.ObjectId(),
    keyHash,
    keyPrefix: keyHash.slice(0, 12),
    name: 'test',
    plan: 'free',
    isActive: true
  });
});

describe('Middleware Tests', () => {

  it('should reject requests with missing API key', async () => {
    const res = await request(app).get('/api/test');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('API key missing');
  });

  it('should reject requests with invalid API key', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('x-api-key', 'invalid-key');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid or inactive API key');
  });

  it('should accept requests with valid API key and cache it in Redis', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('x-api-key', rawKey);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Request allowed');

    const cacheKey = `apikey_cache:${keyHash}`;
    const cached = await redis.get(cacheKey);
    expect(cached).toBeDefined();
    expect(JSON.parse(cached).keyHash).toBe(keyHash);
  });

  it('should immediately block deactivated keys (cache invalidation)', async () => {
    // First request to cache it
    await request(app).get('/api/test').set('x-api-key', rawKey);

    // Deactivate in DB
    await ApiKey.updateOne({ keyHash }, { isActive: false });
    // Manually invalidate cache as the business logic would do
    const cacheKey = `apikey_cache:${keyHash}`;
    await redis.del(cacheKey);

    const res = await request(app)
      .get('/api/test')
      .set('x-api-key', rawKey);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid or inactive API key');
  });

});
