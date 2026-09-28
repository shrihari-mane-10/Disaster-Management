import { Router } from 'express';
import { getResources, createResource, updateResource, deleteResource } from '../controllers/resource.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { Role } from '../types/models.js';


const router = Router();
router.get('/', getResources);
router.post('/', authenticateToken, requireRole(Role.authority, Role.admin), createResource);
router.patch('/:id', authenticateToken, requireRole(Role.authority, Role.admin), updateResource);
router.delete('/:id', authenticateToken, requireRole(Role.authority, Role.admin), deleteResource);

export default router;
