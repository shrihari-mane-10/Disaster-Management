import { Role } from '@prisma/client';
export interface TokenPayload {
    userId: string;
    email: string;
    role: Role;
}
export declare function generateToken(payload: TokenPayload): string;
export declare function verifyToken(token: string): TokenPayload;
