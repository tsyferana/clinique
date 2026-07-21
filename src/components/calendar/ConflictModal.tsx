import React from 'react';
import { ShieldAlert, X, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  conflictReason: string;
  alternativeSlots?: Array<{ date: string; time: string; doctorName?: string }>;
  onClose: () => void;
  onSelectAlternative?: (date: string, time: string) => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  conflictReason,
  alternativeSlots = [],
  onClose,
  onSelectAlternative,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative border-2 border-rose-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-rose-950 leading-tight">
              Alerte : Conflit de Réservation !
            </h3>
            <p className="text-xs font-semibold text-rose-700 mt-0.5">
              Impossible de planifier à cet horaire
            </p>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-xl space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
            Motif du conflit
          </span>
          <p className="text-xs text-rose-950 font-medium leading-relaxed">
            {conflictReason}
          </p>
        </div>

        {alternativeSlots.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Créneaux alternatifs disponibles :
              </span>
              <span className="text-[10px] text-slate-500">Sélectionnez un horaire libre</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {alternativeSlots.map((slot, idx) => (
                <button
                  key={`${slot.date}-${slot.time}-${idx}`}
                  type="button"
                  onClick={() => {
                    if (onSelectAlternative) {
                      onSelectAlternative(slot.date, slot.time);
                    }
                  }}
                  className="p-2.5 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all hover:scale-[1.02] group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {slot.time}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium mt-1">
                    <Calendar className="w-3 h-3 inline mr-1 text-emerald-500" />
                    {slot.date}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Compris / Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
