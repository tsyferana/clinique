import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { appointmentService } from '../services/appointment.service.js';
import { ticketService } from '../services/ticket.service.js';
import {
  createAppointmentSchema,
  approveAppointmentSchema,
  rejectAppointmentSchema,
  rescheduleAppointmentSchema,
} from '../validators/appointment.validator.js';

export const appointmentController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createAppointmentSchema.parse(req.body);
      const result = await appointmentService.createAppointmentRequest({
        ...body,
        userId: req.user?.id,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getMy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié.' });
        return;
      }
      const list = await appointmentService.getPatientAppointments(req.user.id);
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, date, doctorId } = req.query;
      const list = await appointmentService.getAllAppointments({
        status: status as any,
        date: date as string,
        doctorId: doctorId as string,
      });
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await appointmentService.getAppointmentById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async approve(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { doctorId } = approveAppointmentSchema.parse(req.body);
      const result = await appointmentService.approveAppointment(id, doctorId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async reject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = rejectAppointmentSchema.parse(req.body);
      const result = await appointmentService.rejectAppointment(id, reason);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async reschedule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { newDate, newTime } = rescheduleAppointmentSchema.parse(req.body);
      const result = await appointmentService.rescheduleAppointment(id, newDate, newTime);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async arrived(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await appointmentService.markPatientArrived(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié.' });
        return;
      }
      const result = await appointmentService.cancelAppointment(id, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ticket = await ticketService.getTicketByAppointmentId(id);
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  },
};
