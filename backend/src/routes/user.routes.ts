import { Router } from 'express';
import { updateMyLocation, toggleAvailability } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/v1/users/me/location – periodic GPS ping
router.post('/me/location', authenticateToken, updateMyLocation);

// PATCH /api/v1/users/me/availability – toggle on/off duty
router.patch('/me/availability', authenticateToken, toggleAvailability);

export default router;
