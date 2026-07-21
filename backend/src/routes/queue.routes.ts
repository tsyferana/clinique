import { Router } from 'express';
import { queueController } from '../controllers/queue.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRoles('STAFF', 'ADMIN'), queueController.addToQueue);
router.get('/today', requireRoles('STAFF', 'ADMIN', 'DOCTOR'), queueController.getTodayQueue);
router.put('/:id/call', requireRoles('STAFF', 'ADMIN', 'DOCTOR'), queueController.callPatient);
router.put('/:id/start', requireRoles('DOCTOR', 'ADMIN'), queueController.startConsultation);
router.put('/:id/complete', requireRoles('DOCTOR', 'ADMIN'), queueController.completeQueueEntry);

export default router;
