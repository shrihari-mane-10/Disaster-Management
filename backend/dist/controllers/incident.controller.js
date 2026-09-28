"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIncident = createIncident;
exports.getIncidents = getIncidents;
exports.getIncidentById = getIncidentById;
exports.updateIncident = updateIncident;
const prisma_js_1 = require("../lib/prisma.js");
const errors_js_1 = require("../lib/errors.js");
const incident_schema_js_1 = require("../schemas/incident.schema.js");
const client_1 = require("@prisma/client");
async function createIncident(req, res, next) {
    try {
        // Validate body (can be form-data or JSON)
        const validatedData = await incident_schema_js_1.createIncidentSchema.parseAsync(req.body);
        const reporterId = req.user?.userId || null;
        // Process uploaded files if present
        const files = req.files || (req.file ? [req.file] : []);
        const mediaData = files.map((file) => ({
            path: `/uploads/${file.filename}`,
        }));
        const incident = await prisma_js_1.prisma.incident.create({
            data: {
                type: validatedData.type,
                description: validatedData.description,
                severity: validatedData.severity,
                lat: validatedData.lat,
                lng: validatedData.lng,
                reporterId,
                status: client_1.IncidentStatus.pending,
                verified: false,
                media: {
                    create: mediaData,
                },
            },
            include: {
                media: true,
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: 'Incident reported successfully',
            data: { incident },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getIncidents(req, res, next) {
    try {
        const query = await incident_schema_js_1.incidentQuerySchema.parseAsync(req.query);
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.severity) {
            where.severity = query.severity;
        }
        if (query.type) {
            where.type = { contains: query.type, mode: 'insensitive' };
        }
        if (query.verified !== undefined) {
            where.verified = query.verified;
        }
        const limit = query.limit || 50;
        const offset = query.offset || 0;
        const [incidents, total] = await Promise.all([
            prisma_js_1.prisma.incident.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
                include: {
                    media: true,
                    reporter: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true,
                        },
                    },
                    tasks: {
                        include: {
                            volunteer: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma_js_1.prisma.incident.count({ where }),
        ]);
        res.json({
            success: true,
            data: {
                total,
                limit,
                offset,
                incidents,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getIncidentById(req, res, next) {
    try {
        const { id } = req.params;
        const incident = await prisma_js_1.prisma.incident.findUnique({
            where: { id },
            include: {
                media: true,
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
                tasks: {
                    include: {
                        volunteer: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        if (!incident) {
            throw new errors_js_1.NotFoundError(`Incident with ID '${id}' not found`);
        }
        res.json({
            success: true,
            data: { incident },
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateIncident(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = await incident_schema_js_1.updateIncidentSchema.parseAsync(req.body);
        const existing = await prisma_js_1.prisma.incident.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new errors_js_1.NotFoundError(`Incident with ID '${id}' not found`);
        }
        const updatedIncident = await prisma_js_1.prisma.incident.update({
            where: { id },
            data: {
                ...(updateData.type && { type: updateData.type }),
                ...(updateData.description && { description: updateData.description }),
                ...(updateData.severity && { severity: updateData.severity }),
                ...(updateData.status && { status: updateData.status }),
                ...(updateData.verified !== undefined && { verified: updateData.verified }),
                ...(updateData.lat !== undefined && { lat: updateData.lat }),
                ...(updateData.lng !== undefined && { lng: updateData.lng }),
            },
            include: {
                media: true,
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
                tasks: true,
            },
        });
        res.json({
            success: true,
            message: 'Incident updated successfully',
            data: { incident: updatedIncident },
        });
    }
    catch (error) {
        next(error);
    }
}
