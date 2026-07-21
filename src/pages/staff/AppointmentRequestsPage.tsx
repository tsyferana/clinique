import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { AppointmentDTO, DoctorDTO, TicketDTO } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { TicketModal } from '../../components/common/TicketModal.js';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Ticket,
  UserCheck,
  AlertCircle,
  Search,
} from 'lucide-react';

export const AppointmentRequestsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);

  // Modals state
  const [rejectModalAptId, setRejectModalAptId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [rescheduleAptId, setRescheduleAptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('09:30');

  const [selectedDocMap, setSelectedDocMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aptRes, docRes] = await Promise.all([
        api.get<AppointmentDTO[]>('/appointments'),
        api.get<DoctorDTO[]>('/users/doctors'),
      ]);
      setAppointments(Array.isArray(aptRes.data) ? aptRes.data : []);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (apt: AppointmentDTO) => {
    try {
      const doctorId = apt.doctorId; // Use the originally requested doctor
      const res = await api.put<AppointmentDTO>(`/appointments/${apt.id}/approve`, { doctorId });
      fetchData();
      if (res.data.ticketNumber) {
        const tRes = await api.get<TicketDTO>(`/appointments/${apt.id}/ticket`);
        setSelectedTicket(tRes.data);
      }
    } catch (err: any) {
      alert(err.message || 'Échec de la validation.');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalAptId || !rejectReason.trim()) return;
    try {
      await api.put(`/appointments/${rejectModalAptId}/reject`, { reason: rejectReason });
      setRejectModalAptId(null);
      setRejectReason('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Échec du refus.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAptId || !rescheduleDate || !rescheduleTime) return;
    try {
      await api.put(`/appointments/${rescheduleAptId}/reschedule`, {
        newDate: rescheduleDate,
        newTime: rescheduleTime,
      });
      setRescheduleAptId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Échec de la reprogrammation.');
    }
  };

  const handleMarkArrived = async (apt: AppointmentDTO) => {
    try {
      await api.put(`/appointments/${apt.id}/arrived`);
      // Add patient to today's queue directly!
      await api.post('/queue', {
        appointmentId: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId || doctors[0]?.id || 'doc-1',
        serviceId: apt.serviceId,
      });
      fetchData();
      alert(`Patient ${apt.patientName} marqué comme arrivé et ajouté à la file d attente !`);
    } catch (err: any) {
      alert(err.message || 'Échec du traitement d arrivée.');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const q = searchQuery.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(q) ||
      apt.serviceName.toLowerCase().includes(q) ||
      apt.reason.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement des demandes de rendez-vous...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gestion des Demandes de Rendez-vous</h2>
          <p className="text-xs text-slate-500">Validez, refusez, reprogrammez ou marquez l arrivée des patients.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher patient, service..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
            Aucune demande trouvée.
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{apt.patientName}</h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tél : <strong className="text-slate-700">{apt.patientPhone}</strong> | Service :{' '}
                    <strong className="text-slate-800">{apt.serviceName}</strong>
                  </p>
                </div>

                <div className="text-xs text-teal-800 font-bold bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-xl self-start sm:self-center">
                  <CalendarDays className="w-3.5 h-3.5 inline mr-1" /> {apt.appointmentDate} à {apt.appointmentTime}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <strong className="text-slate-700 block mb-1">Motif de consultation :</strong>
                  <p className="text-slate-600">{apt.reason}</p>
                  {apt.description && <p className="text-slate-500 italic mt-1">Détail : {apt.description}</p>}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <strong className="text-slate-700 block mb-1">Médecin Affecté :</strong>
                  <p className="font-semibold text-slate-900 mt-1">{apt.doctorName || 'Non spécifié'}</p>
                </div>
              </div>

              {/* Action Buttons depending on status */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {apt.ticketNumber && (
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Ticket généré: {apt.ticketNumber} (Code: {apt.ticketCode})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {apt.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(apt)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        id={`approve-apt-${apt.id}`}
                      >
                        <CheckCircle className="w-4 h-4" /> Accepter & Ticket
                      </button>

                      <button
                        onClick={() => {
                          setRescheduleAptId(apt.id);
                          setRescheduleDate(apt.appointmentDate);
                          setRescheduleTime(apt.appointmentTime);
                        }}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium text-xs rounded-xl transition-colors"
                        id={`reschedule-apt-${apt.id}`}
                      >
                        Reprogrammer
                      </button>

                      <button
                        onClick={() => setRejectModalAptId(apt.id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium text-xs rounded-xl transition-colors"
                        id={`reject-apt-${apt.id}`}
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  {apt.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => handleMarkArrived(apt)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        id={`mark-arrived-${apt.id}`}
                      >
                        <UserCheck className="w-4 h-4" /> Marquer Arrivé & File
                      </button>

                      <button
                        onClick={async () => {
                          const res = await api.get<TicketDTO>(`/appointments/${apt.id}/ticket`);
                          setSelectedTicket(res.data);
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-xl transition-colors flex items-center gap-1"
                        id={`print-ticket-${apt.id}`}
                      >
                        <Ticket className="w-3.5 h-3.5" /> Ticket
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {rejectModalAptId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-slate-900">Motif du Refus de Rendez-vous</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                placeholder="Indiquez la raison du refus (ex : médecin indisponible à cet horaire, planning complet...)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalAptId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Confirmer le Refus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAptId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-slate-900">Reprogrammer le Rendez-vous</h3>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nouvelle Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nouvel Horaire
                </label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  required
                  placeholder="Ex : 11:30"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleAptId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Valider la Reprogrammation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
};
