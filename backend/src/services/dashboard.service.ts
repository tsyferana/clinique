import { userModel } from '../models/user.model.js';
import { patientModel } from '../models/patient.model.js';
import { doctorModel } from '../models/doctor.model.js';
import { staffModel } from '../models/staff.model.js';
import { serviceModel } from '../models/service.model.js';
import { appointmentModel } from '../models/appointment.model.js';
import { queueEntryModel } from '../models/queueEntry.model.js';
import { consultationModel } from '../models/consultation.model.js';
import { prescriptionModel } from '../models/prescription.model.js';
import { appointmentView } from '../../../src/views/appointment.view.js';
import { ticketView } from '../../../src/views/ticket.view.js';
import { queueService } from './queue.service.js';
import { consultationView } from '../../../src/views/consultation.view.js';
import {
  AdminDashboardDTO,
  StaffDashboardDTO,
  DoctorDashboardDTO,
  PatientDashboardDTO,
} from '../../../src/types/index.js';

export class DashboardService {
  async getAdminStats(): Promise<AdminDashboardDTO> {
    const todayStr = new Date().toISOString().split('T')[0];
    const allAppointments = await appointmentModel.findAll();
    const todayAppointments = allAppointments.filter((a) => a.appointment_date === todayStr);
    const todayConsultations = (await consultationModel.findAll()).filter((c) => c.date === todayStr);

    const statusMap: Record<string, number> = {};
    allAppointments.forEach((a) => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    const services = await serviceModel.findAll();
    const serviceDistribution = services.map((s) => ({
      name: s.name,
      count: allAppointments.filter((a) => a.service_id === s.id).length,
    }));

    // Monthly stats mockup/derived
    const monthlyStats = [
      { date: '15/07', totalRdv: 12, confirmed: 10, cancelled: 1, walkIns: 1 },
      { date: '16/07', totalRdv: 15, confirmed: 13, cancelled: 0, walkIns: 2 },
      { date: '17/07', totalRdv: 18, confirmed: 15, cancelled: 2, walkIns: 1 },
      { date: '18/07', totalRdv: 14, confirmed: 12, cancelled: 1, walkIns: 1 },
      { date: '19/07', totalRdv: 20, confirmed: 18, cancelled: 1, walkIns: 1 },
      { date: '20/07', totalRdv: 16, confirmed: 14, cancelled: 1, walkIns: 1 },
      { date: '21/07', totalRdv: allAppointments.length, confirmed: todayAppointments.filter((a) => a.status === 'CONFIRMED').length, cancelled: todayAppointments.filter((a) => a.status === 'CANCELLED').length, walkIns: todayAppointments.filter((a) => a.is_walk_in).length },
    ];

    return {
      totalPatients: await (await patientModel.findAll()).length,
      totalDoctors: await (await doctorModel.findAll()).length,
      totalStaff: await (await staffModel.findAll()).length,
      totalServices: await (await serviceModel.findAll()).length,
      totalConsultations: await (await consultationModel.findAll()).length,
      usersByRole: {
        ADMIN: (await userModel.findByFilters({ role: 'ADMIN' })).length,
        DOCTOR: (await userModel.findByFilters({ role: 'DOCTOR' })).length,
        STAFF: (await userModel.findByFilters({ role: 'STAFF' })).length,
        PATIENT: (await userModel.findByFilters({ role: 'PATIENT' })).length,
      },
      todayAppointmentsCount: todayAppointments.length,
      todayConsultationsCount: todayConsultations.length,
      monthlyStats,
      statusDistribution,
      serviceDistribution,
    };
  }

  async getStaffStats(): Promise<StaffDashboardDTO> {
    const todayStr = new Date().toISOString().split('T')[0];
    const allApts = await appointmentModel.findAll();
    const pendingRequests = allApts.filter((a) => a.status === 'PENDING');
    const todayApts = allApts.filter((a) => a.appointment_date === todayStr);

    const arrived = todayApts.filter((a) => a.status === 'ARRIVED');
    const todayQueue = await queueService.getTodayQueue();
    const activeQueue = todayQueue.filter((q) => q.status !== 'COMPLETED' && q.status !== 'CANCELLED');
    const inQueueCount = activeQueue.filter((q) => q.status === 'WAITING' || (q.status as string) === 'IN_QUEUE').length;
    const completedCount = todayApts.filter((a) => a.status === 'COMPLETED').length;

    return {
      pendingRequestsCount: pendingRequests.length,
      todayAppointmentsCount: todayApts.length,
      arrivedPatientsCount: arrived.length,
      inQueueCount,
      completedTodayCount: completedCount,
      upcomingAppointments: await appointmentView.renderMany(todayApts as any),
      currentQueue: activeQueue,
    };
  }

  async getDoctorStats(userId: string): Promise<DoctorDashboardDTO> {
    const doctor = await doctorModel.findByUserId(userId);
    const doctorId = doctor ? doctor.id : 'doc-1';
    const doctorName = doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Dr. Spécialiste';
    const specialty = doctor?.specialty || 'Médecine Générale';
    const cabinetNumber = doctor?.cabinet_number || '101';

    const todayQueue = await queueService.getTodayQueue(doctorId);
    const waitingQueue = todayQueue.filter((q) => q.status === 'WAITING' || q.status === 'CALLED' || q.status === 'IN_CONSULTATION');
    const activeQueue = todayQueue.filter((q) => q.status !== 'COMPLETED' && q.status !== 'CANCELLED');
    const nextPatient = waitingQueue.length > 0 ? waitingQueue[0] : undefined;

    const todayStr = new Date().toISOString().split('T')[0];
    const allApts = await appointmentModel.findByDoctor(doctorId);
    const todayAppointmentsRaw = allApts.filter((a) => a.appointment_date === todayStr);
    const todayAppointments = await appointmentView.renderMany(todayAppointmentsRaw as any);

    const recentConsultationsRaw = await consultationModel.findByDoctorId(doctorId);
    const recentConsultations = await consultationView.renderMany(recentConsultationsRaw as any);

    const completedToday = recentConsultationsRaw.filter((c) => c.date === todayStr);

    return {
      doctorId,
      doctorName,
      specialty,
      cabinetNumber,
      waitingCount: waitingQueue.length,
      completedTodayCount: completedToday.length,
      todayAppointments,
      myQueue: activeQueue,
      todayPatientsCount: activeQueue.length,
      waitingQueueCount: waitingQueue.length,
      completedConsultationsCount: completedToday.length,
      nextPatient,
      todayQueue,
      recentConsultations,
    };
  }

  async getPatientStats(userId: string): Promise<PatientDashboardDTO> {
    const patient = await patientModel.findByUserId(userId);
    if (!patient) {
      return {
        recentConsultationsCount: 0,
        recentPrescriptionsCount: 0,
        appointments: [],
      };
    }

    const allApts = await appointmentModel.findByPatient(patient.id);
    allApts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const upcoming = allApts.find(
      (a) => (a.status === 'CONFIRMED' || a.status === 'PENDING' || a.status === "SCHEDULED")
    );

    let latestTicket;
    if (upcoming && (upcoming.status === 'CONFIRMED' || upcoming.status === 'IN_QUEUE')) {
      latestTicket = ticketView.render(upcoming);
    }

    const consultations = await consultationModel.findByPatient(patient.id);
    const prescriptions = await prescriptionModel.findByPatientId(patient.id);

    return {
      upcomingAppointment: upcoming ? await appointmentView.render(upcoming as any) : undefined,
      latestTicket,
      recentConsultationsCount: consultations.length,
      recentPrescriptionsCount: prescriptions.length,
      appointments: await appointmentView.renderMany(allApts as any),
    };
  }
}

export const dashboardService = new DashboardService();
