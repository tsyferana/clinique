import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Stethoscope, LogOut, User, Shield, Users, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, quickSwitchAccount } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">Administrateur</span>;
      case 'DOCTOR':
        return <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full border border-blue-200">Médecin</span>;
      case 'STAFF':
        return <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">Réception / Staff</span>;
      case 'PATIENT':
        return <span className="px-2 py-0.5 text-xs font-bold bg-teal-100 text-teal-800 rounded-full border border-teal-200">Patient</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/40 transition-transform group-hover:scale-105">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-white drop-shadow-xs">
              CLINIQUE SAINT-LUC
            </h1>
            <p className="text-[11px] text-teal-300/80 font-medium tracking-wide">Plateforme Médicale</p>
          </div>
        </div>

        {/* Quick Role Switcher for seamless testing & evaluation */}
        <div className="hidden lg:flex items-center bg-slate-950/50 rounded-full p-1 border border-slate-700/50 text-xs shadow-inner">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 px-3 font-semibold">Test Rôle</span>
          <button
            onClick={() => quickSwitchAccount('PATIENT')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              user?.role === 'PATIENT' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => quickSwitchAccount('STAFF')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              user?.role === 'STAFF' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Réception
          </button>
          <button
            onClick={() => quickSwitchAccount('DOCTOR')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              user?.role === 'DOCTOR' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Médecin
          </button>
          <button
            onClick={() => quickSwitchAccount('ADMIN')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              user?.role === 'ADMIN' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Right User info & Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-100 tracking-tight">
                {user.firstName} {user.lastName.toUpperCase()}
              </div>
              <div className="mt-0.5">{getRoleBadge(user.role)}</div>
            </div>

            <button
              onClick={logout}
              className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              title="Déconnexion"
              id="logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
