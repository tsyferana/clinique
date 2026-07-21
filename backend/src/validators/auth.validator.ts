import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
  firstName: z.string().min(2, 'Le prénom doit comporter au moins 2 caractères.'),
  lastName: z.string().min(2, 'Le nom doit comporter au moins 2 caractères.'),
  phone: z.string().min(8, 'Numéro de téléphone invalide.'),
  gender: z.enum(['M', 'F', 'OTHER']),
  birthDate: z.string().min(8, 'Date de naissance obligatoire.'),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  password: z.string().min(1, 'Mot de passe obligatoire.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel obligatoire.'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit faire au moins 6 caractères.'),
});
