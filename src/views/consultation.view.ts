import { ConsultationEntity, ConsultationDTO } from '../types/index.js';
import { patientModel } from '../../backend/src/models/patient.model.js';
import { doctorModel } from '../../backend/src/models/doctor.model.js';
import { prescriptionModel } from '../../backend/src/models/prescription.model.js';

function calculateAge(birthDateStr?: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : 0;
}

export const consultationView = {
  async render(cons: ConsultationEntity): Promise<ConsultationDTO> {
    const patient = await patientModel.findById(cons.patient_id);
    const doctor = await doctorModel.findById(cons.doctor_id);
    const prescriptionList = await prescriptionModel.findByConsultationId(cons.id);
    const prescription = prescriptionList.length > 0 ? prescriptionList[0] : null;

    return {
      id: cons.id,
      appointmentId: cons.appointment_id,
      patientId: cons.patient_id,
      patientName: patient ? `${patient.first_name} ${patient.last_name.toUpperCase()}` : 'Patient Inconnu',
      patientBirthDate: patient?.birth_date,
      patientAge: patient ? calculateAge(patient.birth_date) : 0,
      patientGender: patient?.gender,
      doctorId: cons.doctor_id,
      doctorName: doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Médecin',
      doctorSpecialty: doctor?.specialty,
      date: cons.date,
      reason: cons.reason,
      symptoms: cons.symptoms,
      vitals: {
        temperature: cons.temperature,
        weight: cons.weight,
        bloodPressure: cons.blood_pressure,
      },
      diagnosis: cons.diagnosis,
      observations: cons.observations,
      treatmentPlan: cons.treatment_plan,
      hasPrescription: !!prescription,
      prescriptionId: prescription?.id,
      createdAt: cons.created_at,
    } as unknown as ConsultationDTO;
  },

  async renderMany(list: ConsultationEntity[]): Promise<ConsultationDTO[]> {
    return Promise.all(list.map((c) => this.render(c)));
  },
};
