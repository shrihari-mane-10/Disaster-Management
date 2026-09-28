/**
 * Rate limiter for authentication routes (e.g., login, register)
 * Limits requests per IP to protect against brute force attacks.
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for incident creation (POST /incidents)
 * Prevents spam incident reporting while allowing reasonable emergency reporting.
 */
export declare const incidentRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
