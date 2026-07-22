import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { ConsultationDTO, PrescriptionDTO } from '../../types/index.js';
import { PrescriptionPDFModal } from '../../components/common/PrescriptionPDFModal.js';
import { FileText, Stethoscope, Pill, Calendar, CalendarPlus, Download, Activity } from 'lucide-react';

export const MedicalHistoryPage: React.FC = () => {
  const { patientProfile } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationDTO[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDTO | null>(null);

  useEffect(() => {
    if (patientProfile?.id) {
      fetchMedicalData(patientProfile.id);
    } else {
      setLoading(false);
    }
  }, [patientProfile]);

  const fetchMedicalData = async (patientId: string) => {
    try {
      const [cRes, pRes] = await Promise.all([
        api.get<ConsultationDTO[]>(`/patients/${patientId}/consultations`),
        api.get<PrescriptionDTO[]>(`/patients/${patientId}/prescriptions`),
      ]);
      setConsultations(Array.isArray(cRes.data) ? cRes.data : []);
      setPrescriptions(Array.isArray(pRes.data) ? pRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPrescriptionPDF = async (prescId: string) => {
    try {
      const res = await api.get<PrescriptionDTO>(`/prescriptions/${prescId}`);
      setSelectedPrescription(res.data);
    } catch (err: any) {
      alert(err.message || 'Impossible de charger l ordonnance.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement de votre historique médical...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Historique Médical & Ordonnances</h2>
          <p className="text-xs text-slate-500">
            Retrouvez le compte-rendu de vos consultations passées et vos ordonnances de médicaments.
          </p>
        </div>

        <Link
          to="/patient/book"
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2 self-start"
        >
          <CalendarPlus className="w-4 h-4" /> Reprendre un rendez-vous
        </Link>
      </div>

      {/* Patient Antecedents & Profile Summary */}
      {patientProfile && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Groupe Sanguin</span>
            <span className="text-base font-extrabold text-teal-700">{patientProfile.bloodGroup || 'Non renseigné'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Allergies Connues</span>
            <span className="text-sm font-semibold text-rose-700">{patientProfile.allergies || 'Aucune connue'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Antécédents Médicaux</span>
            <span className="text-xs text-slate-700">{patientProfile.medicalHistory || 'Aucun antécédent noté'}</span>
          </div>
        </div>
      )}

      {/* Past Consultations */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" /> Vos Consultations Médicales ({consultations.length})
        </h3>

        {consultations.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
            Aucune consultation enregistrée à ce jour.
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((cons) => (
              <div key={cons.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Consultation - {cons.doctorName}</h4>
                    <p className="text-xs text-slate-500">{cons.doctorSpecialty || 'Médecine Générale'}</p>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-full flex items-center gap-1.5 self-start">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {cons.date}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <strong className="text-slate-700 block mb-1">Motif & Symptômes :</strong>
                    <p className="text-slate-600">{cons.reason} — {cons.symptoms}</p>
                  </div>

                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                    <strong className="text-teal-900 block mb-1">Diagnostic Médical :</strong>
                    <p className="font-semibold text-teal-950">{cons.diagnosis}</p>
                  </div>
                </div>

                {cons.vitals && (cons.vitals.temperature || cons.vitals.bloodPressure || cons.vitals.weight) && (
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 pt-1">
                    {cons.vitals.temperature && <span>Température: {cons.vitals.temperature} °C</span>}
                    {cons.vitals.bloodPressure && <span>Tension: {cons.vitals.bloodPressure}</span>}
                    {cons.vitals.weight && <span>Poids: {cons.vitals.weight} kg</span>}
                  </div>
                )}

                <div className="pt-2 text-xs text-slate-700">
                  <strong>Traitement & Recommandations :</strong> {cons.treatmentPlan}
                </div>

                {cons.hasPrescription && cons.prescriptionId && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => openPrescriptionPDF(cons.prescriptionId!)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Pill className="w-4 h-4" /> Voir & Imprimer l Ordonnance
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Prescriptions */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Pill className="w-5 h-5 text-teal-600" /> Vos Ordonnances ({prescriptions.length})
        </h3>

        {prescriptions.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
            Aucune ordonnance émise à ce jour.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prescriptions.map((presc) => (
              <div key={presc.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 font-bold text-[10px] uppercase tracking-widest rounded-full">
                      {presc.date}
                    </span>
                    <Pill className="w-4 h-4 text-slate-300" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{presc.doctorName}</h4>
                  <p className="text-xs text-slate-500">{presc.doctorSpecialty || 'Médecin'}</p>
                  
                  <div className="mt-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold block mb-1">Diagnostic:</span>
                    {presc.diagnosis}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => openPrescriptionPDF(presc.id)}
                    className="w-full px-3.5 py-2 bg-slate-900 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Télécharger / Imprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PrescriptionPDFModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </div>
  );
};
