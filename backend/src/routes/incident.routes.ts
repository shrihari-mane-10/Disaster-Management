import { Router } from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  getNearbyVolunteers,
  assignVolunteer,
} from '../controllers/incident.controller.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { incidentRateLimiter } from '../middleware/rateLimiter.js';
import { Role } from '../types/models.js';


const router = Router();

// POST /api/v1/incidents
router.post('/', incidentRateLimiter, optionalAuth, upload.array('media', 5), createIncident);

// GET /api/v1/incidents
router.get('/', getIncidents);

// GET /api/v1/incidents/:id
router.get('/:id', getIncidentById);

// PATCH /api/v1/incidents/:id
router.patch('/:id', authenticateToken, requireRole(Role.authority, Role.admin, Role.volunteer, Role.citizen), updateIncident);

// GET /api/v1/incidents/:id/nearby-volunteers
router.get('/:id/nearby-volunteers', authenticateToken, requireRole(Role.authority, Role.admin), getNearbyVolunteers);

// POST /api/v1/incidents/:id/assign
router.post('/:id/assign', authenticateToken, requireRole(Role.authority, Role.admin), assignVolunteer);

export default router;
