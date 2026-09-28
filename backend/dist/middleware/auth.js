"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireRole = requireRole;
exports.optionalAuth = optionalAuth;
const jwt_js_1 = require("../lib/jwt.js");
const errors_js_1 = require("../lib/errors.js");
/**
 * Middleware to verify JWT from Authorization header (Bearer token)
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errors_js_1.UnauthorizedError('Missing or malformed Authorization header'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_js_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return next(new errors_js_1.UnauthorizedError('Invalid or expired authentication token'));
    }
}
/**
 * Role guard middleware to restrict access to specific roles
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_js_1.UnauthorizedError('Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errors_js_1.ForbiddenError(`Forbidden: Requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}`));
        }
        next();
    };
}
/**
 * Optional authentication: attaches user if valid JWT is present, but doesn't block if missing
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = (0, jwt_js_1.verifyToken)(token);
            req.user = payload;
        }
        catch {
            // Ignore invalid token in optional auth
        }
    }
    next();
}
