import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', prescriptionController.getAll);
router.post('/', requireRoles('DOCTOR', 'ADMIN'), prescriptionController.create);
router.get('/:id', prescriptionController.getById);

export default router;
