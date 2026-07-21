import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  consultationId: z.string().min(1, 'ID Consultation obligatoire.'),
  patientId: z.string().min(1, 'ID Patient obligatoire.'),
  doctorId: z.string().min(1, 'ID Médecin obligatoire.'),
  diagnosis: z.string().min(2, 'Diagnostic obligatoire.'),
  recommendations: z.string().optional(),
  items: z.array(
    z.object({
      medicationName: z.string().min(1, 'Nom du médicament obligatoire.'),
      dosage: z.string().min(1, 'Dosage obligatoire.'),
      frequency: z.string().min(1, 'Fréquence obligatoire.'),
      duration: z.string().min(1, 'Durée obligatoire.'),
      instructions: z.string().optional(),
    })
  ).min(1, 'Au moins un médicament est obligatoire.'),
});
