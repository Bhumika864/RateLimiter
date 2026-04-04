const redis = require('../config/redis');
const Log = require('../models/Log.model');

const QUEUE_KEY = 'api:log_queue';
const BATCH_SIZE = 100;
const PROCESS_INTERVAL_MS = 5000;

let isProcessing = false;

/**
 * Pushes log data to a Redis list without awaiting a DB response.
 * This ensures the API rate limiter does not wait on logging.
 */
const pushLog = async (logData) => {
  try {
    await redis.lpush(QUEUE_KEY, JSON.stringify(logData));
  } catch (error) {
    console.error('Failed to push log to Redis Queue:', error);
  }
};

/**
 * Periodically consumes the Redis queue and batch-inserts into MongoDB.
 */
const processQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const queueLength = await redis.llen(QUEUE_KEY);
    if (queueLength === 0) {
      isProcessing = false;
      return;
    }

    // Safely pop up to BATCH_SIZE items from Redis
    // const elements = await redis.lrange(QUEUE_KEY, 0, BATCH_SIZE - 1);
    const elements = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const item = await redis.rpop(QUEUE_KEY);
      if (!item) break;
      elements.push(item);
    }

    if (elements.length > 0) {
      const logsToInsert = elements.map(el => JSON.parse(el));

      // Batch insert to MongoDB
      await Log.insertMany(logsToInsert);
    }

  } catch (err) {
    console.error('Error processing log queue:', err);
  } finally {
    isProcessing = false;
  }
};

const startLogWorker = () => {
  if (process.env.NODE_ENV === 'test') return;
  console.log('Started Background Log Queue Worker');
  setInterval(processQueue, PROCESS_INTERVAL_MS);
};

module.exports = {
  pushLog,
  startLogWorker
};
