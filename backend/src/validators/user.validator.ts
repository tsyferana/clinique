import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email invalide.'),
  password: z.string().min(6, 'Mot de passe au moins 6 caractères.'),
  role: z.enum(['PATIENT', 'STAFF', 'DOCTOR', 'ADMIN']),
  firstName: z.string().min(2, 'Prénom obligatoire.'),
  lastName: z.string().min(2, 'Nom obligatoire.'),
  phone: z.string().min(8, 'Téléphone obligatoire.'),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
  cabinetNumber: z.string().optional(),
  serviceId: z.string().optional(),
  department: z.string().optional(),
});
