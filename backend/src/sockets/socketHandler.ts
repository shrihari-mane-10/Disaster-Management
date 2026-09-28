import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken, TokenPayload } from '../lib/jwt.js';
import { locationStore } from './locationStore.js';
import { Incident, Task, Alert } from '@prisma/client';

let io: Server | null = null;

export function initSocketIO(httpServer: HttpServer): Server {
  const allowedOrigins = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : true;

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const liveNamespace = io.of('/live');

  // Middleware for JWT Authentication on handshake
  liveNamespace.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.split(' ')[1]
          : null);

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const payload = verifyToken(token);
      socket.data.user = payload;
      next();
    } catch (err: any) {
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  // Handle Client Connections
  liveNamespace.on('connection', (socket: Socket) => {
    const user: TokenPayload = socket.data.user;
    console.log(`🔌 [Socket.IO] User connected: ${user.email} (${user.role}) [Socket ID: ${socket.id}]`);

    // 1. Join Role and User specific rooms
    if (user.role === 'authority' || user.role === 'admin') {
      socket.join('authority');
      console.log(`🏛️ [Socket.IO] ${user.email} joined room 'authority'`);

      // Send initial snapshot of all active volunteer locations to authority
      const activeVolunteers = locationStore.getVolunteerLocations();
      socket.emit('volunteers:snapshot', activeVolunteers);
    } else if (user.role === 'volunteer') {
      socket.join(`volunteer:${user.userId}`);
      console.log(`🦺 [Socket.IO] ${user.email} joined room 'volunteer:${user.userId}'`);
    } else if (user.role === 'citizen') {
      socket.join(`citizen:${user.userId}`);
      console.log(`👤 [Socket.IO] ${user.email} joined room 'citizen:${user.userId}'`);
    }

    // 2. Listen for periodic location updates from clients (Volunteers / Citizens)
    socket.on('location:update', (data: { lat: number; lng: number; name?: string }) => {
      if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        locationStore.setLocation(user.userId, {
          name: data.name || user.email,
          role: user.role,
          lat: data.lat,
          lng: data.lng,
        });

        // Broadcast updated position to Authority room in real-time
        liveNamespace.to('authority').emit('location:update', {
          userId: user.userId,
          name: data.name || user.email,
          role: user.role,
          lat: data.lat,
          lng: data.lng,
          lastSeenAt: new Date(),
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ [Socket.IO] User disconnected: ${user.email} (${reason})`);
    });
  });

  return io;
}

/**
 * Emit event helpers for backend controllers
 */

export function emitIncidentNew(incident: any) {
  if (!io) return;
  console.log(`📢 [Socket.IO Emit] 'incident:new' -> authority room`);
  io.of('/live').to('authority').emit('incident:new', incident);
}

export function emitIncidentStatusChange(incident: any) {
  if (!io) return;
  console.log(`📢 [Socket.IO Emit] 'incident:statusChange' -> authority & citizen:${incident.reporterId}`);
  io.of('/live').to('authority').emit('incident:statusChange', incident);

  if (incident.reporterId) {
    io.of('/live').to(`citizen:${incident.reporterId}`).emit('incident:statusChange', incident);
  }
}

export function emitTaskAssigned(task: any) {
  if (!io) return;
  console.log(`📢 [Socket.IO Emit] 'task:assigned' -> volunteer:${task.volunteerId} & authority`);
  io.of('/live').to(`volunteer:${task.volunteerId}`).emit('task:assigned', task);
  io.of('/live').to('authority').emit('task:assigned', task);
}

export function emitTaskStatusChange(task: any) {
  if (!io) return;
  console.log(`📢 [Socket.IO Emit] 'task:statusChange' -> authority & volunteer:${task.volunteerId}`);
  io.of('/live').to('authority').emit('task:statusChange', task);
  io.of('/live').to(`volunteer:${task.volunteerId}`).emit('task:statusChange', task);

  if (task.incident?.reporterId) {
    io.of('/live').to(`citizen:${task.incident.reporterId}`).emit('incident:statusChange', task.incident);
  }
}

export function emitAlertBroadcast(alert: any) {
  if (!io) return;
  console.log(`🚨 [Socket.IO Emit] 'alert:broadcast' -> all connected clients`);
  io.of('/live').emit('alert:broadcast', alert);
}
