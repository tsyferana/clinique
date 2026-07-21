import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { userService } from '../services/user.service.js';
import { patientModel } from '../models/patient.model.js';
import { patientView } from '../../../src/views/patient.view.js';

export const patientController = {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query.q as string | undefined;
      const patients = await userService.getAllPatients(q);
      res.json(patients);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await userService.getPatientById(id);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await patientModel.update(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Patient non trouvé.' });
        return;
      }
      res.json(await patientView.render(updated));
    } catch (error) {
      next(error);
    }
  },
};
