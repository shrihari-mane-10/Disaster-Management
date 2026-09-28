import { Router } from 'express';
import { getMyTasks, getTaskById, updateTask } from '../controllers/task.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/tasks/mine – list tasks for the logged-in volunteer
router.get('/mine', authenticateToken, getMyTasks);

// GET /api/v1/tasks/:id – single task detail
router.get('/:id', authenticateToken, getTaskById);

// PATCH /api/v1/tasks/:id – update task status
router.patch('/:id', authenticateToken, updateTask);

export default router;
