import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // 1. CORS configuration
  const allowedOrigins = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : true;

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 2. Request body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. Serve static uploaded media files
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // 4. API v1 routes
  app.use('/api/v1', apiRouter);

  // 5. 404 Not Found & Central Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
