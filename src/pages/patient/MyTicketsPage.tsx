import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { AppointmentDTO, TicketDTO } from '../../types/index.js';
import { TicketModal } from '../../components/common/TicketModal.js';
import { Ticket, Calendar, Clock, Stethoscope, Printer } from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get<AppointmentDTO[]>('/appointments/my');
      const list = Array.isArray(res.data) ? res.data : [];
      setAppointments(list.filter((a) => a.ticketNumber));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (aptId: string) => {
    try {
      const res = await api.get<TicketDTO>(`/appointments/${aptId}/ticket`);
      setSelectedTicket(res.data);
    } catch (err: any) {
      alert(err.message || 'Impossible de récupérer le ticket.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement de vos tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Mes Tickets de Rendez-vous</h2>
        <p className="text-xs text-slate-500">Imprimez ou téléchargez vos billets officiels pour vos passages au cabinet.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 text-slate-500">
          Vous n avez aucun ticket actif pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white">
                <p className="text-xs font-mono font-semibold text-teal-400 uppercase tracking-wider">
                  Ticket N° {apt.ticketNumber}
                </p>
                <h3 className="text-lg font-extrabold mt-1">{apt.serviceName}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{apt.doctorName}</p>
              </div>

              <div className="p-5 space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-4 h-4 text-slate-400" /> Date
                  </span>
                  <span className="font-semibold text-slate-900">{apt.appointmentDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" /> Heure
                  </span>
                  <span className="font-bold text-teal-700">{apt.appointmentTime}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Code RDV</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                    {apt.ticketCode || 'TK-0000'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => openTicket(apt.id)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                  id={`open-ticket-modal-${apt.id}`}
                >
                  <Printer className="w-4 h-4" /> Afficher & Imprimer Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
};
