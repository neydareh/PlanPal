import rateLimit from 'express-rate-limit';

// Base rate limiter factory
export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes by default
  max = 100, // Limit each IP to 100 requests per windowMs by default
  message = 'Too many requests from this IP, please try again later'
} = {}) {
  return rateLimit({
    windowMs,
    max,
    message: { 
      message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Pre-configured rate limiters for different endpoints
export const apiLimiter = createRateLimiter();

export const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 5 requests per hour
  message: 'Too many authentication attempts, please try again later'
});

export const createAccountLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 accounts per day
  message: 'Too many accounts created from this IP, please try again after 24 hours'
});