import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { TokenPayload } from '../lib/jwt.js';
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
export declare function authenticateToken(req: Request, res: Response, next: NextFunction): void;
/**
 * Role guard middleware to restrict access to specific roles
 */
export declare function requireRole(...allowedRoles: Role[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication: attaches user if valid JWT is present, but doesn't block if missing
 */
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): void;
