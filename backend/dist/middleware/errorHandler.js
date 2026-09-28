"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const errors_js_1 = require("../lib/errors.js");
function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        error: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    });
}
function errorHandler(err, req, res, next) {
    console.error('⚠️ [Error caught]:', err);
    // 1. Handled AppError
    if (err instanceof errors_js_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }
    // 2. Zod Validation Error
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: formattedErrors,
        });
    }
    // 3. Multer File Upload Errors
    if (err instanceof multer_1.default.MulterError) {
        let message = err.message;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'Uploaded file exceeds maximum allowed size (10MB)';
        }
        else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Exceeded maximum allowed number of files (5 files)';
        }
        return res.status(400).json({
            success: false,
            error: message,
            code: err.code,
        });
    }
    // 4. Prisma Database Errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation (e.g., duplicate email)
        if (err.code === 'P2002') {
            const target = err.meta?.target || [];
            return res.status(409).json({
                success: false,
                error: `A record with this ${target.join(', ') || 'field'} already exists`,
            });
        }
        // Record not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Requested database record was not found',
            });
        }
    }
    // 5. Default Unhandled Internal Server Error
    const statusCode = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred'
        : err.message || 'Internal server error';
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
