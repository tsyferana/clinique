import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { DoctorDashboardDTO, QueueEntryDTO } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import {
  Stethoscope,
  Activity,
  Users,
  CheckCircle2,
  CalendarDays,
  Clock,
  ArrowRight,
  PhoneCall,
  Play,
} from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DoctorDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get<DoctorDashboardDTO>('/dashboard/doctor');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async (queueId: string) => {
    try {
      await api.put(`/queue/${queueId}/call`);
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Échec de l appel.');
    }
  };

  const handleStartConsultation = async (entry: QueueEntryDTO) => {
    try {
      await api.put(`/queue/${entry.id}/start`);
      navigate(`/doctor/consultation?queueId=${entry.id}&patientId=${entry.patientId}&appointmentId=${entry.appointmentId || ''}`);
    } catch (err: any) {
      alert(err.message || 'Échec du démarrage de la consultation.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement de votre cabinet médical...</div>;
  }

  const nextPatient = (stats?.myQueue || []).find((q) => q.status === 'WAITING' || q.status === 'CALLED');

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
            Espace Médecin
          </span>
          <h2 className="text-2xl font-extrabold mt-2 tracking-tight">
            Bonjour, {stats?.doctorName}
          </h2>
          <p className="text-blue-100/80 text-sm mt-1">
            {stats?.specialty} — Cabinet N° {stats?.cabinetNumber}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/doctor/queue"
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-xs"
          >
            <Activity className="w-4 h-4" /> Salle d attente ({stats?.waitingCount || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patients en Attente</p>
          <p className="text-3xl font-extrabold text-blue-900 mt-2">{stats?.waitingCount || 0}</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">En salle d attente cabinet</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">RDV du Jour</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.todayAppointments?.length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Programmés dans votre agenda</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultations Réalisées</p>
          <p className="text-3xl font-extrabold text-emerald-800 mt-2">{stats?.completedTodayCount || 0}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Aujourd hui</p>
        </div>
      </div>

      {/* Next Patient Call Card */}
      {nextPatient && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-900 text-blue-300 font-black text-xl rounded-2xl flex flex-col items-center justify-center shrink-0">
              <span className="text-[9px] uppercase font-bold text-blue-200">Ticket</span>
              <span>{nextPatient.ticketNumber}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Prochain Patient en attente</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{nextPatient.patientName}</h3>
              <p className="text-xs text-slate-600">{nextPatient.serviceName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCallNext(nextPatient.id)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              id="call-next-patient-btn"
            >
              <PhoneCall className="w-4 h-4" /> Appeler
            </button>

            <button
              onClick={() => handleStartConsultation(nextPatient)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              id="start-next-consultation-btn"
            >
              <Play className="w-4 h-4" /> Démarrer Consultation
            </button>
          </div>
        </div>
      )}

      {/* Today's Queue List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> File d attente de votre cabinet
          </h3>
          <Link to="/doctor/queue" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            Gérer la file <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!stats?.myQueue || stats.myQueue.length === 0) ? (
          <p className="text-center text-slate-400 text-xs py-6">Aucun patient en attente pour votre cabinet.</p>
        ) : (
          <div className="space-y-3">
            {stats.myQueue.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-slate-900 text-teal-400 font-extrabold text-sm rounded-xl flex items-center justify-center shrink-0">
                    {entry.ticketNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{entry.patientName}</h4>
                      <StatusBadge status={entry.status} />
                    </div>
                    <p className="text-xs text-slate-500">{entry.serviceName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartConsultation(entry)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                    id={`doc-start-cons-${entry.id}`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" /> Consulter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
