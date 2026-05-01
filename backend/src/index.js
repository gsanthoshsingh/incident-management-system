require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectMongo, pgPool } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { createWorker } = require('./workers/signalWorker');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', routes);

// Health endpoint
app.get('/health', async (req, res) => {
  try {
    await pgPool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), services: { postgres: 'up', redis: 'up', mongo: 'up' } });
  } catch {
    res.status(503).json({ status: 'degraded' });
  }
});

app.use(errorHandler);

const start = async () => {
  await connectMongo();
  await connectRedis();
  createWorker();
  app.listen(PORT, () => console.log(`IMS Backend running on port ${PORT}`));
};

start().catch((err) => { console.error('Startup failed:', err); process.exit(1); });