import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { PatientDTO } from '../../types/index.js';
import { Users, Search, Phone, Mail, User, FileText, Calendar } from 'lucide-react';

export const PatientDirectoryPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get<PatientDTO[]>('/patients');
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement du répertoire des patients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Répertoire des Patients</h2>
          <p className="text-xs text-slate-500">Consultez l ensemble des profils enregistrés dans la clinique.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom, téléphone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Patient</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Genre & Naissance</th>
                <th className="p-3.5">Groupe Sanguin</th>
                <th className="p-3.5">Allergies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 text-sm">
                      {p.lastName.toUpperCase()} {p.firstName}
                    </p>
                    <p className="text-[11px] text-slate-400">{p.email || 'Sans email'}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{p.phone}</p>
                    <p className="text-[11px] text-slate-500">{p.address || 'Adresse non renseignée'}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium text-slate-800">
                      {p.gender === 'M' ? 'Masculin' : p.gender === 'F' ? 'Féminin' : 'Autre'}
                    </p>
                    <p className="text-[11px] text-slate-400">{p.birthDate}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 font-bold rounded-md border border-teal-200">
                      {p.bloodGroup || 'N/C'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{p.allergies || 'Aucune'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
