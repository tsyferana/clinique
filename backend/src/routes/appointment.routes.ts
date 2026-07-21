import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', appointmentController.create);
router.get('/my', requireRoles('PATIENT'), appointmentController.getMy);
router.get('/', requireRoles('STAFF', 'ADMIN', 'DOCTOR'), appointmentController.getAll);
router.get('/:id', appointmentController.getById);
router.get('/:id/ticket', appointmentController.getTicket);

router.put('/:id/approve', requireRoles('STAFF', 'ADMIN'), appointmentController.approve);
router.put('/:id/reject', requireRoles('STAFF', 'ADMIN'), appointmentController.reject);
router.put('/:id/reschedule', requireRoles('STAFF', 'ADMIN'), appointmentController.reschedule);
router.put('/:id/arrived', requireRoles('STAFF', 'ADMIN'), appointmentController.arrived);
router.put('/:id/cancel', appointmentController.cancel);

export default router;
