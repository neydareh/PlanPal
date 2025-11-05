import { config } from "@server/config";
import rateLimit from "express-rate-limit";

// Base rate limiter factory
export function createRateLimiter({
  windowMs = config.defaultRateLimit.window,
  max = config.defaultRateLimit.max,
  message = "Too many requests from this IP, please try again later",
} = {}) {
  return rateLimit({
    windowMs,
    max,
    message: {
      message,
      code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Pre-configured rate limiters for different endpoints
export const apiLimiter = createRateLimiter();

export const authLimiter = createRateLimiter({
  windowMs: config.authRateLimit.window,
  max: config.authRateLimit.max,
  message: "Too many authentication attempts, please try again later",
});

export const createAccountLimiter = createRateLimiter({
  windowMs: config.createAccountRateLimit.window,
  max: config.createAccountRateLimit.max,
  message:
    "Too many accounts created from this IP, please try again after 24 hours",
});
