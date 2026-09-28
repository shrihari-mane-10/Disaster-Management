"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incident_controller_js_1 = require("../controllers/incident.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const upload_js_1 = require("../middleware/upload.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// POST /api/v1/incidents - Create incident (with optional media attachments)
router.post('/', rateLimiter_js_1.incidentRateLimiter, auth_js_1.optionalAuth, upload_js_1.upload.array('media', 5), incident_controller_js_1.createIncident);
// GET /api/v1/incidents - List incidents with filters (status, severity, type, verified)
router.get('/', incident_controller_js_1.getIncidents);
// GET /api/v1/incidents/:id - Get single incident by ID
router.get('/:id', incident_controller_js_1.getIncidentById);
// PATCH /api/v1/incidents/:id - Update incident (verify, change status, etc.)
router.patch('/:id', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)(client_1.Role.authority, client_1.Role.admin, client_1.Role.volunteer, client_1.Role.citizen), incident_controller_js_1.updateIncident);
exports.default = router;
