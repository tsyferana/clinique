import { queueEntryModel } from '../models/queueEntry.model.js';
import { appointmentModel } from '../models/appointment.model.js';
import { patientModel } from '../models/patient.model.js';
import { doctorModel } from '../models/doctor.model.js';
import { serviceModel } from '../models/service.model.js';
import { QueueEntryDTO, QueueStatus } from '../../../src/types/index.js';

export class QueueService {
  private async formatQueueDTO(entry: any): Promise<QueueEntryDTO> {
    const patient = await patientModel.findById(entry.patient_id);
    const doctor = await doctorModel.findById(entry.doctor_id);
    const service = await serviceModel.findById(entry.service_id);

    return {
      id: entry.id,
      appointmentId: entry.appointment_id,
      patientId: entry.patient_id,
      patientName: patient ? `${patient.first_name} ${patient.last_name.toUpperCase()}` : 'Patient Inconnu',
      patientPhone: patient ? patient.phone : '',
      doctorId: entry.doctor_id,
      doctorName: doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Médecin',
      serviceName: service ? service.name : 'Consultation',
      ticketNumber: entry.ticket_number,
      position: entry.position,
      status: entry.status,
      arrivalTime: entry.arrival_time,
      calledTime: entry.called_time,
      startTime: entry.start_time,
      endTime: entry.end_time,
    };
  }

  async addToQueue(data: {
    appointmentId?: string;
    patientId: string;
    doctorId: string;
    serviceId: string;
    isWalkIn?: boolean;
  }): Promise<any> {
    const todayEntries = await queueEntryModel.findTodayEntries();
    const position = todayEntries.length + 1;

    const doctor = await doctorModel.findById(data.doctorId);
    const prefix = doctor ? doctor.last_name.charAt(0).toUpperCase() : 'A';
    const ticketNum = `${prefix}-${position.toString().padStart(3, '0')}`;

    const now = new Date().toISOString();

    const entry = await queueEntryModel.create({
      appointment_id: data.appointmentId,
      patient_id: data.patientId,
      doctor_id: data.doctorId,
      service_id: data.serviceId,
      ticket_number: ticketNum,
      position,
      status: 'WAITING',
      arrival_time: now,
    });

    if (data.appointmentId) {
      await appointmentModel.update(data.appointmentId, {
        status: 'IN_QUEUE',
      });
    } else if (data.isWalkIn) {
      // Create a walk-in appointment record as well
      const todayStr = now.split('T')[0];
      const timeStr = now.split('T')[1].substring(0, 5);
      await appointmentModel.create({
        patient_id: data.patientId,
        doctor_id: data.doctorId,
        service_id: data.serviceId,
        appointment_date: todayStr,
        appointment_time: timeStr,
        status: 'IN_QUEUE',
        reason: 'Visite sans rendez-vous (Accueil direct)',
        ticket_number: ticketNum,
        is_walk_in: true,
      });
    }

    return this.formatQueueDTO(entry);
  }

  async callPatient(queueId: string): Promise<any> {
    const entry = await queueEntryModel.findById(queueId);
    if (!entry) throw new Error('Entrée en file introuvable.');

    const now = new Date().toISOString();
    const updated = await queueEntryModel.update(queueId, {
      status: 'CALLED',
      called_time: now,
    });

    if (!updated) throw new Error('Échec du changement de statut.');

    return this.formatQueueDTO(updated);
  }

  async startConsultation(queueId: string): Promise<any> {
    const entry = await queueEntryModel.findById(queueId);
    if (!entry) throw new Error('Entrée en file introuvable.');

    const now = new Date().toISOString();
    const updated = await queueEntryModel.update(queueId, {
      status: 'IN_CONSULTATION',
      start_time: now,
    });

    if (entry.appointment_id) {
      await appointmentModel.update(entry.appointment_id, {
        status: 'IN_CONSULTATION',
      });
    }

    if (!updated) throw new Error('Échec du changement de statut.');

    return this.formatQueueDTO(updated);
  }

  async completeQueueEntry(queueId: string): Promise<any> {
    const entry = await queueEntryModel.findById(queueId);
    if (!entry) throw new Error('Entrée en file introuvable.');

    const now = new Date().toISOString();
    const updated = await queueEntryModel.update(queueId, {
      status: 'COMPLETED',
      end_time: now,
    });

    if (entry.appointment_id) {
      await appointmentModel.update(entry.appointment_id, {
        status: 'COMPLETED',
      });
    }

    if (!updated) throw new Error('Échec du changement de statut.');

    return this.formatQueueDTO(updated);
  }

  async getTodayQueue(doctorId?: string): Promise<QueueEntryDTO[]> {
    let entries = await queueEntryModel.findTodayEntries();
    if (doctorId) {
      entries = entries.filter((e) => e.doctor_id === doctorId);
    }
    entries.sort((a, b) => a.position - b.position);
    return Promise.all(entries.map((e) => this.formatQueueDTO(e)));
  }
}

export const queueService = new QueueService();
