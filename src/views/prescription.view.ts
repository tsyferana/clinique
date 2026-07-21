import { PrescriptionEntity, PrescriptionDTO } from '../types/index.js';
import { patientModel } from '../../backend/src/models/patient.model.js';
import { doctorModel } from '../../backend/src/models/doctor.model.js';
import { prescriptionItemModel } from '../../backend/src/models/prescriptionItem.model.js';

export const prescriptionView = {
  async render(presc: PrescriptionEntity): Promise<PrescriptionDTO> {
    const patient = await patientModel.findById(presc.patient_id);
    const doctor = await doctorModel.findById(presc.doctor_id);
    const items = await prescriptionItemModel.findByPrescriptionId(presc.id);

    return {
      id: presc.id,
      consultationId: presc.consultation_id,
      patientId: presc.patient_id,
      patientName: patient ? `${patient.first_name} ${patient.last_name.toUpperCase()}` : 'Patient Inconnu',
      patientBirthDate: patient?.birth_date,
      patientAddress: patient?.address,
      doctorId: presc.doctor_id,
      doctorName: doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Médecin',
      doctorSpecialty: doctor ? doctor.specialty : 'Médecine Générale',
      doctorLicense: doctor ? doctor.license_number : 'RPPS-000000',
      date: presc.date,
      diagnosis: presc.diagnosis,
      recommendations: presc.recommendations,
      items: items.map((i) => ({
        id: i.id,
        medicationName: i.medication_name,
        dosage: i.dosage,
        frequency: i.frequency,
        duration: i.duration,
        instructions: i.instructions,
      })),
    } as unknown as PrescriptionDTO;
  },

  async renderMany(list: PrescriptionEntity[]): Promise<PrescriptionDTO[]> {
    return Promise.all(list.map((p) => this.render(p)));
  },
};
