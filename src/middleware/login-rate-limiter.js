const rateLimit = require('express-rate-limit');

const config = require('../config');

const loginRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.loginMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Please try again later.',
      },
    });
  },
});

module.exports = loginRateLimiter;
