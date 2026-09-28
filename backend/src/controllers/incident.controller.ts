import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { NotFoundError, BadRequestError } from '../lib/errors.js';
import { calculateHaversineDistance } from '../lib/haversine.js';
import {
  emitIncidentNew,
  emitIncidentStatusChange,
  emitTaskAssigned,
} from '../sockets/socketHandler.js';
import {
  CreateIncidentInput,
  UpdateIncidentInput,
  IncidentQueryInput,
  createIncidentSchema,
  updateIncidentSchema,
  incidentQuerySchema,
} from '../schemas/incident.schema.js';
import { IncidentStatus, Severity } from '../types/models.js';



export async function createIncident(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate body (can be form-data or JSON)
    const validatedData: CreateIncidentInput = await createIncidentSchema.parseAsync(req.body);

    const reporterId = req.user?.userId || null;

    // Process uploaded files if present
    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    const mediaData = files.map((file) => ({
      path: `/uploads/${file.filename}`,
    }));

    const incident = await prisma.incident.create({
      data: {
        type: validatedData.type,
        description: validatedData.description,
        severity: validatedData.severity as Severity,
        lat: validatedData.lat,
        lng: validatedData.lng,
        reporterId,
        status: IncidentStatus.pending,
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

    // Real-time broadcast to Authority room
    emitIncidentNew(incident);

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      data: { incident },
    });

  } catch (error) {
    next(error);
  }
}

export async function getIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const query: IncidentQueryInput = await incidentQuerySchema.parseAsync(req.query);

    const where: any = {};

    if (query.status) {
      where.status = query.status as IncidentStatus;
    }
    if (query.severity) {
      where.severity = query.severity as Severity;
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
      prisma.incident.findMany({
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
      prisma.incident.count({ where }),
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
  } catch (error) {
    next(error);
  }
}

export async function getIncidentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({
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
      throw new NotFoundError(`Incident with ID '${id}' not found`);
    }

    res.json({
      success: true,
      data: { incident },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData: UpdateIncidentInput = await updateIncidentSchema.parseAsync(req.body);

    const existing = await prisma.incident.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Incident with ID '${id}' not found`);
    }

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        ...(updateData.type && { type: updateData.type }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.severity && { severity: updateData.severity as Severity }),
        ...(updateData.status && { status: updateData.status as IncidentStatus }),
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

    // Broadcast status change
    emitIncidentStatusChange(updatedIncident);

    res.json({
      success: true,
      message: 'Incident updated successfully',
      data: { incident: updatedIncident },
    });

  } catch (error) {
    next(error);
  }
}

/**
 * GET /incidents/:id/nearby-volunteers
 * Returns available volunteers sorted by Haversine distance,
 * filtered to those seen within the last 5 minutes.
 */
export async function getNearbyVolunteers(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundError(`Incident '${id}' not found`);

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const volunteers = await prisma.user.findMany({
      where: {
        role: 'volunteer',
        available: true,
        lat: { not: null },
        lng: { not: null },
        lastSeenAt: { gte: fiveMinutesAgo },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        lat: true,
        lng: true,
        available: true,
        lastSeenAt: true,
      },
    });

    // Calculate distance and sort
    const withDistance = volunteers
      .filter((v) => v.lat !== null && v.lng !== null)
      .map((v) => ({
        ...v,
        distanceKm: calculateHaversineDistance(
          incident.lat,
          incident.lng,
          v.lat!,
          v.lng!
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      data: {
        incidentId: id,
        incidentLocation: { lat: incident.lat, lng: incident.lng },
        volunteers: withDistance,
        total: withDistance.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /incidents/:id/assign
 * Body: { volunteerId: string }
 * Creates a Task linking the volunteer to the incident and sets incident status to 'assigned'.
 */
export async function assignVolunteer(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body;

    if (!volunteerId) {
      throw new BadRequestError('volunteerId is required in the request body');
    }

    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundError(`Incident '${id}' not found`);

    const volunteer = await prisma.user.findUnique({ where: { id: volunteerId } });
    if (!volunteer) throw new NotFoundError(`Volunteer '${volunteerId}' not found`);
    if (volunteer.role !== 'volunteer') {
      throw new BadRequestError('The specified user is not a volunteer');
    }

    // Check for existing active task on this incident for this volunteer
    const existing = await prisma.task.findFirst({
      where: {
        incidentId: id,
        volunteerId,
        status: { not: 'resolved' },
      },
    });
    if (existing) {
      throw new BadRequestError('This volunteer is already assigned to this incident');
    }

    // Create task and update incident atomically
    const [task] = await prisma.$transaction([
      prisma.task.create({
        data: {
          incidentId: id,
          volunteerId,
          status: 'assigned',
        },
        include: {
          incident: true,
          volunteer: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      }),
      prisma.incident.update({
        where: { id },
        data: { status: 'assigned' },
      }),
    ]);

    // Emit real-time task:assigned to volunteer room & authority room
    emitTaskAssigned(task);

    res.status(201).json({
      success: true,
      message: `Volunteer '${volunteer.name}' assigned to incident`,
      data: { task },
    });

  } catch (error) {
    next(error);
  }
}
