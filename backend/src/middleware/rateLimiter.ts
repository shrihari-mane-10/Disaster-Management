import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes (e.g., login, register)
 * Limits requests per IP to protect against brute force attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * Rate limiter for incident creation (POST /incidents)
 * Prevents spam incident reporting while allowing reasonable emergency reporting.
 */
export const incidentRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 incident submissions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many incident submissions in a short period. Please wait a moment.',
  },
});
