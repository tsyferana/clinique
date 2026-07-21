import { z } from 'zod';

export const createConsultationSchema = z.object({
  appointmentId: z.string().optional(),
  patientId: z.string().min(1, 'ID Patient obligatoire.'),
  doctorId: z.string().min(1, 'ID Médecin obligatoire.'),
  reason: z.string().min(1, 'Motif de consultation obligatoire.'),
  symptoms: z.string().optional().default(''),
  temperature: z.number().optional(),
  weight: z.number().optional(),
  bloodPressure: z.string().optional(),
  pulse: z.number().optional(),
  diagnosis: z.string().min(2, 'Diagnostic obligatoire.'),
  observations: z.string().optional(),
  treatmentPlan: z.string().optional().default(''),
});
