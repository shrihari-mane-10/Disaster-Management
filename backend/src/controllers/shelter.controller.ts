import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../lib/errors.js';

export async function getShelters(req: Request, res: Response, next: NextFunction) {
  try {
    const shelters = await prisma.shelter.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { shelters } });
  } catch (error) { next(error); }
}

export async function createShelter(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, lat, lng, capacity, occupancy } = req.body;
    const shelter = await prisma.shelter.create({
      data: { name, lat: Number(lat), lng: Number(lng), capacity: Number(capacity), occupancy: occupancy ? Number(occupancy) : 0 },
    });
    res.status(201).json({ success: true, data: { shelter } });
  } catch (error) { next(error); }
}

export async function updateShelter(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.shelter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`Shelter '${id}' not found`);
    const { name, lat, lng, capacity, occupancy } = req.body;
    const shelter = await prisma.shelter.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(lat !== undefined && { lat: Number(lat) }),
        ...(lng !== undefined && { lng: Number(lng) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(occupancy !== undefined && { occupancy: Number(occupancy) }),
      },
    });
    res.json({ success: true, data: { shelter } });
  } catch (error) { next(error); }
}

export async function deleteShelter(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.shelter.delete({ where: { id } });
    res.json({ success: true, message: 'Shelter deleted' });
  } catch (error) { next(error); }
}
