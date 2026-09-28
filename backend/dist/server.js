"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const app_js_1 = require("./app.js");
const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';
const app = (0, app_js_1.createApp)();
const server = http_1.default.createServer(app);
server.listen(PORT, HOST, () => {
    console.log('====================================================');
    console.log(`🚨 Disaster Response Coordination Backend running!`);
    console.log(`📡 Local Address:   http://localhost:${PORT}/api/v1`);
    console.log(`🌐 Network Address: http://${HOST}:${PORT}/api/v1`);
    console.log(`📂 Uploads URL:     http://${HOST}:${PORT}/uploads`);
    console.log(`❤️  Health Check:    http://${HOST}:${PORT}/api/v1/health`);
    console.log('====================================================');
});
// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
});
