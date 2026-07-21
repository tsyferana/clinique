import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { AdminDashboardDTO } from '../../types/index.js';
import { Users, Stethoscope, Settings, CalendarDays, Activity, Shield, TrendingUp } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get<AdminDashboardDTO>('/dashboard/admin');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement des statistiques administratives...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
          Supervision Administrateur
        </span>
        <h2 className="text-2xl font-extrabold mt-2 tracking-tight">Vue d Ensemble de la Clinique</h2>
        <p className="text-purple-100/80 text-sm mt-1">
          Gérez l ensemble des utilisateurs, praticiens, services médicaux et surveillez la performance globale.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patients Enregistrés</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalPatients || 0}</p>
          <p className="text-xs text-teal-600 font-semibold mt-1">Base active clinique</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Médecins Spécialistes</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalDoctors || 0}</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">Praticiens actifs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultations Totales</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalConsultations || 0}</p>
          <p className="text-xs text-purple-600 font-semibold mt-1">Historique complet</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Services Médicaux</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalServices || 0}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Pôles cliniques</p>
        </div>
      </div>

      {/* Role Breakdown Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Répartition des comptes utilisateurs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <span className="block text-2xl font-black text-purple-900">{stats?.usersByRole?.ADMIN || 0}</span>
            <span className="text-xs font-semibold text-purple-700 uppercase">Administrateurs</span>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="block text-2xl font-black text-blue-900">{stats?.usersByRole?.DOCTOR || 0}</span>
            <span className="text-xs font-semibold text-blue-700 uppercase">Médecins</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="block text-2xl font-black text-emerald-900">{stats?.usersByRole?.STAFF || 0}</span>
            <span className="text-xs font-semibold text-emerald-700 uppercase">Personnel Réception</span>
          </div>

          <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
            <span className="block text-2xl font-black text-teal-900">{stats?.usersByRole?.PATIENT || 0}</span>
            <span className="text-xs font-semibold text-teal-700 uppercase">Patients</span>
          </div>
        </div>
      </div>
    </div>
  );
};
