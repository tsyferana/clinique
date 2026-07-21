import { consultationModel } from '../models/consultation.model.js';
import { appointmentModel } from '../models/appointment.model.js';
import { queueEntryModel } from '../models/queueEntry.model.js';
import { consultationView } from '../../../src/views/consultation.view.js';
import { ConsultationDTO } from '../../../src/types/index.js';

export class ConsultationService {
  async createConsultation(data: {
    appointmentId?: string;
    patientId: string;
    doctorId: string;
    reason: string;
    symptoms?: string;
    temperature?: number;
    weight?: number;
    bloodPressure?: string;
    pulse?: number;
    diagnosis: string;
    observations?: string;
    treatmentPlan?: string;
  }): Promise<ConsultationDTO> {
    const todayStr = new Date().toISOString().split('T')[0];

    const cons = await consultationModel.create({
      appointment_id: data.appointmentId,
      patient_id: data.patientId,
      doctor_id: data.doctorId,
      date: todayStr,
      reason: data.reason,
      symptoms: data.symptoms || '',
      temperature: data.temperature,
      weight: data.weight,
      blood_pressure: data.bloodPressure,
      diagnosis: data.diagnosis,
      observations: data.observations,
      treatment_plan: data.treatmentPlan || '',
    });

    if (data.appointmentId) {
      await appointmentModel.update(data.appointmentId, {
        status: 'COMPLETED',
      });

      const qEntry = await queueEntryModel.findByAppointmentId(data.appointmentId);
      if (qEntry) {
        await queueEntryModel.update(qEntry.id, {
          status: 'COMPLETED',
          end_time: new Date().toISOString(),
        });
      }
    }

    // Also check for any active today queue entry for this patient & doctor
    if (data.patientId) {
      const todayEntries = await queueEntryModel.findTodayEntries();
      const activeForPatient = todayEntries.find(
        (e) => e.patient_id === data.patientId && (e.doctor_id === data.doctorId || !data.doctorId) && e.status !== 'COMPLETED'
      );
      if (activeForPatient) {
        await queueEntryModel.update(activeForPatient.id, {
          status: 'COMPLETED',
          end_time: new Date().toISOString(),
        });
        if (activeForPatient.appointment_id) {
          await appointmentModel.update(activeForPatient.appointment_id, {
            status: 'COMPLETED',
          });
        }
      }
    }

    return consultationView.render(cons);
  }

  async getConsultationById(id: string): Promise<ConsultationDTO> {
    const cons = await consultationModel.findById(id);
    if (!cons) throw new Error('Consultation introuvable.');
    return consultationView.render(cons);
  }

  async getPatientConsultations(patientId: string): Promise<ConsultationDTO[]> {
    const list = await consultationModel.findByPatient(patientId);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return consultationView.renderMany(list);
  }

  async getDoctorConsultations(doctorId: string): Promise<ConsultationDTO[]> {
    const list = await consultationModel.findByDoctorId(doctorId);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return consultationView.renderMany(list);
  }
}

export const consultationService = new ConsultationService();
