import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Le nom du service doit faire au moins 2 caractères.'),
  description: z.string().min(2, 'La description est obligatoire.'),
  durationMinutes: z.number().min(1, 'La durée doit être d au moins 1 minute.'),
  price: z.number().min(0, 'Le prix doit être supérieur ou égal à 0.'),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();
