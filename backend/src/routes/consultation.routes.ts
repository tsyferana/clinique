import { Router } from 'express';
import { consultationController } from '../controllers/consultation.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRoles('DOCTOR', 'ADMIN'), consultationController.create);
router.get('/:id', consultationController.getById);

export default router;
