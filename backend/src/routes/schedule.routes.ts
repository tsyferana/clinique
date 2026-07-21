import { Router } from 'express';
import { scheduleController } from '../controllers/schedule.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/doctors/:doctorId/working-hours', scheduleController.getWorkingHours);
router.put('/doctors/:doctorId/working-hours', requireRoles('STAFF', 'ADMIN', 'DOCTOR'), scheduleController.updateWorkingHours);

router.get('/doctors/:doctorId/unavailabilities', scheduleController.getUnavailabilities);
router.post('/unavailabilities', requireRoles('STAFF', 'ADMIN', 'DOCTOR'), scheduleController.createUnavailability);
router.delete('/unavailabilities/:id', requireRoles('STAFF', 'ADMIN', 'DOCTOR'), scheduleController.deleteUnavailability);

router.post('/check-availability', scheduleController.checkAvailability);
router.get('/doctors/:doctorId/calendar/day', scheduleController.getCalendarDay);

export default router;
