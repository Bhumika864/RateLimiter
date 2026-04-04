# RateLimiter

A full-stack API rate-limiting platform with API key management, plan-based limits, abuse protection, and analytics.

## Overview

`RateLimiter` lets users:

- register and log in
- generate and revoke API keys
- call protected APIs with `x-api-key`
- enforce plan-based limits (`free` and `pro`)
- auto-ban keys after repeated violations
- block IPs temporarily
- view per-key analytics from a dashboard

The project is built as a monorepo with:

- `backend` (Express + MongoDB + Redis)
- `frontend` (React + Vite)

## Features

- **Auth and sessions**
  - register/login/logout endpoints
  - JWT stored in `httpOnly` cookie
- **API key lifecycle**
  - secure API key generation
  - raw key shown once; hash stored in DB
  - key deactivation support
- **High-performance rate limiting**
  - sliding-window algorithm on Redis sorted sets
  - Lua script for atomic limit checks
  - plan-specific limits:
    - `free`: 100 requests/minute
    - `pro`: 1000 requests/minute
- **Abuse prevention**
  - violation tracking
  - temporary auto-ban after repeated violations
  - manual IP blocking with TTL
- **Observability**
  - non-blocking request log queue in Redis
  - batch insertion into MongoDB
  - analytics summary endpoint
  - dashboard charts for allowed/blocked/current usage
- **Tests**
  - Jest + Supertest integration tests for auth, keys, rate limiting, IP block, and log queue behavior

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- Redis + ioredis
- JWT (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- Jest + Supertest

### Frontend

- React
- Vite
- React Router
- Axios
- Recharts

## Architecture

Protected API flow:

1. `checkIPBlock` middleware checks `blocklist:<ip>` in Redis
2. `authenticateKey` middleware validates `x-api-key` hash and Redis cache
3. `rateLimitMiddleware` applies sliding-window limits and ban logic
4. request is allowed or rejected (`429` / ban response)

Request logs are pushed asynchronously to `api:log_queue` in Redis and processed in batches into MongoDB.

## Project Structure

```text
RateLimiter/
  backend/
    config/
    middleware/
    models/
    routes/
    services/
    tests/
    server.js
  frontend/
    src/
      pages/
      api/
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or remotely
- Redis running locally or remotely

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ratelimiter
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Local Setup

### 1) Clone and install dependencies

```bash
git clone <your-repo-url>
cd RateLimiter
cd backend && npm install
cd ../frontend && npm install
```

### 2) Start services

Make sure MongoDB and Redis are running.

### 3) Run backend

```bash
cd backend
npm start
```

Backend runs on `http://localhost:5000`.

### 4) Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Reference

### Auth

- `POST /auth/register`
  - body: `{ "email": "user@example.com", "password": "123456" }`
- `POST /auth/login`
  - body: `{ "email": "user@example.com", "password": "123456" }`
  - sets auth cookie
- `POST /auth/logout`

### Keys (requires auth cookie)

- `POST /keys/generate`
  - body: `{ "name": "my-key" }`
- `GET /keys/list`
- `DELETE /keys/:id`

### Protected Test Route (requires API key)

- `GET /api/test`
  - header: `x-api-key: <raw_key>`

### Analytics (requires auth cookie)

- `GET /analytics/summary/:keyPrefix`
- `POST /analytics/block-ip`
  - body: `{ "ip": "127.0.0.1", "ttl": 3600 }`

## Testing

Run backend tests:

```bash
cd backend
npm test
```

Current suite includes:

- auth route tests
- API key flow tests
- rate limit and ban tests
- IP block tests
- log queue tests

## Demo Flow

1. Register a user
2. Login
3. Generate an API key in dashboard
4. Call `/api/test` with the key
5. Exceed request limit to get `429`
6. Trigger repeated violations to observe temporary ban
7. Open analytics for key-level stats

## Future Improvements

- Docker Compose for one-command local startup
- refresh-token based auth
- request tracing and structured logs
- CI pipeline with lint + test on pull requests
- role-based admin routes for global ops controls

