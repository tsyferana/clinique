import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { ServiceDTO, DoctorDTO, TicketDTO } from '../../types/index.js';
import { TicketModal } from '../../components/common/TicketModal.js';
import { UserPlus, Stethoscope, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';

export const WalkInRegisterPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<TicketDTO | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: 'M' as 'M' | 'F' | 'OTHER',
    birthDate: '1990-01-01',
    serviceId: '',
    doctorId: '',
    reason: 'Accueil direct / Sans rendez-vous',
  });

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
        setFormData((prev) => ({ ...prev, serviceId: srvList[0].id }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId) {
      setError('Veuillez sélectionner un service.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // 1. Register or find walk-in patient profile
      const pRes = await api.post('/patients/walk-in', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        birthDate: formData.birthDate,
      });

      const patientId = pRes.data.id;

      // 2. Create walk-in appointment
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const aptRes = await api.post('/appointments', {
        serviceId: formData.serviceId,
        doctorId: formData.doctorId || filteredDoctors[0]?.id || 'doc-1',
        date: today,
        time: nowTime,
        reason: formData.reason,
        patientIdOverride: patientId,
      });

      const aptId = aptRes.data.id;

      // 3. Approve immediately -> generates ticket
      await api.put(`/appointments/${aptId}/approve`, {
        doctorId: formData.doctorId || filteredDoctors[0]?.id || 'doc-1',
      });

      // 4. Mark Arrived & Add to queue
      await api.put(`/appointments/${aptId}/arrived`);
      await api.post('/queue', {
        appointmentId: aptId,
        patientId: patientId,
        doctorId: formData.doctorId || filteredDoctors[0]?.id || 'doc-1',
        serviceId: formData.serviceId,
      });

      // 5. Get ticket
      const ticketRes = await api.get<TicketDTO>(`/appointments/${aptId}/ticket`);
      setGeneratedTicket(ticketRes.data);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        gender: 'M',
        birthDate: '1990-01-01',
        serviceId: services[0]?.id || '',
        doctorId: '',
        reason: 'Accueil direct / Sans rendez-vous',
      });
    } catch (err: any) {
      setError(err.message || 'Échec de l enregistrement sans RDV.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement du formulaire de réception...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Enregistrer un Patient Sans Rendez-vous</h2>
            <p className="text-xs text-slate-500">
              Générez un ticket instantané et insérez le patient immédiatement dans la file du jour.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prénom du Patient *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Ex: Paul"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                id="walkin-firstname"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nom du Patient *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Ex: Martin"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                id="walkin-lastname"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0612345678"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                id="walkin-phone"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Genre
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                id="walkin-gender"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Service Médical *
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value, doctorId: '' })}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                id="walkin-service"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.price} €)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Médecin
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                id="walkin-doctor"
              >
                <option value="">-- Premier disponible --</option>
                {filteredDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.cabinetNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Motif de la visite
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              id="walkin-reason"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 text-sm"
              id="submit-walkin-btn"
            >
              <Ticket className="w-4 h-4" />{' '}
              {submitting ? 'Enregistrement & Génération...' : 'Valider & Imprimer le Ticket'}
            </button>
          </div>
        </form>
      </div>

      <TicketModal ticket={generatedTicket} onClose={() => setGeneratedTicket(null)} />
    </div>
  );
};
