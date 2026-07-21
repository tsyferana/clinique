import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import {
  DoctorDTO,
  DoctorCalendarDayDTO,
  AppointmentDTO,
  DoctorUnavailabilityDTO,
  ServiceDTO,
  PatientDTO,
} from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { WorkingHoursModal } from '../../components/calendar/WorkingHoursModal.js';
import { UnavailabilityModal } from '../../components/calendar/UnavailabilityModal.js';
import { ConflictModal } from '../../components/calendar/ConflictModal.js';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  User,
  Plus,
  Lock,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Move,
  Stethoscope,
  Building,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.js';

type CalendarViewMode = 'DAY' | 'WEEK' | 'MONTH';

export const DoctorCalendarPage: React.FC = () => {
  const { user, doctorProfile } = useAuth();
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('DAY');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Calendar Day Data
  const [calendarDay, setCalendarDay] = useState<DoctorCalendarDayDTO | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(false);

  // Modals
  const [isWorkingHoursOpen, setIsWorkingHoursOpen] = useState(false);
  const [isUnavailOpen, setIsUnavailOpen] = useState(false);
  const [isNewAptOpen, setIsNewAptOpen] = useState(false);

  // Conflict Modal State
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictReason, setConflictReason] = useState('');
  const [alternativeSlots, setAlternativeSlots] = useState<Array<{ date: string; time: string; doctorName?: string }>>([]);
  const [conflictPendingAptId, setConflictPendingAptId] = useState<string | null>(null);

  // Drag and Drop
  const [draggedAptId, setDraggedAptId] = useState<string | null>(null);

  // New Appointment Form State
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [newPatientId, setNewPatientId] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newReason, setNewReason] = useState('Consultation générale');
  const [submittingApt, setSubmittingApt] = useState(false);

  // Toast / Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchPatientsAndServices();
  }, [doctorProfile]);

  useEffect(() => {
    if (user?.role === 'DOCTOR' && doctorProfile?.id) {
      setSelectedDoctorId(doctorProfile.id);
    }
  }, [user, doctorProfile]);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchCalendar();
    }
  }, [selectedDoctorId, selectedDate, viewMode]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get<DoctorDTO[]>('/users/doctors');
      const docs = Array.isArray(res.data) ? res.data : [];
      setDoctors(docs);
      if (docs.length > 0 && !selectedDoctorId) {
        if (doctorProfile?.id && docs.some((d) => d.id === doctorProfile.id)) {
          setSelectedDoctorId(doctorProfile.id);
        } else {
          setSelectedDoctorId(docs[0].id);
        }
      }
    } catch (err) {
      console.error('Erreur chargement médecins:', err);
    }
  };

  const fetchPatientsAndServices = async () => {
    try {
      const [resP, resS] = await Promise.all([
        api.get<PatientDTO[]>('/patients'),
        api.get<ServiceDTO[]>('/users/services'),
      ]);
      setPatients(Array.isArray(resP.data) ? resP.data : []);
      setServices(Array.isArray(resS.data) ? resS.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCalendar = async () => {
    if (!selectedDoctorId) return;
    setLoadingCalendar(true);
    try {
      const res = await api.get<DoctorCalendarDayDTO>(
        `/schedule/doctors/${selectedDoctorId}/calendar/day?date=${selectedDate}`
      );
      setCalendarDay(res.data);
    } catch (err) {
      console.error('Erreur chargement calendrier:', err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Navigation handlers
  const handlePrevDate = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'DAY') d.setDate(d.getDate() - 1);
    else if (viewMode === 'WEEK') d.setDate(d.getDate() - 7);
    else if (viewMode === 'MONTH') d.setMonth(d.getMonth() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'DAY') d.setDate(d.getDate() + 1);
    else if (viewMode === 'WEEK') d.setDate(d.getDate() + 7);
    else if (viewMode === 'MONTH') d.setMonth(d.getMonth() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, aptId: string) => {
    e.dataTransfer.setData('text/plain', aptId);
    setDraggedAptId(aptId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropSlot = async (targetDate: string, targetTime: string) => {
    if (!draggedAptId) return;
    const aptId = draggedAptId;
    setDraggedAptId(null);

    try {
      await api.put(`/appointments/${aptId}/reschedule`, {
        newDate: targetDate,
        newTime: targetTime,
      });
      showToast(`Rendez-vous déplacé au ${targetDate} à ${targetTime} avec succès.`);
      fetchCalendar();
    } catch (err: any) {
      const conflictMsg = err.conflictReason || err.message || 'Conflit de réservation lors du déplacement.';
      setConflictReason(conflictMsg);
      setAlternativeSlots(err.alternativeSlots || []);
      setConflictPendingAptId(aptId);
      setConflictModalOpen(true);
    }
  };

  const handleSelectAlternativeSlot = async (altDate: string, altTime: string) => {
    if (!conflictPendingAptId) {
      // If creating new appointment
      setNewTime(altTime);
      setSelectedDate(altDate);
      setConflictModalOpen(false);
      return;
    }

    try {
      await api.put(`/appointments/${conflictPendingAptId}/reschedule`, {
        newDate: altDate,
        newTime: altTime,
      });
      showToast(`Rendez-vous déplacé au créneau alternatif (${altDate} à ${altTime}).`);
      setConflictModalOpen(false);
      setConflictPendingAptId(null);
      fetchCalendar();
    } catch (err: any) {
      showToast(err.message || 'Échec de la reprogrammation.', 'error');
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientId || !newServiceId || !selectedDoctorId) {
      showToast('Veuillez sélectionner un patient et un service.', 'error');
      return;
    }

    setSubmittingApt(true);
    try {
      await api.post('/appointments', {
        patientId: newPatientId,
        serviceId: newServiceId,
        doctorId: selectedDoctorId,
        date: selectedDate,
        time: newTime,
        reason: newReason,
      });
      showToast('Rendez-vous créé et validé.');
      setIsNewAptOpen(false);
      fetchCalendar();
    } catch (err: any) {
      const conflictMsg = err.conflictReason || err.message || 'Conflit lors de la création du rendez-vous.';
      setConflictReason(conflictMsg);
      setAlternativeSlots(err.alternativeSlots || []);
      setConflictPendingAptId(null);
      setConflictModalOpen(true);
    } finally {
      setSubmittingApt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Doctor Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {user?.role === 'DOCTOR' ? 'Mon Agenda & Calendrier Médical' : 'Calendrier & Agenda Médical'}
            </h2>
            <p className="text-xs text-slate-500">
              {user?.role === 'DOCTOR'
                ? 'Gérez votre emploi du temps, vos créneaux de consultation et définissez vos périodes de blocage.'
                : 'Visualisez et gérez l emploi du temps, disponibilités et créneaux des médecins.'}
            </p>
          </div>
        </div>

        {/* Doctor Selection Dropdown or Fixed Badge for Doctor */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          {user?.role === 'DOCTOR' ? (
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xs">
              <User className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Planning du Dr. {selectedDoctor?.firstName || user.firstName} {selectedDoctor?.lastName || user.lastName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full md:w-auto">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Médecin :</span>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="bg-transparent font-bold text-xs text-slate-900 focus:outline-hidden cursor-pointer w-full"
                id="select-doctor-dropdown"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.firstName} {doc.lastName} — {doc.specialty || 'Généraliste'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedDoctor && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWorkingHoursOpen(true)}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Définir les horaires de travail du médecin"
                id="btn-working-hours"
              >
                <Settings className="w-3.5 h-3.5" />
                Horaires
              </button>

              <button
                type="button"
                onClick={() => setIsUnavailOpen(true)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Bloquer une période indisponible ou congé"
                id="btn-block-period"
              >
                <Lock className="w-3.5 h-3.5" />
                Bloquer Période
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Doctor Summary Bar */}
      {selectedDoctor && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs">
              {selectedDoctor.firstName.charAt(0)}{selectedDoctor.lastName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {selectedDoctor.specialty || 'Médecin'}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-3 mt-0.5">
                <span><Building className="w-3 h-3 inline mr-1 text-slate-400" /> Cabinet: N° {selectedDoctor.cabinetNumber || '101'}</span>
                <span>• Service: {selectedDoctor.serviceName || 'Général'}</span>
              </p>
            </div>
          </div>

          {selectedDoctor && user?.role !== 'DOCTOR' && (
            <button
              type="button"
              onClick={() => setIsNewAptOpen(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
              id="btn-new-appointment"
            >
              <Plus className="w-4 h-4" />
              Nouveau RDV
            </button>
          )}
        </div>
      )}

      {/* Calendar Toolbar Controls (View Switcher & Date Navigation) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevDate}
            className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer text-slate-700"
            title="Précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Aujourd hui
          </button>

          <button
            type="button"
            onClick={handleNextDate}
            className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer text-slate-700"
            title="Suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="ml-2 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 cursor-pointer"
            />
          </div>
        </div>

        {/* View Switcher (Journalière / Hebdomadaire / Mensuelle) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('DAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'DAY'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="view-mode-day-btn"
          >
            Vue Journalière
          </button>

          <button
            type="button"
            onClick={() => setViewMode('WEEK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'WEEK'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="view-mode-week-btn"
          >
            Vue Hebdomadaire
          </button>

          <button
            type="button"
            onClick={() => setViewMode('MONTH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'MONTH'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="view-mode-month-btn"
          >
            Vue Mensuelle
          </button>
        </div>
      </div>

      {/* Main Calendar Display */}
      {loadingCalendar ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs shadow-2xs">
          Chargement du calendrier interactif...
        </div>
      ) : (
        <>
          {/* VUE JOURNALIÈRE */}
          {viewMode === 'DAY' && calendarDay && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Emploi du temps du {calendarDay.dayName} {calendarDay.date}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {calendarDay.isWorkingDay
                      ? `Heures de travail: ${calendarDay.workingHours?.startTime} - ${calendarDay.workingHours?.endTime}`
                      : 'Journée non travaillée'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Disponible
                  </span>
                  <span className="flex items-center gap-1 text-sky-800 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Réservé
                  </span>
                  <span className="flex items-center gap-1 text-amber-800 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Indisponible / Pause
                  </span>
                </div>
              </div>

              {!calendarDay.isWorkingDay ? (
                <div className="p-12 text-center bg-slate-50/50">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-slate-800">Cabinet Fermé ce Jour</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Le médecin ne consulte pas le {calendarDay.dayName}. Vous pouvez modifier ses horaires si besoin.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {calendarDay.slots.map((slot) => {
                    if (slot.status === 'LUNCH') {
                      return (
                        <div
                          key={slot.time}
                          className="p-3 bg-slate-100/70 border-l-4 border-slate-400 flex items-center justify-between opacity-80"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-xs text-slate-600 w-16">{slot.time}</span>
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              Pause Déjeuner / Repas Médical
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-md">
                            Indisponible (Pause)
                          </span>
                        </div>
                      );
                    }

                    if (slot.status === 'UNAVAILABLE') {
                      const unavail = slot.unavailability;
                      return (
                        <div
                          key={slot.time}
                          className="p-3 bg-amber-50/80 border-l-4 border-amber-500 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-xs text-amber-900 w-16">{slot.time}</span>
                            <div>
                              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-amber-700" />
                                INDISPONIBLE : {unavail?.title || 'Créneau Bloqué'}
                              </span>
                              {unavail?.notes && <p className="text-[11px] text-amber-800 italic mt-0.5">{unavail.notes}</p>}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 border border-amber-300 px-2.5 py-1 rounded-md">
                            Période Bloquée
                          </span>
                        </div>
                      );
                    }

                    if (slot.status === 'BOOKED' && slot.appointment) {
                      const apt = slot.appointment;
                      return (
                        <div
                          key={slot.time}
                          onDragOver={handleDragOver}
                          className="p-3 bg-sky-50/70 border-l-4 border-sky-500 hover:bg-sky-100/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-xs text-sky-900 w-16">{slot.time}</span>

                            {/* Draggable Appointment Card */}
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, apt.id)}
                              className="bg-white p-2.5 rounded-xl border border-sky-200 shadow-2xs cursor-grab active:cursor-grabbing flex items-center gap-3 hover:shadow-xs transition-shadow"
                              title="Glissez-déposez pour déplacer ce rendez-vous"
                            >
                              <Move className="w-4 h-4 text-sky-400 group-hover:text-sky-600 transition-colors shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-slate-900">{apt.patientName}</span>
                                  <StatusBadge status={apt.status} />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Service: <strong className="text-slate-800">{apt.serviceName}</strong> ({apt.serviceDurationMinutes || 30} min)
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {apt.ticketNumber && (
                              <span className="font-mono text-[11px] font-bold text-sky-900 bg-white border border-sky-200 px-2.5 py-1 rounded-lg">
                                N° {apt.ticketNumber}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 italic">Glisser pour déplacer</span>
                          </div>
                        </div>
                      );
                    }

                    // FREE SLOT
                    return (
                      <div
                        key={slot.time}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropSlot(selectedDate, slot.time)}
                        className="p-3 hover:bg-emerald-50/60 border-l-4 border-emerald-400 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-slate-600 w-16">{slot.time}</span>
                          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Créneau Disponible
                          </span>
                        </div>

                        {user?.role !== 'DOCTOR' && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewTime(slot.time);
                              setIsNewAptOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Réserver
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VUE HEBDOMADAIRE */}
          {viewMode === 'WEEK' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Vue Hebdomadaire — Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </h3>
                <span className="text-xs text-slate-500">Semaine du {selectedDate}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((dayName, idx) => {
                  const d = new Date(selectedDate);
                  const currentDay = d.getDay(); // 0-6
                  const distance = (idx + 1) - (currentDay === 0 ? 7 : currentDay);
                  d.setDate(d.getDate() + distance);
                  const dayStr = d.toISOString().split('T')[0];

                  return (
                    <div key={dayName} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{dayName}</span>
                          <span className="text-[10px] text-slate-500">{dayStr}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(dayStr);
                            setViewMode('DAY');
                          }}
                          className="text-[10px] text-teal-700 font-bold hover:underline"
                        >
                          Voir Jour
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((timeStr) => (
                          <div
                            key={timeStr}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDropSlot(dayStr, timeStr)}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-[11px] hover:border-teal-400 transition-colors flex items-center justify-between cursor-pointer"
                            onClick={() => {
                              setSelectedDate(dayStr);
                              if (user?.role !== 'DOCTOR') {
                                setNewTime(timeStr);
                                setIsNewAptOpen(true);
                              } else {
                                setViewMode('DAY');
                              }
                            }}
                          >
                            <span className="font-mono font-bold text-slate-600">{timeStr}</span>
                            <span className="text-[10px] text-emerald-700 font-medium">+ Libre</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VUE MENSUELLE */}
          {viewMode === 'MONTH' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Vue Mensuelle — Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </h3>
                <span className="text-xs text-slate-500">Mois de {selectedDate.substring(0, 7)}</span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 pb-2 border-b border-slate-100">
                <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  const [y, m] = selectedDate.split('-');
                  const dateStr = `${y}-${m}-${dayNum.toString().padStart(2, '0')}`;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={dayNum}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setViewMode('DAY');
                      }}
                      className={`h-20 p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer hover:border-teal-500 ${
                        isToday ? 'bg-teal-50/80 border-teal-300 font-bold' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">{dayNum}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block self-start">
                        Consulter
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* WORKING HOURS MODAL */}
      {selectedDoctor && (
        <WorkingHoursModal
          doctor={selectedDoctor}
          isOpen={isWorkingHoursOpen}
          onClose={() => setIsWorkingHoursOpen(false)}
          onSuccess={() => {
            showToast('Horaires de travail mis à jour.');
            fetchCalendar();
          }}
        />
      )}

      {/* UNAVAILABILITY MODAL */}
      {selectedDoctor && (
        <UnavailabilityModal
          doctor={selectedDoctor}
          isOpen={isUnavailOpen}
          defaultDate={selectedDate}
          onClose={() => setIsUnavailOpen(false)}
          onSuccess={() => {
            showToast('Période bloquée enregistrée.');
            fetchCalendar();
          }}
        />
      )}

      {/* CONFLICT RESCUER MODAL */}
      <ConflictModal
        isOpen={conflictModalOpen}
        conflictReason={conflictReason}
        alternativeSlots={alternativeSlots}
        onClose={() => setConflictModalOpen(false)}
        onSelectAlternative={handleSelectAlternativeSlot}
      />

      {/* NEW APPOINTMENT MODAL */}
      {isNewAptOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsNewAptOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">Nouveau Rendez-vous</h3>
                <p className="text-xs text-slate-500">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName} — {selectedDate} à {newTime}</p>
              </div>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient</label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
                  required
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.cin || p.patientCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Médical</label>
                <select
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
                  required
                >
                  <option value="">-- Sélectionner un service --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} min - {s.price} Ar)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heure</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motif du Rendez-vous</label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewAptOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingApt}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {submittingApt ? 'Création...' : 'Valider le RDV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
