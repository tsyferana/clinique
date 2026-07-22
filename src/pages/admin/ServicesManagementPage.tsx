import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { ServiceDTO } from '../../types/index.js';
import {
  Settings,
  Plus,
  Stethoscope,
  Clock,
  Euro,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';

export const ServicesManagementPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationMinutes: 30,
    price: 50,
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get<ServiceDTO[]>('/users/services');
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur chargement des services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      durationMinutes: 30,
      price: 50,
      isActive: true,
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (service: ServiceDTO) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      isActive: service.isActive !== undefined ? service.isActive : true,
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (editingService) {
        // Update
        await api.put(`/users/services/${editingService.id}`, formData);
        setSuccessMsg(`Service "${formData.name}" modifié avec succès.`);
      } else {
        // Create
        await api.post('/users/services', formData);
        setSuccessMsg(`Service "${formData.name}" créé avec succès.`);
      }

      setShowModal(false);
      fetchServices();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de l enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (service: ServiceDTO) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.name}" ?`)) {
      return;
    }

    try {
      await api.delete(`/users/services/${service.id}`);
      setSuccessMsg(`Service "${service.name}" supprimé.`);
      fetchServices();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Échec de la suppression du service.');
    }
  };

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement des services médicaux...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Services Médicaux & Spécialités</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez les départements, tarifs, durées de consultation et disponibilités des actes médicaux.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un service..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            id="add-service-btn"
          >
            <Plus className="w-4 h-4" /> Nouveau Service
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid of Medical Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{s.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">ID: {s.id}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                    s.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {s.isActive !== false ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Actif
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-slate-400" /> Inactif
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{s.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-purple-600" /> {s.durationMinutes} min
                </span>
                <span className="text-emerald-700 font-extrabold text-sm flex items-center gap-0.5">
                  <Euro className="w-3.5 h-3.5" /> {s.price} MGA
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                  title="Modifier ce service"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                  title="Supprimer ce service"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Service */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">
                {editingService ? 'Modifier le Service Médical' : 'Nouveau Service Médical'}
              </h3>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nom du Service
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex : Cardiologie, Ophtalmologie..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  id="service-name-input"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Description de l acte
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Présentation des consultations, soins et équipements..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  id="service-desc-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Durée moyenne (min)
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    step={5}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    id="service-duration-input"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tarif consultation (MGA)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={5}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    id="service-price-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="service-active-check"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <label htmlFor="service-active-check" className="font-semibold text-slate-800 text-xs cursor-pointer">
                  Service ouvert & disponible aux réservations
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                  id="save-service-btn"
                >
                  {submitting ? 'Enregistrement...' : editingService ? 'Mettre à jour' : 'Créer le service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
