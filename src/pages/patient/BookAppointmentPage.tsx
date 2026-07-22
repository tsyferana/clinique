import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ServiceDTO, DoctorDTO, DoctorCalendarDayDTO } from '../../types/index.js';
import { ConflictModal } from '../../components/calendar/ConflictModal.js';
import {
  CalendarPlus,
  Stethoscope,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lock,
  Sparkles,
} from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar Day Real-Time Slots
  const [calendarDay, setCalendarDay] = useState<DoctorCalendarDayDTO | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Conflict Modal State
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictReason, setConflictReason] = useState('');
  const [alternativeSlots, setAlternativeSlots] = useState<Array<{ date: string; time: string; doctorName?: string }>>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    serviceId: '',
    doctorId: '',
    date: todayStr,
    time: '09:00',
    reason: '',
    description: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [srvRes, docRes] = await Promise.all([
        api.get<ServiceDTO[]>('/users/services'),
        api.get<DoctorDTO[]>('/users/doctors'),
      ]);
      const srvList = Array.isArray(srvRes.data) ? srvRes.data : [];
      const docList = Array.isArray(docRes.data) ? docRes.data : [];
      setServices(srvList);
      setDoctors(docList);
      if (srvList.length > 0) {
        const firstSrvId = srvList[0].id;
        const srvDocs = docList.filter((d) => d.serviceId === firstSrvId);
        const defaultDocId = srvDocs.length > 0 ? srvDocs[0].id : docList[0]?.id || '';
        setFormData((prev) => ({
          ...prev,
          serviceId: firstSrvId,
          doctorId: defaultDocId,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = formData.serviceId
    ? doctors.filter((d) => d.serviceId === formData.serviceId)
    : doctors;

  const targetDoctorId = formData.doctorId || (filteredDoctors[0]?.id ?? '');

  // Fetch real-time available time slots whenever doctor or date changes
  useEffect(() => {
    if (targetDoctorId && formData.date) {
      fetchAvailableSlots(targetDoctorId, formData.date);
    } else {
      setCalendarDay(null);
    }
  }, [targetDoctorId, formData.date]);

  const fetchAvailableSlots = async (docId: string, dateStr: string) => {
    setLoadingSlots(true);
    try {
      const res = await api.get<DoctorCalendarDayDTO>(
        `/schedule/doctors/${docId}/calendar/day?date=${dateStr}`
      );
      setCalendarDay(res.data);

      // Auto-select first FREE slot if current time is taken or invalid
      if (res.data?.slots) {
        const freeSlots = res.data.slots.filter((s) => s.status === 'FREE');
        if (freeSlots.length > 0) {
          const isCurrentTimeFree = freeSlots.some((s) => s.time === formData.time);
          if (!isCurrentTimeFree) {
            setFormData((prev) => ({ ...prev, time: freeSlots[0].time }));
          }
        }
      }
    } catch (err) {
      console.error('Erreur chargement des créneaux:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectAlternativeSlot = (altDate: string, altTime: string) => {
    setFormData((prev) => ({
      ...prev,
      date: altDate,
      time: altTime,
    }));
    setConflictModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId) {
      setError('Veuillez sélectionner un service médical.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/appointments', {
        ...formData,
        doctorId: formData.doctorId || targetDoctorId,
      });
      navigate('/patient/appointments?booked=true');
    } catch (err: any) {
      const conflictMsg = err.conflictReason || err.message || 'Échec de la réservation.';
      if (err.conflictReason || err.alternativeSlots) {
        setConflictReason(conflictMsg);
        setAlternativeSlots(err.alternativeSlots || []);
        setConflictModalOpen(true);
      } else {
        setError(conflictMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Chargement des services médicaux...</div>;
  }

  const activeDoctor = doctors.find((d) => d.id === targetDoctorId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Conflict Modal */}
      <ConflictModal
        isOpen={conflictModalOpen}
        conflictReason={conflictReason}
        alternativeSlots={alternativeSlots}
        onClose={() => setConflictModalOpen(false)}
        onSelectAlternative={handleSelectAlternativeSlot}
      />

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Demander un rendez-vous en ligne</h2>
            <p className="text-xs text-slate-500">
              Sélectionnez votre médecin et choisissez un créneau horaire disponible en temps réel.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* 1. Service Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Sélectionnez le Service Médical *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => {
                    const matchingDocs = doctors.filter((d) => d.serviceId === srv.id);
                    const docId = matchingDocs.length > 0 ? matchingDocs[0].id : '';
                    setFormData({ ...formData, serviceId: srv.id, doctorId: docId });
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.serviceId === srv.id
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/30 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm">{srv.name}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                  <div className="mt-3 flex justify-between items-center text-xs text-teal-700 font-semibold">
                    <span>{srv.durationMinutes} min</span>
                    <span>Tarif: {srv.price} MGA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              2. Choix du Médecin *
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer font-medium"
              id="select-doctor-dropdown"
            >
              {filteredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.firstName} {doc.lastName} ({doc.specialty || 'Généraliste'} — Cabinet {doc.cabinetNumber || '101'})
                </option>
              ))}
            </select>
            {activeDoctor && (
              <p className="text-xs text-teal-700 font-medium mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Planning connecté pour Dr. {activeDoctor.firstName} {activeDoctor.lastName} (Service: {activeDoctor.serviceName})
              </p>
            )}
          </div>

          {/* 3. Date Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              3. Date souhaitée *
            </label>
            <input
              type="date"
              min={todayStr}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer font-bold text-slate-800"
              id="select-date-input"
            />
          </div>

          {/* 4. REAL-TIME AVAILABLE SLOTS DISPLAY */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                4. Horaires et Créneaux Disponibles du Docteur *
              </label>
              {calendarDay?.isWorkingDay && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Médecin en consultation ce jour
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="p-6 text-center text-slate-500 text-xs font-medium">
                Vérification des disponibilités en temps réel...
              </div>
            ) : !calendarDay ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Sélectionnez un médecin et une date pour voir les horaires disponibles.
              </div>
            ) : !calendarDay.isWorkingDay ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Le médecin ne consulte pas le {calendarDay.dayName} ({calendarDay.date}). Veuillez sélectionner un autre jour de la semaine.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Cliquez sur un créneau <strong className="text-emerald-700">libre (vert)</strong> pour réserver l heure de votre consultation :
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {calendarDay.slots.map((slot) => {
                    const isSelected = formData.time === slot.time;

                    if (slot.status === 'FREE') {
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, time: slot.time }))}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-700 ring-2 ring-teal-500/40 shadow-sm scale-105'
                              : 'bg-white hover:bg-emerald-50 text-emerald-950 border-emerald-300 hover:border-emerald-500 shadow-2xs'
                          }`}
                        >
                          <span className="text-xs font-mono">{slot.time}</span>
                          <span className={`text-[9px] font-semibold ${isSelected ? 'text-teal-100' : 'text-emerald-700'}`}>
                            {isSelected ? '✓ Sélectionné' : 'Disponible'}
                          </span>
                        </button>
                      );
                    }

                    if (slot.status === 'BOOKED') {
                      return (
                        <div
                          key={slot.time}
                          className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-0.5 opacity-60 cursor-not-allowed"
                          title="Ce créneau est déjà réservé par un autre patient."
                        >
                          <span className="font-mono text-slate-500">{slot.time}</span>
                          <span className="text-[9px] text-rose-600 font-medium">Déjà pris</span>
                        </div>
                      );
                    }

                    if (slot.status === 'LUNCH') {
                      return (
                        <div
                          key={slot.time}
                          className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold flex flex-col items-center justify-center gap-0.5 opacity-70 cursor-not-allowed"
                          title="Pause repas du médecin."
                        >
                          <span className="font-mono">{slot.time}</span>
                          <span className="text-[9px] text-amber-800 font-medium">Pause repas</span>
                        </div>
                      );
                    }

                    // UNAVAILABLE
                    return (
                      <div
                        key={slot.time}
                        className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-0.5 opacity-60 cursor-not-allowed"
                        title={slot.unavailability?.title || 'Créneau bloqué par le médecin.'}
                      >
                        <span className="font-mono">{slot.time}</span>
                        <span className="text-[9px] text-slate-500 font-medium">Indisponible</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 font-semibold text-emerald-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Vert = Créneau Libre
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Gris = Créneau Réservé
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Jaune = Pause / Déjeuner
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Reason & Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              5. Motif principal de consultation *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              placeholder="Ex : Bilan annuel, Douleurs abdominales, Renouvellement traitement..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              id="reason-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              6. Précisions complémentaires (facultatif)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Symptômes particuliers, antécédents utiles, requêtes spécifiques..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              id="description-input"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting || (calendarDay ? !calendarDay.isWorkingDay : false)}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
              id="submit-book-appointment-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Envoi de la demande...' : `Réserver pour le ${formData.date} à ${formData.time}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
