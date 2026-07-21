import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { PrescriptionDTO } from '../../types/index.js';
import { PrescriptionPDFModal } from '../../components/common/PrescriptionPDFModal.js';
import { Pill, Printer, Search, Calendar, User } from 'lucide-react';

export const DoctorPrescriptionsPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDTO | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get<PrescriptionDTO[]>('/prescriptions');
      setPrescriptions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement des ordonnances...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Ordonnances Médicales Édités</h2>
        <p className="text-xs text-slate-500">Historique de toutes les ordonnances rédigées par votre cabinet.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {prescriptions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">Aucune ordonnance émise pour le moment.</div>
          ) : (
            prescriptions.map((p) => (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{p.patientName}</h3>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[11px] font-bold rounded-md">
                      {p.items.length} médicament(s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Diagnostic : {p.diagnosis}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Date : {p.date}</p>
                </div>

                <button
                  onClick={() => setSelectedPrescription(p)}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Printer className="w-3.5 h-3.5" /> Voir & Imprimer PDF
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <PrescriptionPDFModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </div>
  );
};
