import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { DoctorDTO, UnavailabilityType } from '../../types/index.js';
import { Lock, X, AlertCircle, ShieldAlert, Calendar, Clock, FileText } from 'lucide-react';

interface UnavailabilityModalProps {
  doctor: DoctorDTO;
  isOpen: boolean;
  defaultDate?: string;
  defaultTime?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const UnavailabilityModal: React.FC<UnavailabilityModalProps> = ({
  doctor,
  isOpen,
  defaultDate,
  defaultTime,
  onClose,
  onSuccess,
}) => {
  const today = defaultDate || new Date().toISOString().split('T')[0];

  const [type, setType] = useState<UnavailabilityType>('BLOCKED');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState(defaultTime || '10:30');
  const [endTime, setEndTime] = useState('11:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Veuillez indiquer le motif ou le titre de l indisponibilité.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await api.post('/schedule/unavailabilities', {
        doctorId: doctor.id,
        type,
        title,
        startDate,
        endDate,
        startTime: isAllDay ? undefined : startTime,
        endTime: isAllDay ? undefined : endTime,
        isAllDay,
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de la création de la période indisponible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 leading-tight">
              Bloquer une période / Congé
            </h3>
            <p className="text-xs text-slate-500">Dr. {doctor.firstName} {doctor.lastName}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Type d indisponibilité</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('BLOCKED');
                  if (!title) setTitle('Réunion de service / Créneau bloqué');
                }}
                className={`p-2 rounded-xl border text-xs font-bold text-center transition-colors ${
                  type === 'BLOCKED'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Période Bloquée
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('LEAVE');
                  if (!title) setTitle('Congé Annuel');
                }}
                className={`p-2 rounded-xl border text-xs font-bold text-center transition-colors ${
                  type === 'LEAVE'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Congé
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('ABSENCE');
                  if (!title) setTitle('Absence / Formation');
                }}
                className={`p-2 rounded-xl border text-xs font-bold text-center transition-colors ${
                  type === 'ABSENCE'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Absence
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé / Motif</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réunion de staff, Visite médicale, Congés..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Date Début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Date Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is-all-day"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="is-all-day" className="text-xs font-bold text-slate-800 cursor-pointer">
              Toute la journée (ou ensemble de journées)
            </label>
          </div>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-700" />
                  Heure Début
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-700" />
                  Heure Fin
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              <FileText className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Notes / Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Commentaires pour la réception..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              id="confirm-block-period-btn"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Blocage...' : 'Bloquer la période'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
