import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { UnauthorizedError } from '../lib/errors.js';
import { updateLocationSchema, UpdateLocationInput } from '../schemas/user.schema.js';

/**
 * POST /users/me/location – update the calling user's lat/lng and lastSeenAt
 */
export async function updateMyLocation(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();

    const body: UpdateLocationInput = await updateLocationSchema.parseAsync(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        lat: body.lat,
        lng: body.lng,
        lastSeenAt: new Date(),
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        lastSeenAt: true,
        available: true,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /users/me/availability – toggle available flag
 */
export async function toggleAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();

    const current = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { available: true },
    });

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { available: !current?.available },
      select: {
        id: true,
        name: true,
        available: true,
        lat: true,
        lng: true,
        lastSeenAt: true,
      },
    });

    res.json({
      success: true,
      message: `Availability set to ${user.available ? 'ACTIVE' : 'INACTIVE'}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
