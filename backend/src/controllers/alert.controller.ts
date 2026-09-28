import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendAlertSchema, alertQuerySchema, SendAlertInput, AlertQueryInput } from '../schemas/alert.schema.js';
import { notificationService } from '../services/notifications/notificationProvider.js';
import { UnauthorizedError } from '../lib/errors.js';
import { AlertChannel, Severity } from '../types/models.js';


/**
 * POST /alerts/send
 * Broadcasts an emergency alert across both Socket.IO and Mock SMS channels
 */
export async function sendAlert(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();

    const input: SendAlertInput = await sendAlertSchema.parseAsync(req.body);

    // Broadcast across Notification Providers (Socket & Mock SMS)
    const results = await notificationService.broadcastAlert({
      message: input.message,
      severity: input.severity as Severity,
      region: input.region,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert dispatched successfully across all communication channels',
      data: {
        broadcastResults: results,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /alerts
 * Fetch alert history with optional channel, severity, and region filters
 */
export async function getAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const query: AlertQueryInput = await alertQuerySchema.parseAsync(req.query);

    const where: any = {};
    if (query.channel) where.channel = query.channel as AlertChannel;
    if (query.severity) where.severity = query.severity as Severity;
    if (query.region) where.region = { contains: query.region, mode: 'insensitive' };

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
      take: 100,
    });

    res.json({
      success: true,
      data: {
        alerts,
        total: alerts.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
