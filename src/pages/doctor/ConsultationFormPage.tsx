import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { PatientDTO, ConsultationDTO, PrescriptionDTO } from '../../types/index.js';
import { PrescriptionPDFModal } from '../../components/common/PrescriptionPDFModal.js';
import {
  Stethoscope,
  Pill,
  User,
  Activity,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  History,
} from 'lucide-react';

interface PrescriptionInputItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const ConsultationFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queueId = searchParams.get('queueId') || '';
  const patientId = searchParams.get('patientId') || '';
  const appointmentId = searchParams.get('appointmentId') || '';

  const [patient, setPatient] = useState<PatientDTO | null>(null);
  const [pastConsultations, setPastConsultations] = useState<ConsultationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createdPrescription, setCreatedPrescription] = useState<PrescriptionDTO | null>(null);

  // Form states
  const [reason, setReason] = useState('Consultation générale');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [temperature, setTemperature] = useState('37.0');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [weight, setWeight] = useState('70');
  const [pulse, setPulse] = useState('75');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  // Prescription items state
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionInputItem[]>([
    {
      medicationName: 'Paracétamol',
      dosage: '1000 mg',
      frequency: '1 comprimé toutes les 8h',
      duration: '5 jours',
      instructions: 'À prendre au cours des repas',
    },
  ]);
  const [recommendations, setRecommendations] = useState('Repos recommandé pendant 3 jours.');

  const navigate = useNavigate();

  useEffect(() => {
    if (patientId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get<PatientDTO>(`/patients/${patientId}`),
        api.get<ConsultationDTO[]>(`/patients/${patientId}/consultations`),
      ]);
      setPatient(pRes.data);
      setPastConsultations(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PrescriptionInputItem, val: string) => {
    const updated = [...prescriptionItems];
    updated[index][field] = val;
    setPrescriptionItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('Veuillez renseigner le diagnostic médical.');
      return;
    }
    setError(null);
    setSaving(true);

    try {
      // 1. Create Consultation
      const consRes = await api.post<ConsultationDTO>('/consultations', {
        appointmentId: appointmentId || undefined,
        patientId,
        reason,
        symptoms,
        diagnosis,
        temperature: parseFloat(temperature) || undefined,
        bloodPressure,
        weight: parseFloat(weight) || undefined,
        pulse: parseInt(pulse) || undefined,
        treatmentPlan,
      });

      const consultationId = consRes.data.id;

      // 2. Create Prescription if items present
      let prescResData: PrescriptionDTO | null = null;
      if (prescriptionItems.length > 0 && prescriptionItems[0].medicationName.trim()) {
        const prescRes = await api.post<PrescriptionDTO>('/prescriptions', {
          consultationId,
          patientId,
          diagnosis,
          items: prescriptionItems.filter((i) => i.medicationName.trim()),
          recommendations,
        });
        prescResData = prescRes.data;
      }

      // 3. Complete queue entry if applicable
      if (queueId) {
        await api.put(`/queue/${queueId}/complete`);
      }

      if (prescResData) {
        setCreatedPrescription(prescResData);
      } else {
        alert('Consultation enregistrée avec succès !');
        navigate('/doctor/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de l enregistrement de la consultation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement du dossier patient...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Patient File Summary */}
      {patient && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-bold border border-teal-200">
                Dossier Patient Actif
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {patient.lastName.toUpperCase()} {patient.firstName}
              </h2>
              <p className="text-xs text-slate-500">
                Genre: {patient.gender === 'M' ? 'Homme' : 'Femme'} | Né(e) le : {patient.birthDate} | Tél: {patient.phone}
              </p>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                Allergies: {patient.allergies || 'Aucune connue'}
              </span>
              <span className="px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold rounded-xl">
                Groupe: {patient.bloodGroup || 'N/C'}
              </span>
            </div>
          </div>

          {/* Past Consultations Quick View */}
          {pastConsultations.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-teal-600" /> Consultations Précédentes ({pastConsultations.length})
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                {pastConsultations.slice(0, 2).map((c) => (
                  <div key={c.id} className="p-2 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900">{c.date}</span> — {c.diagnosis} ({c.treatmentPlan})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Consultation & Prescription Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
            <Stethoscope className="w-5 h-5 text-teal-600" /> Examen Médical & Diagnostic
          </h3>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Température (°C)</label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full mt-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Tension (mmHg)</label>
              <input
                type="text"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                className="w-full mt-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Poids (kg)</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full mt-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Pouls (bpm)</label>
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full mt-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Motif de consultation
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Symptômes constatés
              </label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ex : Fièvre, céphalées, frissons..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Diagnostic Médical *
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              placeholder="Ex : Syndrome grippal aigu, Rhinopharyngite..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              id="diagnosis-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Plan de traitement & Recommandations
            </label>
            <textarea
              rows={2}
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Hydratation, repos, contrôle sous 5 jours si pas d amélioration..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Prescription Builder */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" /> Établir l Ordonnance Médicale
            </h3>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Ajouter Médicament
            </button>
          </div>

          <div className="space-y-3">
            {prescriptionItems.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-500 uppercase">Médicament #{index + 1}</span>
                  {prescriptionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={item.medicationName}
                    onChange={(e) => handleItemChange(index, 'medicationName', e.target.value)}
                    placeholder="Nom du médicament (ex: Amoxicilline)"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={item.dosage}
                    onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                    placeholder="Dosage (ex: 1000 mg)"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={item.frequency}
                    onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                    placeholder="Fréquence (ex: 2/jour)"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                    placeholder="Durée (ex: 7 jours)"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <input
                  type="text"
                  value={item.instructions}
                  onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                  placeholder="Instructions particulières (ex: au cours du repas)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Recommandations sur l ordonnance
            </label>
            <input
              type="text"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor/dashboard')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
            id="save-consultation-btn"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Valider la Consultation & Générer Ordonnance'}
          </button>
        </div>
      </form>

      <PrescriptionPDFModal
        prescription={createdPrescription}
        onClose={() => {
          setCreatedPrescription(null);
          navigate('/doctor/dashboard');
        }}
      />
    </div>
  );
};
