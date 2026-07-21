import { prescriptionModel } from '../models/prescription.model.js';
import { prescriptionItemModel } from '../models/prescriptionItem.model.js';
import { prescriptionView } from '../../../src/views/prescription.view.js';
import { PrescriptionDTO } from '../../../src/types/index.js';

export class PrescriptionService {
  async createPrescription(data: {
    consultationId: string;
    patientId: string;
    doctorId: string;
    diagnosis: string;
    recommendations?: string;
    items: Array<{
      medicationName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
  }): Promise<PrescriptionDTO> {
    const todayStr = new Date().toISOString().split('T')[0];

    const presc = await prescriptionModel.create({
      consultation_id: data.consultationId,
      patient_id: data.patientId,
      doctor_id: data.doctorId,
      date: todayStr,
      diagnosis: data.diagnosis,
      recommendations: data.recommendations,
    });

    await prescriptionItemModel.createMany(
      data.items.map((item) => ({
        prescription_id: presc.id,
        medication_name: item.medicationName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      }))
    );

    return prescriptionView.render(presc);
  }

  async getPrescriptionById(id: string): Promise<PrescriptionDTO> {
    const presc = await prescriptionModel.findById(id);
    if (!presc) throw new Error('Ordonnance introuvable.');
    return prescriptionView.render(presc);
  }

  async getPatientPrescriptions(patientId: string): Promise<PrescriptionDTO[]> {
    const list = await prescriptionModel.findByPatientId(patientId);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return prescriptionView.renderMany(list);
  }

  async getAllPrescriptions(doctorId?: string): Promise<PrescriptionDTO[]> {
    const list = doctorId ? await prescriptionModel.findByDoctorId(doctorId) : await prescriptionModel.findAll();
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return prescriptionView.renderMany(list);
  }
}

export const prescriptionService = new PrescriptionService();
