import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { DoctorWorkingHoursDTO, DoctorDTO } from '../../types/index.js';
import { Clock, X, Save, Check, AlertCircle } from 'lucide-react';

interface WorkingHoursModalProps {
  doctor: DoctorDTO;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS_NAME = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({ doctor, isOpen, onClose, onSuccess }) => {
  const [hours, setHours] = useState<
    Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotDurationMinutes: number;
      lunchStart: string;
      lunchEnd: string;
      isActive: boolean;
    }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHours();
    }
  }, [isOpen, doctor.id]);

  const fetchHours = async () => {
    setLoading(true);
    try {
      const res = await api.get<DoctorWorkingHoursDTO[]>(`/schedule/doctors/${doctor.id}/working-hours`);
      const existing = res.data || [];

      // Build default 7 days array (1 = Monday, ..., 6 = Saturday, 0 = Sunday)
      const daysArr = [1, 2, 3, 4, 5, 6, 0].map((d) => {
        const found = existing.find((h) => h.dayOfWeek === d);
        return {
          dayOfWeek: d,
          startTime: found?.startTime || '08:00',
          endTime: found?.endTime || '18:00',
          slotDurationMinutes: found?.slotDurationMinutes || 30,
          lunchStart: found?.lunchStart || '12:00',
          lunchEnd: found?.lunchEnd || '14:00',
          isActive: found ? found.isActive : d >= 1 && d <= 5, // Default active Mon-Fri
        };
      });

      setHours(daysArr);
    } catch (err) {
      console.error('Erreur chargement horaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = (index: number) => {
    const next = [...hours];
    next[index].isActive = !next[index].isActive;
    setHours(next);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const next = [...hours];
    (next[index] as any)[field] = value;
    setHours(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await api.put(`/schedule/doctors/${doctor.id}/working-hours`, hours);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de la sauvegarde des horaires.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 leading-tight">
              Horaires de Consultation — Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-xs text-slate-500">Définissez les créneaux d ouverture et pauses repas par jour de semaine.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Chargement des horaires...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {hours.map((h, idx) => (
                <div
                  key={h.dayOfWeek}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    h.isActive ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-100/50 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-36">
                      <input
                        type="checkbox"
                        checked={h.isActive}
                        onChange={() => handleToggleActive(idx)}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                        id={`wh-check-${h.dayOfWeek}`}
                      />
                      <label htmlFor={`wh-check-${h.dayOfWeek}`} className="font-bold text-xs text-slate-800 cursor-pointer">
                        {DAYS_NAME[h.dayOfWeek]}
                      </label>
                    </div>

                    {h.isActive ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs w-full">
                        <div>
                          <span className="block text-[10px] font-semibold text-slate-500">Début</span>
                          <input
                            type="time"
                            value={h.startTime}
                            onChange={(e) => handleChange(idx, 'startTime', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <span className="block text-[10px] font-semibold text-slate-500">Fin</span>
                          <input
                            type="time"
                            value={h.endTime}
                            onChange={(e) => handleChange(idx, 'endTime', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <span className="block text-[10px] font-semibold text-slate-500">Pause Réunion/Repas</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={h.lunchStart}
                              onChange={(e) => handleChange(idx, 'lunchStart', e.target.value)}
                              className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="time"
                              value={h.lunchEnd}
                              onChange={(e) => handleChange(idx, 'lunchEnd', e.target.value)}
                              className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] font-semibold text-slate-500">Pas de créneau</span>
                          <select
                            value={h.slotDurationMinutes}
                            onChange={(e) => handleChange(idx, 'slotDurationMinutes', parseInt(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <option value={15}>15 min</option>
                            <option value={20}>20 min</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Cabinet fermé ce jour</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                id="save-working-hours-btn"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Enregistrement...' : 'Enregistrer les horaires'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
