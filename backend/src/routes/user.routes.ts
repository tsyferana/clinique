import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/doctors', userController.getDoctors);
router.get('/services', userController.getServices);

router.use(authenticateToken);

router.put('/doctor/profile', requireRoles('DOCTOR'), userController.updateDoctorProfile);
router.put('/admin/doctor/:userId/profile', requireRoles('ADMIN'), userController.updateDoctorProfileByAdmin);

router.get('/', requireRoles('ADMIN'), userController.getAll);
router.post('/', requireRoles('ADMIN'), userController.create);
router.put('/:id', requireRoles('ADMIN'), userController.update);
router.delete('/:id', requireRoles('ADMIN'), userController.delete);

router.post('/services', requireRoles('ADMIN'), userController.createService);
router.put('/services/:id', requireRoles('ADMIN'), userController.updateService);
router.delete('/services/:id', requireRoles('ADMIN'), userController.deleteService);

export default router;
