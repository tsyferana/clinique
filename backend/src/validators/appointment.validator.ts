import { z } from 'zod';

const todayDateString = () => new Date().toISOString().split('T')[0];

export const createAppointmentSchema = z.object({
  patientId: z.string().optional(),
  serviceId: z.string().min(1, 'Service obligatoire.'),
  doctorId: z.string().optional(),
  date: z.string().min(8, 'Date obligatoire (YYYY-MM-DD).').refine(val => val >= todayDateString(), { message: 'La date ne peut pas être dans le passé.' }),
  time: z.string().min(4, 'Heure obligatoire (HH:mm).'),
  reason: z.string().min(3, 'Le motif du rendez-vous est obligatoire.'),
  description: z.string().optional(),
});

export const approveAppointmentSchema = z.object({
  doctorId: z.string().optional(),
});

export const rejectAppointmentSchema = z.object({
  reason: z.string().min(3, 'Le motif du refus est obligatoire.'),
});

export const rescheduleAppointmentSchema = z.object({
  newDate: z.string().min(8, 'Nouvelle date obligatoire.').refine(val => val >= todayDateString(), { message: 'La nouvelle date ne peut pas être dans le passé.' }),
  newTime: z.string().min(4, 'Nouvelle heure obligatoire.'),
});
