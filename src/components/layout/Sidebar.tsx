import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Ticket,
  FileText,
  User,
  Users,
  Clock,
  UserPlus,
  Stethoscope,
  ClipboardList,
  Pill,
  Settings,
  Activity,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getLinksForRole = () => {
    switch (user.role) {
      case 'PATIENT':
        return [
          { to: '/patient/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
          { to: '/patient/book', label: 'Prendre Rendez-vous', icon: CalendarPlus },
          { to: '/patient/appointments', label: 'Mes Rendez-vous', icon: CalendarDays },
          { to: '/patient/tickets', label: 'Mes Tickets', icon: Ticket },
          { to: '/patient/medical-history', label: 'Historique & Ordonnances', icon: FileText },
          { to: '/patient/profile', label: 'Mon Profil', icon: User },
        ];

      case 'STAFF':
        return [
          { to: '/staff/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
          { to: '/staff/calendar', label: 'Planning & Calendrier', icon: CalendarDays },
          { to: '/staff/requests', label: 'Demandes RDV', icon: ClipboardList },
          { to: '/staff/queue', label: 'File d attente du jour', icon: Clock },
          { to: '/staff/walk-in', label: 'Enregistrer Sans RDV', icon: UserPlus },
          { to: '/staff/patients', label: 'Répertoire Patients', icon: Users },
        ];

      case 'DOCTOR':
        return [
          { to: '/doctor/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
          { to: '/doctor/agenda', label: 'Mon Agenda', icon: CalendarDays },
          { to: '/doctor/queue', label: 'File d attente & Consultations', icon: Activity },
          { to: '/doctor/prescriptions', label: 'Ordonnances créées', icon: Pill },
          { to: '/doctor/profile', label: 'Mon Profil & Sécurité', icon: User },
        ];

      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Statistiques Globales', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Gestion Utilisateurs', icon: Users },
          { to: '/admin/services', label: 'Services Médicaux', icon: Settings },
          { to: '/staff/requests', label: 'Supervision Rendez-vous', icon: CalendarDays },
          { to: '/staff/queue', label: 'Supervision File d attente', icon: Clock },
        ];

      default:
        return [];
    }
  };

  const links = getLinksForRole();

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-xl border border-white rounded-3xl min-h-[calc(100vh-4rem-3rem)] p-5 shrink-0 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-slide-up">
      <div className="space-y-6">
        <div>
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Espace {user.role}</p>
          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20 translate-x-1'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 hover:translate-x-1'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors duration-300`} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 mt-6 hover-card">
        <p className="font-bold text-slate-700 tracking-tight">Support Technique</p>
        <p className="mt-1 font-medium">Tél: 01 40 50 60 70</p>
        <p className="mt-2 text-[10px] text-teal-600 font-mono tracking-wider">CLINIQUE_ST_LUC_V2.4</p>
      </div>
    </aside>
  );
};
