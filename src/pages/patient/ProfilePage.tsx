import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { User, Phone, Mail, MapPin, Heart, ShieldAlert, Save, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, patientProfile } = useAuth();

  const [formData, setFormData] = useState({
    firstName: patientProfile?.firstName || user?.firstName || '',
    lastName: patientProfile?.lastName || user?.lastName || '',
    phone: patientProfile?.phone || user?.phone || '',
    address: patientProfile?.address || '',
    bloodGroup: patientProfile?.bloodGroup || '',
    allergies: patientProfile?.allergies || '',
    medicalHistory: patientProfile?.medicalHistory || '',
    emergencyContact: patientProfile?.emergencyContact || '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientProfile?.id) return;
    setSaving(true);
    setSuccess(false);

    try {
      await api.put(`/patients/${patientProfile.id}`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        blood_group: formData.bloodGroup,
        allergies: formData.allergies,
        medical_history: formData.medicalHistory,
        emergency_contact: formData.emergencyContact,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Échec de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Mon Profil & Dossier Médical</h2>
        <p className="text-xs text-slate-500">Mettez à jour vos coordonnées et informations de santé relatives.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Profil mis à jour avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nom
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Groupe Sanguin
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Inconnu / Non spécifié --</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Adresse postale
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Allergies Connues
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="Ex : Pénicilline, Latex, Arachides..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Antécédents Médicaux & Chirurgicaux
            </label>
            <textarea
              rows={3}
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              placeholder="Maladies chroniques, interventions, traitements au long cours..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contact en cas d Urgence
            </label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Nom, lien de parenté et téléphone"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
              id="save-profile-btn"
            >
              <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
