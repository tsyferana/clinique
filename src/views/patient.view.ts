import { PatientEntity, PatientDTO } from '../types/index.js';

function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

export const patientView = {
  async render(patient: PatientEntity): Promise<PatientDTO> {
    return {
      id: patient.id,
      userId: patient.user_id,
      firstName: patient.first_name,
      lastName: patient.last_name,
      fullName: `${patient.first_name} ${patient.last_name.toUpperCase()}`,
      gender: patient.gender,
      birthDate: patient.birth_date,
      age: calculateAge(patient.birth_date),
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      bloodGroup: patient.blood_group,
      allergies: patient.allergies,
      medicalHistory: patient.medical_history,
      emergencyContact: patient.emergency_contact,
    } as unknown as PatientDTO;
  },

  async renderMany(patients: PatientEntity[]): Promise<PatientDTO[]> {
    return Promise.all(patients.map((p) => this.render(p)));
  },
};
