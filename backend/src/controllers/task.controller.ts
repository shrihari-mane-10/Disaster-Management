import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../lib/errors.js';
import { UpdateTaskInput, updateTaskSchema } from '../schemas/task.schema.js';
import { TaskStatus } from '../types/models.js';
import { emitTaskStatusChange } from '../sockets/socketHandler.js';


/**
 * GET /tasks/mine – volunteer's assigned tasks
 */
export async function getMyTasks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();

    const tasks = await prisma.task.findMany({
      where: { volunteerId: req.user.userId },
      orderBy: { assignedAt: 'desc' },
      include: {
        incident: {
          include: {
            media: true,
            reporter: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /tasks/:id – single task detail
 */
export async function getTaskById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        incident: {
          include: {
            media: true,
            reporter: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
        volunteer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    if (!task) throw new NotFoundError(`Task '${id}' not found`);

    // Only the assigned volunteer, authority, or admin may view
    const isOwner = task.volunteerId === req.user.userId;
    const isPrivileged = req.user.role === 'authority' || req.user.role === 'admin';
    if (!isOwner && !isPrivileged) {
      throw new ForbiddenError('You do not have access to this task');
    }

    res.json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /tasks/:id – update task status (volunteer or authority)
 * Valid transitions: assigned → enroute → reached → resolved
 */
export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { id } = req.params;
    const body: UpdateTaskInput = await updateTaskSchema.parseAsync(req.body);

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundError(`Task '${id}' not found`);

    const isOwner = task.volunteerId === req.user.userId;
    const isPrivileged = req.user.role === 'authority' || req.user.role === 'admin';
    if (!isOwner && !isPrivileged) {
      throw new ForbiddenError('Only the assigned volunteer or an authority can update this task');
    }

    // Build update data
    const updateData: any = { status: body.status as TaskStatus };
    if (body.status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        incident: {
          include: {
            media: true,
            reporter: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
        volunteer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    // If task resolved, also flip incident status to resolved
    if (body.status === 'resolved') {
      await prisma.incident.update({
        where: { id: task.incidentId },
        data: { status: 'resolved' },
      });
    } else if (body.status === 'enroute' || body.status === 'reached') {
      await prisma.incident.update({
        where: { id: task.incidentId },
        data: { status: 'in_progress' },
      });
    }

    // Broadcast real-time task update to authority & volunteer
    emitTaskStatusChange(updated);

    res.json({
      success: true,
      message: `Task status updated to '${body.status}'`,
      data: { task: updated },
    });
  } catch (error) {
    next(error);
  }
}

