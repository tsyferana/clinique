import { workingHoursModel } from '../models/workingHours.model.js';
import { unavailabilityModel } from '../models/unavailability.model.ts';
import { appointmentModel } from '../models/appointment.model.js';
import { doctorModel } from '../models/doctor.model.js';
import { serviceModel } from '../models/service.model.js';
import { patientModel } from '../models/patient.model.js';
import {
  DoctorWorkingHoursDTO,
  DoctorUnavailabilityDTO,
  AvailabilityCheckResultDTO,
  DoctorCalendarDayDTO,
  UnavailabilityType,
  AppointmentDTO,
} from '../../../src/types/index.js';
import { appointmentView } from '../../../src/views/appointment.view.js';

export class ScheduleService {
  private timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private minutesToTime(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private getDayOfWeek(dateStr: string): number {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getDay();
  }

  private getDayNameFr(dayOfWeek: number): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayOfWeek] || '';
  }

  // --- Working Hours ---
  async getDoctorWorkingHours(doctorId: string): Promise<DoctorWorkingHoursDTO[]> {
    const hours = await workingHoursModel.findByDoctorId(doctorId);
    return hours.map((h) => ({
      id: h.id,
      doctorId: h.doctor_id,
      dayOfWeek: h.day_of_week,
      startTime: h.start_time,
      endTime: h.end_time,
      slotDurationMinutes: h.slot_duration_minutes,
      lunchStart: h.lunch_start,
      lunchEnd: h.lunch_end,
      isActive: h.is_active,
    }));
  }

  async updateDoctorWorkingHours(
    doctorId: string,
    hoursData: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotDurationMinutes: number;
      lunchStart?: string;
      lunchEnd?: string;
      isActive: boolean;
    }>
  ): Promise<DoctorWorkingHoursDTO[]> {
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) throw new Error('Médecin non trouvé.');

    const updated = [];
    for (const h of hoursData) {
      const res = await workingHoursModel.upsertDoctorHours(doctorId, h.dayOfWeek, {
        day_of_week: h.dayOfWeek,
        start_time: h.startTime,
        end_time: h.endTime,
        slot_duration_minutes: h.slotDurationMinutes || 30,
        lunch_start: h.lunchStart,
        lunch_end: h.lunchEnd,
        is_active: h.isActive,
      });
      updated.push(res);
    }

    return updated.map((h) => ({
      id: h.id,
      doctorId: h.doctor_id,
      dayOfWeek: h.day_of_week,
      startTime: h.start_time,
      endTime: h.end_time,
      slotDurationMinutes: h.slot_duration_minutes,
      lunchStart: h.lunch_start,
      lunchEnd: h.lunch_end,
      isActive: h.is_active,
    }));
  }

  // --- Unavailabilities / Absences ---
  async getDoctorUnavailabilities(doctorId: string, startDate?: string, endDate?: string): Promise<DoctorUnavailabilityDTO[]> {
    let list = await unavailabilityModel.findByDoctorId(doctorId);
    if (startDate && endDate) {
      list = list.filter((u) => u.start_date <= endDate && u.end_date >= startDate);
    }
    return list.map((u) => ({
      id: u.id,
      doctorId: u.doctor_id,
      type: u.type,
      title: u.title,
      startDate: u.start_date,
      endDate: u.end_date,
      startTime: u.start_time,
      endTime: u.end_time,
      isAllDay: u.is_all_day,
      notes: u.notes,
    }));
  }

  async createUnavailability(data: {
    doctorId: string;
    type: UnavailabilityType;
    title: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    isAllDay: boolean;
    notes?: string;
  }): Promise<DoctorUnavailabilityDTO> {
    const doctor = await doctorModel.findById(data.doctorId);
    if (!doctor) throw new Error('Médecin non trouvé.');

    const created = await unavailabilityModel.create({
      doctor_id: data.doctorId,
      type: data.type,
      title: data.title,
      start_date: data.startDate,
      end_date: data.endDate,
      start_time: data.startTime,
      end_time: data.endTime,
      is_all_day: data.isAllDay,
      notes: data.notes,
    });

    return {
      id: created.id,
      doctorId: created.doctor_id,
      type: created.type,
      title: created.title,
      startDate: created.start_date,
      endDate: created.end_date,
      startTime: created.start_time,
      endTime: created.end_time,
      isAllDay: created.is_all_day,
      notes: created.notes,
    };
  }

  async deleteUnavailability(id: string): Promise<boolean> {
    const success = await unavailabilityModel.delete(id);
    if (!success) throw new Error('Indisponibilité non trouvée.');
    return true;
  }

  // --- Core Conflict Prevention Logic ---
  async checkAvailability(
    doctorId: string,
    date: string,
    time: string,
    durationMinutes: number = 30,
    excludeAppointmentId?: string
  ): Promise<AvailabilityCheckResultDTO> {
    const doctor = await doctorModel.findById(doctorId);
    const doctorName = doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Médecin';

    const targetStart = this.timeToMinutes(time);
    const targetEnd = targetStart + durationMinutes;

    // 1. Check Working Hours
    const dayOfWeek = this.getDayOfWeek(date);
    const wh = await workingHoursModel.findByDoctorAndDay(doctorId, dayOfWeek);

    if (!wh || !wh.is_active) {
      const alternatives = await this.findAlternativeSlots(doctorId, date, durationMinutes, excludeAppointmentId);
      return {
        isAvailable: false,
        conflictReason: `${doctorName} ne consulte pas le ${this.getDayNameFr(dayOfWeek)}.`,
        alternativeSlots: alternatives,
      };
    }

    const whStart = this.timeToMinutes(wh.start_time);
    const whEnd = this.timeToMinutes(wh.end_time);

    if (targetStart < whStart || targetEnd > whEnd) {
      const alternatives = await this.findAlternativeSlots(doctorId, date, durationMinutes, excludeAppointmentId);
      return {
        isAvailable: false,
        conflictReason: `En dehors des heures de travail (${wh.start_time} - ${wh.end_time}).`,
        alternativeSlots: alternatives,
      };
    }

    if (wh.lunch_start && wh.lunch_end) {
      const lStart = this.timeToMinutes(wh.lunch_start);
      const lEnd = this.timeToMinutes(wh.lunch_end);
      if (targetStart < lEnd && targetEnd > lStart) {
        const alternatives = await this.findAlternativeSlots(doctorId, date, durationMinutes, excludeAppointmentId);
        return {
          isAvailable: false,
          conflictReason: `Pause déjeuner du médecin (${wh.lunch_start} - ${wh.lunch_end}).`,
          alternativeSlots: alternatives,
        };
      }
    }

    // 2. Check Unavailabilities / Leaves / Absences
    const unavailabilities = await unavailabilityModel.findByDoctorAndDateRange(doctorId, date, date);
    for (const u of unavailabilities) {
      if (u.is_all_day) {
        const typeLabel = u.type === 'LEAVE' ? 'Congé' : u.type === 'ABSENCE' ? 'Absence' : 'Indisponible';
        const alternatives = await this.findAlternativeSlots(doctorId, date, durationMinutes, excludeAppointmentId);
        return {
          isAvailable: false,
          conflictReason: `${doctorName} est indisponible (${typeLabel} : ${u.title}).`,
          alternativeSlots: alternatives,
        };
      } else if (u.start_time && u.end_time) {
        const uStart = this.timeToMinutes(u.start_time);
        const uEnd = this.timeToMinutes(u.end_time);
        if (targetStart < uEnd && targetEnd > uStart) {
          const typeLabel = u.type === 'LEAVE' ? 'Congé' : u.type === 'ABSENCE' ? 'Absence' : 'Indisponibilité';
          const alternatives = await this.findAlternativeSlots(doctorId, date, durationMinutes, excludeAppointmentId);
          return {
            isAvailable: false,
            conflictReason: `${typeLabel} planifié (${u.start_time} - ${u.end_time}) : ${u.title}.`,
            alternativeSlots: alternatives,
          };
        }
      }
    }

    // 3. Check Existing Appointments for same doctor on date
    const appointments = await (await appointmentModel.findByDate(date)).filter((a) => {
      if (a.doctor_id !== doctorId) return false;
      if (excludeAppointmentId && a.id === excludeAppointmentId) return false;
      return a.status !== 'CANCELLED' && a.status !== 'REJECTED' && a.status !== 'PENDING';
    });

    const services = await serviceModel.findAll();

    for (const apt of appointments) {
      const aptStart = this.timeToMinutes(apt.appointment_time);
      const srv = services.find((s) => s.id === apt.service_id);
      const aptDuration = srv?.duration_minutes || 30;
      const aptEnd = aptStart + aptDuration;

      if (targetStart < aptEnd && targetEnd > aptStart) {
        const patient = await patientModel.findById(apt.patient_id);
        const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'un patient';
        const alternatives = await this.findAlternativeSlots(doctorId, date, durationMinutes, excludeAppointmentId);
        return {
          isAvailable: false,
          conflictReason: `Créneau déjà réservé par ${patientName} (${apt.appointment_time}).`,
          alternativeSlots: alternatives,
        };
      }
    }

    return {
      isAvailable: true,
    };
  }

  // Helper method to find alternative free slots on the same date or next working day
  async findAlternativeSlots(
    doctorId: string,
    date: string,
    durationMinutes: number = 30,
    excludeAppointmentId?: string
  ): Promise<Array<{ date: string; time: string; doctorName: string }>> {
    const doctor = await doctorModel.findById(doctorId);
    const doctorName = doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Médecin';

    const alternatives: Array<{ date: string; time: string; doctorName: string }> = [];

    // Search on target date and up to 2 next days
    const datesToSearch = [date];
    const [y, m, d] = date.split('-').map(Number);
    const dt1 = new Date(y, m - 1, d + 1);
    const dt2 = new Date(y, m - 1, d + 2);
    datesToSearch.push(dt1.toISOString().split('T')[0]);
    datesToSearch.push(dt2.toISOString().split('T')[0]);

    for (const searchDate of datesToSearch) {
      if (alternatives.length >= 6) break;

      const dayOfWeek = this.getDayOfWeek(searchDate);
      const wh = await workingHoursModel.findByDoctorAndDay(doctorId, dayOfWeek);
      if (!wh || !wh.is_active) continue;

      const whStart = this.timeToMinutes(wh.start_time);
      const whEnd = this.timeToMinutes(wh.end_time);
      const step = wh.slot_duration_minutes || 30;

      for (let m = whStart; m <= whEnd - durationMinutes; m += step) {
        if (alternatives.length >= 6) break;

        const timeCandidate = this.minutesToTime(m);

        // Quick check without recursion
        let isFree = true;

        // Lunch check
        if (wh.lunch_start && wh.lunch_end) {
          const lStart = this.timeToMinutes(wh.lunch_start);
          const lEnd = this.timeToMinutes(wh.lunch_end);
          if (m < lEnd && m + durationMinutes > lStart) {
            isFree = false;
          }
        }

        if (!isFree) continue;

        // Unavailabilities check
        const unavs = await unavailabilityModel.findByDoctorAndDateRange(doctorId, searchDate, searchDate);
        for (const u of unavs) {
          if (u.is_all_day) {
            isFree = false;
            break;
          } else if (u.start_time && u.end_time) {
            const uStart = this.timeToMinutes(u.start_time);
            const uEnd = this.timeToMinutes(u.end_time);
            if (m < uEnd && m + durationMinutes > uStart) {
              isFree = false;
              break;
            }
          }
        }

        if (!isFree) continue;

        // Appointments check
        const apts = (await appointmentModel.findByDate(searchDate)).filter((a) => {
          if (a.doctor_id !== doctorId) return false;
          if (excludeAppointmentId && a.id === excludeAppointmentId) return false;
          return a.status !== 'CANCELLED' && a.status !== 'REJECTED' && a.status !== 'PENDING';
        });

        for (const apt of apts) {
          const aptStart = this.timeToMinutes(apt.appointment_time);
          const aptEnd = aptStart + 30;
          if (m < aptEnd && m + durationMinutes > aptStart) {
            isFree = false;
            break;
          }
        }

        if (isFree) {
          alternatives.push({
            date: searchDate,
            time: timeCandidate,
            doctorName,
          });
        }
      }
    }

    return alternatives;
  }

  // --- Aggregate Calendar View for Day / Week / Month ---
  async getDoctorCalendarDay(doctorId: string, date: string): Promise<DoctorCalendarDayDTO> {
    const dayOfWeek = this.getDayOfWeek(date);
    const dayName = this.getDayNameFr(dayOfWeek);
    const wh = await workingHoursModel.findByDoctorAndDay(doctorId, dayOfWeek);

    const unavailabilities = await this.getDoctorUnavailabilities(doctorId, date, date);
    const rawApts = (await appointmentModel.findByDate(date)).filter((a) => a.doctor_id === doctorId && a.status !== 'CANCELLED' && a.status !== 'REJECTED' && a.status !== 'PENDING');
    const appointments = await appointmentView.renderMany(rawApts);

    const isWorkingDay = Boolean(wh && wh.is_active);
    const startTime = wh?.start_time || '08:00';
    const endTime = wh?.end_time || '18:00';
    const slotDuration = wh?.slot_duration_minutes || 30;

    const startMins = this.timeToMinutes(startTime);
    const endMins = this.timeToMinutes(endTime);

    const slots: DoctorCalendarDayDTO['slots'] = [];

    for (let m = startMins; m < endMins; m += slotDuration) {
      const timeStr = this.minutesToTime(m);
      const slotEndMins = m + slotDuration;

      // Lunch?
      let status: 'FREE' | 'BOOKED' | 'UNAVAILABLE' | 'LUNCH' = 'FREE';
      let matchedApt: AppointmentDTO | undefined;
      let matchedUnavail: DoctorUnavailabilityDTO | undefined;

      if (wh?.lunch_start && wh?.lunch_end) {
        const lStart = this.timeToMinutes(wh.lunch_start);
        const lEnd = this.timeToMinutes(wh.lunch_end);
        if (m < lEnd && slotEndMins > lStart) {
          status = 'LUNCH';
        }
      }

      if (status === 'FREE') {
        // Unavailability?
        const unavail = unavailabilities.find((u) => {
          if (u.isAllDay) return true;
          if (u.startTime && u.endTime) {
            const uStart = this.timeToMinutes(u.startTime);
            const uEnd = this.timeToMinutes(u.endTime);
            return m < uEnd && slotEndMins > uStart;
          }
          return false;
        });

        if (unavail) {
          status = 'UNAVAILABLE';
          matchedUnavail = unavail;
        }
      }

      if (status === 'FREE') {
        // Booked appointment?
        const apt = appointments.find((a) => {
          const aStart = this.timeToMinutes(a.appointmentTime);
          const aEnd = aStart + ((a as any).service_duration_minutes || 30);
          return m < aEnd && slotEndMins > aStart;
        });

        if (apt) {
          status = 'BOOKED';
          matchedApt = apt;
        }
      }

      slots.push({
        time: timeStr,
        status,
        appointment: matchedApt,
        unavailability: matchedUnavail,
      });
    }

    return {
      date,
      dayName,
      isWorkingDay,
      workingHours: wh
        ? {
          startTime: wh.start_time,
          endTime: wh.end_time,
          lunchStart: wh.lunch_start,
          lunchEnd: wh.lunch_end,
        }
        : undefined,
      slots,
      unavailabilities,
    };
  }
}

export const scheduleService = new ScheduleService();
