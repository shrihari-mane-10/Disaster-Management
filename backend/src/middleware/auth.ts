import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/models.js';
import { verifyToken, TokenPayload } from '../lib/jwt.js';

import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';

// Extend Express Request interface to hold authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify JWT from Authorization header (Bearer token)
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}

/**
 * Role guard middleware to restrict access to specific roles
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Forbidden: Requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

/**
 * Optional authentication: attaches user if valid JWT is present, but doesn't block if missing
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(token);
      req.user = payload;
    } catch {
      // Ignore invalid token in optional auth
    }
  }
  next();
}

