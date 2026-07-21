import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { StaffDashboardDTO, TicketDTO } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { TicketModal } from '../../components/common/TicketModal.js';
import {
  CalendarDays,
  Clock,
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Ticket,
  Activity,
  Bell,
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StaffDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get<StaffDashboardDTO>('/dashboard/staff');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement de l espace secrétariat...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
            Espace Accueil & Réception
          </span>
          <h2 className="text-2xl font-extrabold mt-2 tracking-tight">Tableau de Bord Secrétariat</h2>
          <p className="text-emerald-100/80 text-sm mt-1">
            Validez les demandes en ligne, gérez les entrées sur place et contrôlez la file d attente du jour.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/staff/walk-in"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-xs"
            id="staff-walkin-btn"
          >
            <UserPlus className="w-4 h-4" /> Patient Sans RDV
          </Link>
          <Link
            to="/staff/requests"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition-colors backdrop-blur-xs flex items-center gap-2"
          >
            <CalendarDays className="w-4 h-4" /> Traiter Demandes ({stats?.pendingRequestsCount || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demandes en attente</p>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.pendingRequestsCount || 0}</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">À traiter en priorité</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">RDV du jour</p>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.todayAppointmentsCount || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Programmés aujourd hui</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patients en file</p>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.inQueueCount || 0}</p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">Actuellement en salle d attente</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultations terminées</p>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.completedTodayCount || 0}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Aujourd hui</p>
        </div>
      </div>

      {/* Main Grid: Queue & Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" /> Salle d attente & File d attente
            </h3>
            <Link to="/staff/queue" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
              Gérer la file <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!stats?.currentQueue || stats.currentQueue.length === 0) ? (
            <p className="text-center text-slate-400 text-xs py-6">Aucun patient en file actuellement.</p>
          ) : (
            <div className="space-y-3">
              {stats.currentQueue.slice(0, 5).map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                      {q.ticketNumber}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{q.patientName}</p>
                      <p className="text-xs text-slate-500">{q.doctorName} ({q.serviceName})</p>
                    </div>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming RDV */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-600" /> Planning du Jour
            </h3>
            <Link to="/staff/requests" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!stats?.upcomingAppointments || stats.upcomingAppointments.length === 0) ? (
            <p className="text-center text-slate-400 text-xs py-6">Aucun rendez-vous prévu aujourd hui.</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {apt.serviceName} ({apt.appointmentTime}) — {apt.doctorName}
                    </p>
                  </div>

                  {apt.ticketNumber && (
                    <button
                      onClick={async () => {
                        const res = await api.get<TicketDTO>(`/appointments/${apt.id}/ticket`);
                        setSelectedTicket(res.data);
                      }}
                      className="p-2 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors"
                      title="Imprimer Ticket"
                    >
                      <Ticket className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
};
