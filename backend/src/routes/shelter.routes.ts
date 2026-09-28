import { Router } from 'express';
import { getShelters, createShelter, updateShelter, deleteShelter } from '../controllers/shelter.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { Role } from '../types/models.js';


const router = Router();
router.get('/', getShelters);
router.post('/', authenticateToken, requireRole(Role.authority, Role.admin), createShelter);
router.patch('/:id', authenticateToken, requireRole(Role.authority, Role.admin), updateShelter);
router.delete('/:id', authenticateToken, requireRole(Role.authority, Role.admin), deleteShelter);

export default router;
