import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { UserRole } from '../../../src/types/index.js';

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Accès refusé. Rôle requis: [${allowedRoles.join(', ')}]. Votre rôle: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};
