import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { prescriptionService } from '../services/prescription.service.js';
import { createPrescriptionSchema } from '../validators/prescription.validator.js';
import { doctorModel } from '../models/doctor.model.js';

export const prescriptionController = {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let doctorId: string | undefined;
      if (req.user?.role === 'DOCTOR') {
        const doctor = await doctorModel.findByUserId(req.user.id);
        if (doctor) doctorId = doctor.id;
      }
      const list = await prescriptionService.getAllPrescriptions(doctorId);
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.body.doctorId && req.user?.role === 'DOCTOR') {
        const doctor = await doctorModel.findByUserId(req.user.id);
        if (doctor) req.body.doctorId = doctor.id;
      }
      const data = createPrescriptionSchema.parse(req.body);
      const result = await prescriptionService.createPrescription(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await prescriptionService.getPrescriptionById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getPatientPrescriptions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId } = req.params;
      const list = await prescriptionService.getPatientPrescriptions(patientId);
      res.json(list);
    } catch (error) {
      next(error);
    }
  },
};
