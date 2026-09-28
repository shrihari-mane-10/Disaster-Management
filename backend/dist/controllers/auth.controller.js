"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = require("../lib/prisma.js");
const jwt_js_1 = require("../lib/jwt.js");
const errors_js_1 = require("../lib/errors.js");
const client_1 = require("@prisma/client");
async function register(req, res, next) {
    try {
        const { name, email, phone, password, role, lat, lng } = req.body;
        const existingUser = await prisma_js_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new errors_js_1.ConflictError('A user with this email already exists');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                phone: phone || null,
                passwordHash,
                role: role || client_1.Role.citizen,
                lat: lat ?? null,
                lng: lng ?? null,
                available: true,
                lastSeenAt: new Date(),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                lat: true,
                lng: true,
                available: true,
                lastSeenAt: true,
                createdAt: true,
            },
        });
        const token = (0, jwt_js_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new errors_js_1.UnauthorizedError('Invalid email or password');
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new errors_js_1.UnauthorizedError('Invalid email or password');
        }
        // Update lastSeenAt
        const updatedUser = await prisma_js_1.prisma.user.update({
            where: { id: user.id },
            data: { lastSeenAt: new Date() },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                lat: true,
                lng: true,
                available: true,
                lastSeenAt: true,
                createdAt: true,
            },
        });
        const token = (0, jwt_js_1.generateToken)({
            userId: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: updatedUser,
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getMe(req, res, next) {
    try {
        if (!req.user) {
            throw new errors_js_1.UnauthorizedError('Not authenticated');
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                lat: true,
                lng: true,
                available: true,
                lastSeenAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new errors_js_1.UnauthorizedError('User account not found');
        }
        res.json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
}
