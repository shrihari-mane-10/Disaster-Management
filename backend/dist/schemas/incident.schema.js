"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentQuerySchema = exports.updateIncidentSchema = exports.createIncidentSchema = void 0;
const zod_1 = require("zod");
exports.createIncidentSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, 'Incident type is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    lat: zod_1.z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    lng: zod_1.z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});
exports.updateIncidentSchema = zod_1.z.object({
    type: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().min(1).optional(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    status: zod_1.z.enum(['pending', 'assigned', 'in_progress', 'resolved', 'rejected']).optional(),
    verified: zod_1.z.boolean().optional(),
    lat: zod_1.z.coerce.number().min(-90).max(90).optional(),
    lng: zod_1.z.coerce.number().min(-180).max(180).optional(),
});
exports.incidentQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'assigned', 'in_progress', 'resolved', 'rejected']).optional(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    type: zod_1.z.string().optional(),
    verified: zod_1.z
        .string()
        .transform((val) => val === 'true')
        .optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).default(50).optional(),
    offset: zod_1.z.coerce.number().min(0).default(0).optional(),
});
