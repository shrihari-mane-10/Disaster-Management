"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
function createApp() {
    const app = (0, express_1.default)();
    // 1. CORS configuration
    const corsOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
        : '*';
    app.use((0, cors_1.default)({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    // 2. Request body parsers
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // 3. Serve static uploaded media files
    const uploadsPath = path_1.default.resolve(process.cwd(), 'uploads');
    app.use('/uploads', express_1.default.static(uploadsPath));
    // 4. API v1 routes
    app.use('/api/v1', index_js_1.default);
    // 5. 404 Not Found & Central Error Handler
    app.use(errorHandler_js_1.notFoundHandler);
    app.use(errorHandler_js_1.errorHandler);
    return app;
}
