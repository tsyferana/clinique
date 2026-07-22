import { AppointmentEntity, TicketDTO } from '../types/index.js';
import { patientModel } from '../../backend/src/models/patient.model.js';
import { doctorModel } from '../../backend/src/models/doctor.model.js';
import { serviceModel } from '../../backend/src/models/service.model.js';

export const ticketView = {
  async render(apt: AppointmentEntity): Promise<TicketDTO> {
    const patient = await patientModel.findById(apt.patient_id);
    const doctor = apt.doctor_id ? await doctorModel.findById(apt.doctor_id) : undefined;
    const service = await serviceModel.findById(apt.service_id);

    return {
      id: apt.id,
      appointmentId: apt.id,
      ticketNumber: apt.ticket_number || `RDV-${apt.id.substring(4, 9).toUpperCase()}`,
      ticketCode: apt.ticket_code || 'TK-0000',
      patientName: patient ? `${patient.first_name} ${patient.last_name.toUpperCase()}` : 'Patient Inconnu',
      patientPhone: patient ? patient.phone : '',
      doctorName: doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Cabinet de garde',
      serviceName: service ? service.name : 'Médecine Générale',
      cabinetNumber: doctor ? doctor.cabinet_number : 'Accueil Central',
      appointmentDate: apt.appointment_date,
      appointmentTime: apt.appointment_time,
      status: apt.status,
      clinicName: 'CLINIQUE MAHERY',
      clinicAddress: '15 Boulevard de la Santé, 75013 Paris',
      clinicPhone: '01 40 50 60 70',
    } as unknown as TicketDTO;
  },
};
