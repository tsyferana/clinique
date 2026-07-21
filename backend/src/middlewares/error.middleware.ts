import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    const issues = err.issues || (err as any).errors || [];
    res.status(400).json({
      error: 'Erreur de validation des données.',
      details: issues.map((e: any) => ({ field: e.path ? e.path.join('.') : '', message: e.message })),
    });
    return;
  }

  if (err.name === 'ScheduleConflictError' || err.conflictReason) {
    res.status(409).json({
      error: err.message,
      conflictReason: err.conflictReason || err.message,
      alternativeSlots: err.alternativeSlots || [],
    });
    return;
  }

  const message = err.message || 'Une erreur interne est survenue sur le serveur.';
  const status = err.status || 400;

  res.status(status).json({ error: message });
};
