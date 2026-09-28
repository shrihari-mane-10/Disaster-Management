import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../lib/errors.js';

export async function getResources(req: Request, res: Response, next: NextFunction) {
  try {
    const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { resources } });
  } catch (error) { next(error); }
}

export async function createResource(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, quantity, lat, lng, status } = req.body;
    const resource = await prisma.resource.create({
      data: { type, quantity: Number(quantity), lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null, status: status || 'available' },
    });
    res.status(201).json({ success: true, data: { resource } });
  } catch (error) { next(error); }
}

export async function updateResource(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`Resource '${id}' not found`);
    const { type, quantity, lat, lng, status } = req.body;
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(lat !== undefined && { lat: Number(lat) }),
        ...(lng !== undefined && { lng: Number(lng) }),
        ...(status !== undefined && { status }),
      },
    });
    res.json({ success: true, data: { resource } });
  } catch (error) { next(error); }
}

export async function deleteResource(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.resource.delete({ where: { id } });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) { next(error); }
}
