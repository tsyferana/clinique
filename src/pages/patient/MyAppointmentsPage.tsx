import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { AppointmentDTO, TicketDTO } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { TicketModal } from '../../components/common/TicketModal.js';
import { CalendarDays, Clock, Ticket, AlertCircle, Ban, CheckCircle } from 'lucide-react';

export const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED'>('ALL');

  const [searchParams] = useSearchParams();
  const justBooked = searchParams.get('booked') === 'true';

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get<AppointmentDTO[]>('/appointments/my');
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette demande de rendez-vous ?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l annulation.');
    }
  };

  const filtered = appointments.filter((apt) => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement de vos rendez-vous...</div>;
  }

  return (
    <div className="space-y-6">
      {justBooked && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Demande envoyée avec succès !</p>
            <p className="text-xs text-emerald-700">
              Votre rendez-vous est en attente de validation par le secrétariat. Vous recevrez la confirmation et votre ticket sous peu.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mes Demandes & Rendez-vous</h2>
          <p className="text-xs text-slate-500">Suivez l état de vos réservations et accédez à vos billets de passage.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'PENDING' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En Attente
          </button>
          <button
            onClick={() => setFilter('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'CONFIRMED' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Confirmés
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'COMPLETED' ? 'bg-white text-slate-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terminés
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 text-slate-500">
          Aucun rendez-vous trouvé pour ce filtre.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{apt.serviceName}</h3>
                  <StatusBadge status={apt.status} />
                </div>

                <p className="text-xs text-slate-600">
                  Médecin : <strong className="text-slate-800">{apt.doctorName}</strong> | Motif : {apt.reason}
                </p>

                {apt.description && (
                  <p className="text-xs text-slate-500 italic">Note: {apt.description}</p>
                )}

                {apt.rejectionReason && (
                  <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                    <strong>Motif du refus:</strong> {apt.rejectionReason}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-teal-700 pt-1">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> Date: {apt.appointmentDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Heure: {apt.appointmentTime}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                {apt.ticketNumber && (
                  <button
                    onClick={async () => {
                      const res = await api.get<TicketDTO>(`/appointments/${apt.id}/ticket`);
                      setSelectedTicket(res.data);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    id={`view-ticket-${apt.id}`}
                  >
                    <Ticket className="w-4 h-4" /> Voir Ticket
                  </button>
                )}

                {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-xl transition-colors border border-rose-200 flex items-center gap-1"
                    id={`cancel-apt-${apt.id}`}
                  >
                    <Ban className="w-3.5 h-3.5" /> Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
};
