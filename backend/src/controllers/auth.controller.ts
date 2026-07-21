import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator.js';

export const authController = {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié.' });
        return;
      }
      const result = await authService.getMe(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié.' });
        return;
      }
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ message: 'Mot de passe modifié avec succès.' });
    } catch (error) {
      next(error);
    }
  },
};
