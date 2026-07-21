import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  async getAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getAdminStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async getStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getStaffStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async getDoctor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié.' });
        return;
      }
      const stats = await dashboardService.getDoctorStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async getPatient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié.' });
        return;
      }
      const stats = await dashboardService.getPatientStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
