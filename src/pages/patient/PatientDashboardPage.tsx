import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { PatientDashboardDTO, TicketDTO } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { TicketModal } from '../../components/common/TicketModal.js';
import { CalendarPlus, Ticket, FileText, CalendarDays, Clock, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

export const PatientDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<PatientDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get<PatientDashboardDTO>('/dashboard/patient');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        Chargement de votre tableau de bord...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
            Espace Patient Sécurisé
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Bienvenue sur votre espace médical
          </h2>
          <p className="text-teal-100/80 text-sm mt-1 leading-relaxed">
            Prenez rendez-vous en ligne, suivez vos validations, téléchargez vos tickets de passage et consultez vos ordonnances.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/patient/book"
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
              id="dash-book-now-btn"
            >
              <CalendarPlus className="w-4 h-4" /> Demander un rendez-vous
            </Link>
            <Link
              to="/patient/tickets"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition-colors backdrop-blur-xs flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" /> Voir mes tickets
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demandes & RDV</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats?.appointments?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consultations</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats?.recentConsultationsCount || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ordonnances</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats?.recentPrescriptionsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Active Ticket Banner if available */}
      {stats?.latestTicket && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Votre Ticket Confirmé</p>
              <p className="text-lg font-bold text-slate-900">
                N° {stats.latestTicket.ticketNumber} — {stats.latestTicket.serviceName} ({stats.latestTicket.appointmentTime})
              </p>
              <p className="text-xs text-slate-600">
                Dr. {stats.latestTicket.doctorName} — Code RDV: {stats.latestTicket.ticketCode}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTicket(stats.latestTicket!)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            id="open-active-ticket-btn"
          >
            <Ticket className="w-4 h-4" /> Voir & Imprimer Ticket
          </button>
        </div>
      )}

      {/* Recent Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Vos récents rendez-vous</h3>
          <Link to="/patient/appointments" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!stats?.appointments || stats.appointments.length === 0) ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Vous n avez encore aucun rendez-vous enregistré.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.appointments.slice(0, 4).map((apt) => (
              <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{apt.serviceName}</span>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Médecin: <strong className="text-slate-700">{apt.doctorName}</strong> | Motif: {apt.reason}
                  </p>
                  <p className="text-xs text-teal-700 font-semibold mt-1 flex items-center gap-2">
                    <span><CalendarDays className="w-3.5 h-3.5 inline mr-1" />{apt.appointmentDate}</span>
                    <span><Clock className="w-3.5 h-3.5 inline mr-1" />{apt.appointmentTime}</span>
                  </p>
                </div>

                {apt.ticketNumber && (
                  <button
                    onClick={async () => {
                      const res = await api.get<TicketDTO>(`/appointments/${apt.id}/ticket`);
                      setSelectedTicket(res.data);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <Ticket className="w-3.5 h-3.5" /> Ticket
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
};
