import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { consultationService } from '../services/consultation.service.js';
import { createConsultationSchema } from '../validators/consultation.validator.js';

export const consultationController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.body.doctorId && req.user?.role === 'DOCTOR') {
        const { doctorModel } = await import('../models/doctor.model.js');
        const doctor = await doctorModel.findByUserId(req.user.id);
        if (doctor) req.body.doctorId = doctor.id;
      }
      const data = createConsultationSchema.parse(req.body);
      const result = await consultationService.createConsultation(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await consultationService.getConsultationById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getPatientConsultations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId } = req.params;
      const list = await consultationService.getPatientConsultations(patientId);
      res.json(list);
    } catch (error) {
      next(error);
    }
  },
};
