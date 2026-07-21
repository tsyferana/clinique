import { AppointmentEntity, AppointmentDTO } from '../types/index.js';
import { patientModel } from '../../backend/src/models/patient.model.js';
import { doctorModel } from '../../backend/src/models/doctor.model.js';
import { serviceModel } from '../../backend/src/models/service.model.js';

export const appointmentView = {
  async render(apt: AppointmentEntity): Promise<AppointmentDTO> {
    const patient = await patientModel.findById(apt.patient_id);
    const doctor = apt.doctor_id ? await doctorModel.findById(apt.doctor_id) : undefined;
    const service = await serviceModel.findById(apt.service_id);

    return {
      id: apt.id,
      patientId: apt.patient_id,
      patientName: patient ? `${patient.first_name} ${patient.last_name.toUpperCase()}` : 'Patient Inconnu',
      patientPhone: patient ? patient.phone : '',
      doctorId: apt.doctor_id,
      doctorName: doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Non assigné',
      serviceId: apt.service_id,
      serviceName: service ? service.name : 'Service Général',
      appointmentDate: apt.appointment_date,
      appointmentTime: apt.appointment_time,
      status: apt.status,
      reason: apt.reason,
      description: apt.description,
      ticketNumber: apt.ticket_number,
      ticketCode: apt.ticket_code,
      rejectionReason: apt.rejection_reason,
      rescheduledDate: apt.rescheduled_date,
      rescheduledTime: apt.rescheduled_time,
      isWalkIn: apt.is_walk_in,
      createdAt: apt.created_at,
    } as unknown as AppointmentDTO;
  },

  async renderMany(apts: AppointmentEntity[]): Promise<AppointmentDTO[]> {
    return Promise.all(apts.map((a) => this.render(a)));
  },
};
