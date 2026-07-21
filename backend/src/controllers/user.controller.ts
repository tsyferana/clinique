import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { userService } from '../services/user.service.js';
import { createUserSchema } from '../validators/user.validator.js';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator.js';

export const userController = {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userService.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await userService.updateUser(id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.json({ message: 'Utilisateur supprimé.' });
    } catch (error) {
      next(error);
    }
  },

  async getDoctors(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctors = await userService.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      next(error);
    }
  },

  async getServices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await userService.getAllServices();
      res.json(services);
    } catch (error) {
      next(error);
    }
  },

  async createService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createServiceSchema.parse(req.body);
      const service = await userService.createService(data);
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  },

  async updateService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = updateServiceSchema.parse(req.body);
      const service = await userService.updateService(id, data);
      res.json(service);
    } catch (error) {
      next(error);
    }
  },

  async deleteService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteService(id);
      res.json({ message: 'Service supprimé avec succès.' });
    } catch (error) {
      next(error);
    }
  },

  async updateDoctorProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'DOCTOR') {
        res.status(403).json({ error: 'Accès réservé aux médecins.' });
        return;
      }
      const result = await userService.updateDoctorProfile(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async updateDoctorProfileByAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const result = await userService.updateDoctorProfileByAdmin(userId, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};

