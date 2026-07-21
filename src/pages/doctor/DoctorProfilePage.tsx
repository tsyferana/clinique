import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { ServiceDTO } from '../../types/index.js';
import {
  User,
  Phone,
  Mail,
  Stethoscope,
  Building,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { user, doctorProfile, updateDoctorProfileState } = useAuth();
  const [services, setServices] = useState<ServiceDTO[]>([]);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: doctorProfile?.firstName || user?.firstName || '',
    lastName: doctorProfile?.lastName || user?.lastName || '',
    email: doctorProfile?.email || user?.email || '',
    phone: doctorProfile?.phone || user?.phone || '',
    specialty: doctorProfile?.specialty || '',
    cabinetNumber: doctorProfile?.cabinetNumber || '',
    serviceId: doctorProfile?.serviceId || '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (doctorProfile || user) {
      setProfileData({
        firstName: doctorProfile?.firstName || user?.firstName || '',
        lastName: doctorProfile?.lastName || user?.lastName || '',
        email: doctorProfile?.email || user?.email || '',
        phone: doctorProfile?.phone || user?.phone || '',
        specialty: doctorProfile?.specialty || '',
        cabinetNumber: doctorProfile?.cabinetNumber || '',
        serviceId: doctorProfile?.serviceId || '',
      });
    }
  }, [doctorProfile, user]);

  const fetchServices = async () => {
    try {
      const res = await api.get<ServiceDTO[]>('/users/services');
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur chargement des services:', err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);

    try {
      const res = await api.put('/users/doctor/profile', profileData);
      if (res.data.user && res.data.doctorProfile) {
        updateDoctorProfileState(res.data);
      }
      setProfileSuccess('Vos informations personnelles ont été mises à jour avec succès.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Échec de la mise à jour des informations.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setSavingPassword(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Votre mot de passe a été modifié avec succès.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Échec du changement de mot de passe.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profil Praticien & Sécurité</h2>
        <p className="text-xs text-slate-500 mt-1">
          Gérez vos informations personnelles de consultation et mettez à jour votre mot de passe d accès.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Informations Personnelles</h3>
            <p className="text-xs text-slate-500">Coordonnées et spécialités affichées aux patients et au personnel.</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prénom
              </label>
              <input
                type="text"
                required
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                id="doc-firstname"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nom
              </label>
              <input
                type="text"
                required
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                id="doc-lastname"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  id="doc-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Numéro de Téléphone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  id="doc-phone"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Spécialité Médicale
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={profileData.specialty}
                  onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                  placeholder="Ex : Cardiologie"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  id="doc-specialty"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                N° de Cabinet
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={profileData.cabinetNumber}
                  onChange={(e) => setProfileData({ ...profileData, cabinetNumber: e.target.value })}
                  placeholder="Ex : Cabinet B-202"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  id="doc-cabinet"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Service Médical
              </label>
              <select
                value={profileData.serviceId}
                onChange={(e) => setProfileData({ ...profileData, serviceId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                id="doc-service"
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              id="save-doc-profile-btn"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Mise à jour...' : 'Enregistrer mon profil'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Sécurité & Mot de Passe</h3>
            <p className="text-xs text-slate-500">
              Modifiez le mot de passe attribué par l administrateur pour sécuriser votre compte.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mot de passe actuel
            </label>
            <div className="relative max-w-md">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                id="doc-current-password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nouveau mot de passe (min. 6 car.)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  id="doc-new-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  id="doc-confirm-password"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              id="change-doc-password-btn"
            >
              <KeyRound className="w-4 h-4" />
              {savingPassword ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
