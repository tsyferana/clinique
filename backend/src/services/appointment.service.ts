import { appointmentModel } from '../models/appointment.model.js';
import { patientModel } from '../models/patient.model.js';
import { notificationModel } from '../models/notification.model.js';
import { serviceModel } from '../models/service.model.js';
import { ticketService } from './ticket.service.js';
import { scheduleService } from './schedule.service.js';
import { appointmentView } from '../../../src/views/appointment.view.js';
import { AppointmentDTO, AppointmentStatus, UserRole } from '../../../src/types/index.js';

export class AppointmentService {
  private validateStatusTransition(current: AppointmentStatus, next: AppointmentStatus): void {
    const invalidTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      REJECTED: ['CONFIRMED', 'ARRIVED', 'IN_QUEUE', 'IN_CONSULTATION', 'COMPLETED'],
      COMPLETED: ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'ARRIVED', 'IN_QUEUE'],
      CANCELLED: ['CONFIRMED', 'IN_CONSULTATION', 'COMPLETED', 'ARRIVED'],
      NO_SHOW: ['IN_CONSULTATION', 'COMPLETED'],
      PENDING: ['IN_CONSULTATION', 'COMPLETED'],
      CONFIRMED: [],
      RESCHEDULED: [],
      ARRIVED: [],
      IN_QUEUE: [],
      IN_CONSULTATION: [],
    };

    if (invalidTransitions[current]?.includes(next)) {
      throw new Error(`Transition de statut invalide de ${current} vers ${next}.`);
    }
  }

  async createAppointmentRequest(data: {
    userId?: string;
    patientId?: string;
    serviceId: string;
    doctorId?: string;
    date: string;
    time: string;
    reason: string;
    description?: string;
  }): Promise<AppointmentDTO> {
    let patientId = data.patientId;
    if (!patientId && data.userId) {
      const p = await patientModel.findByUserId(data.userId);
      if (!p) throw new Error('Profil patient non trouvé.');
      patientId = p.id;
    }

    if (!patientId) {
      throw new Error('Un patient doit être spécifié pour créer un rendez-vous.');
    }

    if (data.doctorId) {
      const srv = await serviceModel.findById(data.serviceId);
      const duration = srv?.duration_minutes || 30;
      const avail = await scheduleService.checkAvailability(data.doctorId, data.date, data.time, duration);
      if (!avail.isAvailable) {
        const err: any = new Error(`Conflit de réservation : ${avail.conflictReason}`);
        err.name = 'ScheduleConflictError';
        err.conflictReason = avail.conflictReason;
        err.alternativeSlots = avail.alternativeSlots || [];
        throw err;
      }
    }

    const apt = await appointmentModel.create({
      patient_id: patientId,
      doctor_id: data.doctorId,
      service_id: data.serviceId,
      appointment_date: data.date,
      appointment_time: data.time,
      status: 'PENDING',
      reason: data.reason,
      description: data.description,
      is_walk_in: false,
    });

    const patient = await patientModel.findById(patientId);
    if (patient?.user_id) {
      await notificationModel.create({
        user_id: patient.user_id,
        title: 'Demande de rendez-vous envoyée',
        message: `Votre demande de RDV pour le ${data.date} à ${data.time} est en cours de traitement par la réception.`,
        is_read: false,
        type: 'APPOINTMENT',
      });
    }

    return appointmentView.render(apt);
  }

  async approveAppointment(id: string, doctorId?: string): Promise<AppointmentDTO> {
    const apt = await appointmentModel.findById(id);
    if (!apt) throw new Error('Rendez-vous non trouvé.');

    this.validateStatusTransition(apt.status, 'CONFIRMED');

    const targetDocId = doctorId || apt.doctor_id;
    if (targetDocId) {
      const srv = await serviceModel.findById(apt.service_id);
      const duration = srv?.duration_minutes || 30;
      const avail = await scheduleService.checkAvailability(targetDocId, apt.appointment_date, apt.appointment_time, duration, id);
      if (!avail.isAvailable) {
        const err: any = new Error(`Impossible de confirmer ce RDV : ${avail.conflictReason}`);
        err.name = 'ScheduleConflictError';
        err.conflictReason = avail.conflictReason;
        err.alternativeSlots = avail.alternativeSlots || [];
        throw err;
      }
    }

    const totalCount = (await appointmentModel.findAll()).length + 1;
    const ticketNumber = ticketService.generateTicketNumber(totalCount);
    const ticketCode = ticketService.generateTicketCode();

    const updated = await appointmentModel.update(id, {
      status: 'CONFIRMED',
      doctor_id: doctorId || apt.doctor_id,
      ticket_number: ticketNumber,
      ticket_code: ticketCode,
    });

    if (!updated) throw new Error('Échec de la mise à jour du rendez-vous.');

    const patient = await patientModel.findById(updated.patient_id);
    if (patient?.user_id) {
      await notificationModel.create({
        user_id: patient.user_id,
        title: 'Rendez-vous Confirmé !',
        message: `Votre rendez-vous du ${updated.appointment_date} à ${updated.appointment_time} a été validé. N° Ticket: ${ticketNumber}`,
        is_read: false,
        type: 'APPOINTMENT',
      });
    }

    return appointmentView.render(updated);
  }

  async rejectAppointment(id: string, reason: string): Promise<AppointmentDTO> {
    const apt = await appointmentModel.findById(id);
    if (!apt) throw new Error('Rendez-vous non trouvé.');

    this.validateStatusTransition(apt.status, 'REJECTED');

    const updated = await appointmentModel.update(id, {
      status: 'REJECTED',
      rejection_reason: reason,
    });

    if (!updated) throw new Error('Échec du refus de rendez-vous.');

    const patient = await patientModel.findById(updated.patient_id);
    if (patient?.user_id) {
      await notificationModel.create({
        user_id: patient.user_id,
        title: 'Demande de rendez-vous refusée',
        message: `Votre demande du ${updated.appointment_date} a été refusée. Motif : ${reason}`,
        is_read: false,
        type: 'APPOINTMENT',
      });
    }

    return appointmentView.render(updated);
  }

  async rescheduleAppointment(id: string, newDate: string, newTime: string): Promise<AppointmentDTO> {
    const apt = await appointmentModel.findById(id);
    if (!apt) throw new Error('Rendez-vous non trouvé.');

    this.validateStatusTransition(apt.status, 'RESCHEDULED');

    if (apt.doctor_id) {
      const srv = await serviceModel.findById(apt.service_id);
      const duration = srv?.duration_minutes || 30;
      const avail = await scheduleService.checkAvailability(apt.doctor_id, newDate, newTime, duration, id);
      if (!avail.isAvailable) {
        const err: any = new Error(`Impossible de déplacer le RDV au ${newDate} à ${newTime} : ${avail.conflictReason}`);
        err.name = 'ScheduleConflictError';
        err.conflictReason = avail.conflictReason;
        err.alternativeSlots = avail.alternativeSlots || [];
        throw err;
      }
    }

    const updated = await appointmentModel.update(id, {
      status: 'RESCHEDULED',
      rescheduled_date: newDate,
      rescheduled_time: newTime,
      appointment_date: newDate,
      appointment_time: newTime,
    });

    if (!updated) throw new Error('Échec de la reprogrammation.');

    const patient = await patientModel.findById(updated.patient_id);
    if (patient?.user_id) {
      await notificationModel.create({
        user_id: patient.user_id,
        title: 'Rendez-vous Reprogrammé',
        message: `Votre rendez-vous a été reprogrammé au ${newDate} à ${newTime}.`,
        is_read: false,
        type: 'APPOINTMENT',
      });
    }

    return appointmentView.render(updated);
  }

  async markPatientArrived(id: string): Promise<AppointmentDTO> {
    const apt = await appointmentModel.findById(id);
    if (!apt) throw new Error('Rendez-vous non trouvé.');

    this.validateStatusTransition(apt.status, 'ARRIVED');

    const updated = await appointmentModel.update(id, {
      status: 'ARRIVED',
    });

    if (!updated) throw new Error('Mise à jour impossible.');

    return appointmentView.render(updated);
  }

  async cancelAppointment(id: string, userId: string, role: UserRole): Promise<AppointmentDTO> {
    const apt = await appointmentModel.findById(id);
    if (!apt) throw new Error('Rendez-vous non trouvé.');

    if (role === 'PATIENT') {
      const patient = await patientModel.findByUserId(userId);
      if (!patient || patient.id !== apt.patient_id) {
        throw new Error('Vous n êtes pas autorisé à annuler ce rendez-vous.');
      }
    }

    this.validateStatusTransition(apt.status, 'CANCELLED');

    const updated = await appointmentModel.update(id, {
      status: 'CANCELLED',
    });

    if (!updated) throw new Error('Échec de l annulation.');

    return appointmentView.render(updated);
  }

  async getPatientAppointments(userId: string): Promise<AppointmentDTO[]> {
    const patient = await patientModel.findByUserId(userId);
    if (!patient) return [];
    const list = await appointmentModel.findByPatient(patient.id);
    return appointmentView.renderMany(list);
  }

  async getAllAppointments(filters?: { status?: AppointmentStatus; date?: string; doctorId?: string }): Promise<AppointmentDTO[]> {
    let list = await appointmentModel.findAll();
    if (filters) {
      if (filters.status) list = list.filter((a) => a.status === filters.status);
      if (filters.date) list = list.filter((a) => a.appointment_date === filters.date);
      if (filters.doctorId) list = list.filter((a) => a.doctor_id === filters.doctorId);
    }
    return appointmentView.renderMany(list);
  }

  async getAppointmentById(id: string): Promise<AppointmentDTO> {
    const apt = await appointmentModel.findById(id);
    if (!apt) throw new Error('Rendez-vous introuvable.');
    return appointmentView.render(apt);
  }
}

export const appointmentService = new AppointmentService();
