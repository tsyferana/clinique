import { z } from 'zod';

export const addToQueueSchema = z.object({
  appointmentId: z.string().optional(),
  patientId: z.string().min(1, 'ID Patient obligatoire.'),
  doctorId: z.string().min(1, 'Médecin obligatoire.'),
  serviceId: z.string().min(1, 'Service obligatoire.'),
  isWalkIn: z.boolean().optional(),
});
