const { createClient } = require('redis');
const { Queue } = require('bullmq');

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('Redis connected'));

const connectRedis = async () => {
  await redisClient.connect();
};

const signalQueue = new Queue('signal-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

module.exports = { redisClient, connectRedis, signalQueue };