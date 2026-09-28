import { Router } from 'express';
import { sendAlert, getAlerts } from '../controllers/alert.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { Role } from '../types/models.js';


const router = Router();

// GET /api/v1/alerts - Get alert history (Authenticated users)
router.get('/', authenticateToken, getAlerts);

// POST /api/v1/alerts/send - Broadcast emergency alert (Authority & Admin only)
router.post('/send', authenticateToken, requireRole(Role.authority, Role.admin), sendAlert);

export default router;
