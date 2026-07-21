import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Stethoscope, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield, HeartPulse } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@clinique.com');
  const [password, setPassword] = useState('clinique2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, quickSwitchAccount } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'PATIENT' | 'STAFF' | 'DOCTOR' | 'ADMIN') => {
    setLoading(true);
    try {
      await quickSwitchAccount(role);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
      
      {/* LEFT SIDE - Brand & Decorative (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between overflow-hidden bg-slate-900">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-br from-teal-900/40 to-slate-900 z-0 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-teal-600/20 rounded-full blur-[100px] animate-float z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} z-0 />
        
        {/* Abstract Pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>

        <div className="relative z-10 p-12 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-900/50">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">Saint-Luc</h1>
              <p className="text-sm font-semibold tracking-widest text-teal-400 uppercase">Clinique Digitale</p>
            </div>
          </div>

          {/* Marketing text */}
          <div className="mt-auto mb-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              La santé de demain, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">aujourd'hui.</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-md font-medium leading-relaxed">
              Gérez vos rendez-vous, accédez à vos dossiers médicaux et collaborez avec vos confrères sur une plateforme unifiée et sécurisée.
            </p>
            
            <div className="mt-12 flex items-center gap-6 text-sm font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-500" /> Sécurité HDS
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" /> Soins Continus
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10">
        
        {/* Mobile background (visible only on small screens) */}
        <div className="absolute inset-0 bg-slate-900 lg:hidden -z-10 overflow-hidden">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[80px]" />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center animate-fade-in">
             <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-900/50 mb-4">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Saint-Luc</h1>
            <p className="text-sm font-semibold tracking-widest text-teal-400 uppercase mt-1">Clinique Digitale</p>
          </div>

          <div className="glass-panel lg:bg-white lg:shadow-2xl lg:border-slate-100 rounded-3xl p-8 sm:p-10 animate-slide-up relative overflow-hidden">
            
            {/* Very subtle glow inside the card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-100 rounded-full blur-3xl opacity-50 hidden lg:block" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold text-slate-900 lg:text-slate-800 tracking-tight">Bienvenue</h3>
              <p className="text-sm text-slate-500 lg:text-slate-500 mt-1 mb-8 font-medium">Connectez-vous pour accéder à votre espace personnel.</p>

              {error && (
                <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl text-rose-700 text-sm font-medium flex items-center gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                    Adresse Email
                  </label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3 transition-colors group-focus-within:text-teal-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
                      placeholder="exemple@clinique.fr"
                      id="email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3 transition-colors group-focus-within:text-teal-600" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
                      placeholder="••••••••"
                      id="password-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm mt-8 disabled:opacity-70 disabled:hover:translate-y-0"
                  id="login-btn"
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'} 
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              {/* Quick Demo Login Preset Buttons */}
              <div className="mt-10 pt-8 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
                  Démo : Accès instantané
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('PATIENT')}
                    className="group p-3 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="block text-[11px] font-bold text-slate-800 group-hover:text-teal-900 transition-colors">Patient</span>
                    <span className="text-[10px] text-teal-600 font-medium">Bob Testeur</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('STAFF')}
                    className="group p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="block text-[11px] font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">Réception</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Alice Accueil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('DOCTOR')}
                    className="group p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="block text-[11px] font-bold text-slate-800 group-hover:text-blue-900 transition-colors">Médecin</span>
                    <span className="text-[10px] text-blue-600 font-medium">Dr. Jean Dupont</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('ADMIN')}
                    className="group p-3 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="block text-[11px] font-bold text-slate-800 group-hover:text-purple-900 transition-colors">Admin</span>
                    <span className="text-[10px] text-purple-600 font-medium">Super Admin</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-slate-500 font-medium">
                Vous n'avez pas de compte ?{' '}
                <Link to="/register" className="font-bold text-teal-600 hover:text-teal-500 hover:underline transition-colors">
                  Créer un espace patient
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
