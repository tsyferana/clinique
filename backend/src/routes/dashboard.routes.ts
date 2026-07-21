import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/admin', requireRoles('ADMIN'), dashboardController.getAdmin);
router.get('/staff', requireRoles('STAFF', 'ADMIN'), dashboardController.getStaff);
router.get('/doctor', requireRoles('DOCTOR', 'ADMIN'), dashboardController.getDoctor);
router.get('/patient', requireRoles('PATIENT', 'ADMIN'), dashboardController.getPatient);

export default router;
