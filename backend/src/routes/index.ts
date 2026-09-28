import { Router } from 'express';
import authRoutes from './auth.routes.js';
import incidentRoutes from './incident.routes.js';
import taskRoutes from './task.routes.js';
import userRoutes from './user.routes.js';
import resourceRoutes from './resource.routes.js';
import shelterRoutes from './shelter.routes.js';
import alertRoutes from './alert.routes.js';

const router = Router();


router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'disaster-response-backend',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/resources', resourceRoutes);
router.use('/shelters', shelterRoutes);
router.use('/alerts', alertRoutes);

export default router;

