import { Router } from 'express';
import { patientController } from '../controllers/patient.controller.js';
import { consultationController } from '../controllers/consultation.controller.js';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRoles('STAFF', 'ADMIN', 'DOCTOR'), patientController.getAll);
router.get('/:id', patientController.getById);
router.put('/:id', requireRoles('STAFF', 'ADMIN', 'PATIENT'), patientController.update);

router.get('/:patientId/consultations', consultationController.getPatientConsultations);
router.get('/:patientId/prescriptions', prescriptionController.getPatientPrescriptions);

export default router;
