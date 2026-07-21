import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { scheduleService } from '../services/schedule.service.js';

export const scheduleController = {
  async getWorkingHours(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId } = req.params;
      const hours = await scheduleService.getDoctorWorkingHours(doctorId);
      res.json(hours);
    } catch (error) {
      next(error);
    }
  },

  async updateWorkingHours(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId } = req.params;
      const hoursData = req.body; // Array of working hours
      if (!Array.isArray(hoursData)) {
        res.status(400).json({ error: 'Les horaires de travail doivent être un tableau.' });
        return;
      }
      const updated = await scheduleService.updateDoctorWorkingHours(doctorId, hoursData);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async getUnavailabilities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId } = req.params;
      const { startDate, endDate } = req.query;
      const list = await scheduleService.getDoctorUnavailabilities(
        doctorId,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async createUnavailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await scheduleService.createUnavailability(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },

  async deleteUnavailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await scheduleService.deleteUnavailability(id);
      res.json({ message: 'Indisponibilité supprimée avec succès.' });
    } catch (error) {
      next(error);
    }
  },

  async checkAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId, date, time, durationMinutes, excludeAppointmentId } = req.body;
      if (!doctorId || !date || !time) {
        res.status(400).json({ error: 'Médecin, date et heure sont requis.' });
        return;
      }
      const result = await scheduleService.checkAvailability(
        doctorId,
        date,
        time,
        durationMinutes || 30,
        excludeAppointmentId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getCalendarDay(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      const dateStr = (date as string) || new Date().toISOString().split('T')[0];
      const calendar = await scheduleService.getDoctorCalendarDay(doctorId, dateStr);
      res.json(calendar);
    } catch (error) {
      next(error);
    }
  },
};
