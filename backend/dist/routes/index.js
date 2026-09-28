"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const incident_routes_js_1 = __importDefault(require("./incident.routes.js"));
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'disaster-response-backend',
        timestamp: new Date().toISOString(),
    });
});
router.use('/auth', auth_routes_js_1.default);
router.use('/incidents', incident_routes_js_1.default);
exports.default = router;
