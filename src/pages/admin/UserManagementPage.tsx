import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { UserDTO, ServiceDTO, DoctorDTO } from '../../types/index.js';
import { UserPlus, Trash2, Search, X, Stethoscope, CheckCircle2 } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // === Create User Modal ===
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'password123',
    phone: '',
    role: 'STAFF' as 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT',
    specialty: 'Médecine Générale',
    cabinetNumber: 'Cabinet 101',
    serviceId: '',
  });

  // === Edit Doctor Profile Modal ===
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
  const [editingDoctorUser, setEditingDoctorUser] = useState<UserDTO | null>(null);
  const [doctorEditForm, setDoctorEditForm] = useState({
    specialty: '',
    cabinetNumber: '',
    serviceId: '',
    isAvailable: true,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, sRes, dRes] = await Promise.all([
        api.get<UserDTO[]>('/users'),
        api.get<ServiceDTO[]>('/users/services'),
        api.get<DoctorDTO[]>('/users/doctors'),
      ]);
      const usersList = Array.isArray(uRes.data) ? uRes.data : [];
      const servicesList = Array.isArray(sRes.data) ? sRes.data : [];
      const doctorsList = Array.isArray(dRes.data) ? dRes.data : [];
      setUsers(usersList);
      setServices(servicesList);
      setDoctors(doctorsList);
      if (servicesList.length > 0) {
        setNewUser((prev) => ({ ...prev, serviceId: servicesList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      setShowCreateModal(false);
      fetchData();
      alert('Utilisateur créé avec succès !');
    } catch (err: any) {
      alert(err.message || 'Échec de la création.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Voulez-vous supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Échec de la suppression.');
    }
  };

  const handleOpenEditDoctor = (user: UserDTO) => {
    const doctorProfile = doctors.find((d) => d.userId === user.id);
    setEditingDoctorUser(user);
    setDoctorEditForm({
      specialty: doctorProfile?.specialty || '',
      cabinetNumber: doctorProfile?.cabinetNumber || '',
      serviceId: doctorProfile?.serviceId || (services[0]?.id ?? ''),
      isAvailable: doctorProfile?.isAvailable ?? true,
    });
    setEditError(null);
    setEditSuccess(null);
    setShowEditDoctorModal(true);
  };

  const handleSubmitEditDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctorUser) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await api.put(`/users/admin/doctor/${editingDoctorUser.id}/profile`, doctorEditForm);
      setEditSuccess(`Profil de Dr. ${editingDoctorUser.firstName} ${editingDoctorUser.lastName} mis à jour.`);
      fetchData();
      setTimeout(() => {
        setShowEditDoctorModal(false);
        setEditSuccess(null);
      }, 1800);
    } catch (err: any) {
      setEditError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      DOCTOR: 'bg-blue-100 text-blue-800',
      STAFF: 'bg-emerald-100 text-emerald-800',
      PATIENT: 'bg-teal-100 text-teal-800',
    };
    return map[role] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gestion des Comptes Utilisateurs</h2>
          <p className="text-xs text-slate-500">Administrez les accès médecins, secrétaires et administrateurs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher nom, email..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
            id="add-user-btn"
          >
            <UserPlus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Nom & Prénom</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Rôle</th>
                <th className="p-3.5">Téléphone</th>
                <th className="p-3.5">Spécialité / Cabinet</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const doctorProfile = doctors.find((d) => d.userId === u.id);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      {u.lastName.toUpperCase()} {u.firstName}
                    </td>
                    <td className="p-3.5 text-slate-600">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{u.phone}</td>
                    <td className="p-3.5">
                      {u.role === 'DOCTOR' && doctorProfile ? (
                        <span className="text-blue-700 font-semibold">
                          {doctorProfile.specialty} — {doctorProfile.cabinetNumber}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === 'DOCTOR' && (
                          <button
                            onClick={() => handleOpenEditDoctor(u)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier le profil professionnel"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL : Modifier Profil Médecin (infos professionnelles uniquement) */}
      {showEditDoctorModal && editingDoctorUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" /> Profil Professionnel
                </h3>
                <p className="text-blue-100 text-sm mt-0.5">
                  Dr. {editingDoctorUser.firstName} {editingDoctorUser.lastName}
                </p>
              </div>
              <button
                onClick={() => setShowEditDoctorModal(false)}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-700/50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {editSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  {editSuccess}
                </div>
              )}
              {editError && (
                <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl text-rose-700 text-sm">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSubmitEditDoctor} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Spécialité Médicale
                  </label>
                  <input
                    type="text"
                    value={doctorEditForm.specialty}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, specialty: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    placeholder="Ex: Cardiologie, Pédiatrie..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    N° de Cabinet
                  </label>
                  <input
                    type="text"
                    value={doctorEditForm.cabinetNumber}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, cabinetNumber: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    placeholder="Ex: Cabinet A-201"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Service Rattaché
                  </label>
                  <select
                    value={doctorEditForm.serviceId}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, serviceId: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Disponibilité</p>
                    <p className="text-xs text-slate-500">Ce médecin peut recevoir des rendez-vous</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDoctorEditForm({ ...doctorEditForm, isAvailable: !doctorEditForm.isAvailable })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      doctorEditForm.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        doctorEditForm.isAvailable ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditDoctorModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
                  >
                    {editLoading ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : Créer un utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Ajouter un nouvel utilisateur</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600">Prénom</label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600">Nom</label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                  placeholder="docteur@clinique.fr"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600">Mot de passe initial (min. 6 car.)</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg font-mono"
                  placeholder="Ex: DocPass2026!"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600">Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border rounded-lg font-bold text-slate-800"
                >
                  <option value="STAFF">STAFF (Réception)</option>
                  <option value="DOCTOR">DOCTOR (Médecin)</option>
                  <option value="ADMIN">ADMIN (Administrateur)</option>
                  <option value="PATIENT">PATIENT</option>
                </select>
              </div>

              {newUser.role === 'DOCTOR' && (
                <>
                  <div>
                    <label className="font-bold text-slate-600">Spécialité</label>
                    <input
                      type="text"
                      value={newUser.specialty}
                      onChange={(e) => setNewUser({ ...newUser, specialty: e.target.value })}
                      className="w-full p-2 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600">N° de Cabinet</label>
                    <input
                      type="text"
                      value={newUser.cabinetNumber}
                      onChange={(e) => setNewUser({ ...newUser, cabinetNumber: e.target.value })}
                      className="w-full p-2 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600">Service rattaché</label>
                    <select
                      value={newUser.serviceId}
                      onChange={(e) => setNewUser({ ...newUser, serviceId: e.target.value })}
                      className="w-full p-2 bg-slate-50 border rounded-lg"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-600">Téléphone</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-700"
                >
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
