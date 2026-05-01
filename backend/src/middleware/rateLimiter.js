const rateLimit = require('express-rate-limit');

const signalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many signals. Rate limit exceeded. Please slow down.' },
  skip: (req) => req.path === '/health',
});

module.exports = { signalRateLimiter };