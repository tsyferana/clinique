export type UserRole = 'PATIENT' | 'STAFF' | 'DOCTOR' | 'ADMIN';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'ARRIVED'
  | 'IN_QUEUE'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type QueueStatus = 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PatientEntity {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  phone: string;
  email?: string;
  address?: string;
  blood_group?: string;
  allergies?: string;
  medical_history?: string;
  emergency_contact?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DoctorEntity {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  license_number: string;
  cabinet_number: string;
  service_id: string;
  phone: string;
  email: string;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StaffEntity {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  department: string;
  created_at: Date;
  updated_at: Date;
}

export interface MedicalServiceEntity {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  icon?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AppointmentEntity {
  id: string;
  patient_id: string;
  doctor_id?: string;
  service_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm
  status: AppointmentStatus;
  reason: string;
  description?: string;
  ticket_number?: string;
  ticket_code?: string;
  rejection_reason?: string;
  rescheduled_date?: string;
  rescheduled_time?: string;
  is_walk_in: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QueueEntryEntity {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  service_id: string;
  ticket_number: string;
  position: number;
  status: QueueStatus;
  arrival_time: string;
  called_time?: string;
  start_time?: string;
  end_time?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ConsultationEntity {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  reason: string;
  symptoms: string;
  temperature?: number;
  weight?: number;
  blood_pressure?: string;
  diagnosis: string;
  observations?: string;
  treatment_plan: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrescriptionItemEntity {
  id: string;
  prescription_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionEntity {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  diagnosis: string;
  recommendations?: string;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationEntity {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: 'APPOINTMENT' | 'QUEUE' | 'CONSULTATION' | 'SYSTEM';
  created_at: Date;
}

// DTO Response Types (View layer outputs)
export interface UserDTO {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
}

export interface PatientDTO {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  birthDate: string;
  age: number;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContact?: string;
}

export interface DoctorDTO {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialty: string;
  licenseNumber: string;
  cabinetNumber: string;
  serviceId: string;
  serviceName?: string;
  phone: string;
  email: string;
  isAvailable: boolean;
}

export interface ServiceDTO {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface AppointmentDTO {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId?: string;
  doctorName?: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  reason: string;
  description?: string;
  ticketNumber?: string;
  ticketCode?: string;
  rejectionReason?: string;
  rescheduledDate?: string;
  rescheduledTime?: string;
  isWalkIn: boolean;
  createdAt: string;
}

export interface TicketDTO {
  id: string;
  appointmentId?: string;
  ticketNumber: string;
  ticketCode: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  serviceName: string;
  cabinetNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
}

export interface QueueEntryDTO {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  serviceName: string;
  ticketNumber: string;
  position: number;
  status: QueueStatus;
  arrivalTime: string;
  calledTime?: string;
  startTime?: string;
  endTime?: string;
}

export interface ConsultationDTO {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientBirthDate?: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  date: string;
  reason: string;
  symptoms: string;
  vitals?: {
    temperature?: number;
    weight?: number;
    bloodPressure?: string;
  };
  diagnosis: string;
  observations?: string;
  treatmentPlan: string;
  hasPrescription?: boolean;
  prescriptionId?: string;
  createdAt: string;
}

export interface PrescriptionDTO {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  patientBirthDate?: string;
  patientAddress?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorLicense: string;
  date: string;
  diagnosis: string;
  recommendations?: string;
  items: Array<{
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
}

export interface AuthResponseDTO {
  token: string;
  user: UserDTO;
  patientProfile?: PatientDTO;
  doctorProfile?: DoctorDTO;
}

export interface AdminDashboardDTO {
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
  totalServices: number;
  totalConsultations: number;
  usersByRole: {
    ADMIN: number;
    DOCTOR: number;
    STAFF: number;
    PATIENT: number;
  };
  todayAppointmentsCount: number;
  todayConsultationsCount: number;
  monthlyStats: Array<{ date: string; totalRdv: number; confirmed: number; cancelled: number; walkIns: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
  serviceDistribution: Array<{ name: string; count: number }>;
}

export interface StaffDashboardDTO {
  pendingRequestsCount: number;
  todayAppointmentsCount: number;
  arrivedPatientsCount: number;
  inQueueCount: number;
  completedTodayCount: number;
  upcomingAppointments: AppointmentDTO[];
  currentQueue: QueueEntryDTO[];
}

export interface DoctorDashboardDTO {
  doctorId: string;
  doctorName: string;
  specialty: string;
  cabinetNumber: string;
  waitingCount: number;
  completedTodayCount: number;
  todayAppointments: AppointmentDTO[];
  myQueue: QueueEntryDTO[];
  todayPatientsCount?: number;
  waitingQueueCount?: number;
  completedConsultationsCount?: number;
  nextPatient?: QueueEntryDTO;
  todayQueue?: QueueEntryDTO[];
  recentConsultations?: ConsultationDTO[];
}

export type UnavailabilityType = 'BLOCKED' | 'LEAVE' | 'ABSENCE';

export interface DoctorWorkingHoursEntity {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  slot_duration_minutes: number;
  lunch_start?: string; // HH:mm
  lunch_end?: string; // HH:mm
  is_active: boolean;
}

export interface DoctorUnavailabilityEntity {
  id: string;
  doctor_id: string;
  type: UnavailabilityType;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  start_time?: string; // HH:mm
  end_time?: string; // HH:mm
  is_all_day: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DoctorWorkingHoursDTO {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  lunchStart?: string;
  lunchEnd?: string;
  isActive: boolean;
}

export interface DoctorUnavailabilityDTO {
  id: string;
  doctorId: string;
  type: UnavailabilityType;
  title: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  notes?: string;
}

export interface AvailabilityCheckResultDTO {
  isAvailable: boolean;
  conflictReason?: string;
  alternativeSlots?: Array<{
    date: string;
    time: string;
    doctorName?: string;
  }>;
}

export interface DoctorCalendarDayDTO {
  date: string;
  dayName: string;
  isWorkingDay: boolean;
  workingHours?: {
    startTime: string;
    endTime: string;
    lunchStart?: string;
    lunchEnd?: string;
  };
  slots: Array<{
    time: string; // HH:mm
    status: 'FREE' | 'BOOKED' | 'UNAVAILABLE' | 'LUNCH';
    appointment?: AppointmentDTO;
    unavailability?: DoctorUnavailabilityDTO;
  }>;
  unavailabilities: DoctorUnavailabilityDTO[];
}

export interface PatientDashboardDTO {
  upcomingAppointment?: AppointmentDTO;
  latestTicket?: TicketDTO;
  recentConsultationsCount: number;
  recentPrescriptionsCount: number;
  appointments: AppointmentDTO[];
}
