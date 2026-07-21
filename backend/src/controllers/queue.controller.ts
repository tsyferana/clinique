import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { queueService } from '../services/queue.service.js';
import { addToQueueSchema } from '../validators/queue.validator.js';

export const queueController = {
  async addToQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = addToQueueSchema.parse(req.body);
      const result = await queueService.addToQueue(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getTodayQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.query.doctorId as string | undefined;
      const queue = await queueService.getTodayQueue(doctorId);
      res.json(queue);
    } catch (error) {
      next(error);
    }
  },

  async callPatient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await queueService.callPatient(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async startConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await queueService.startConsultation(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async completeQueueEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await queueService.completeQueueEntry(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
