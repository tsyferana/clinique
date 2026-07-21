import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { QueueEntryDTO } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Activity, PhoneCall, Stethoscope, RefreshCw, CheckCircle2 } from 'lucide-react';

export const DoctorQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<QueueEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get<QueueEntryDTO[]>('/queue/today');
      setQueue(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (id: string) => {
    try {
      await api.put(`/queue/${id}/call`);
      fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Échec de l appel.');
    }
  };

  const handleStartConsultation = async (entry: QueueEntryDTO) => {
    try {
      await api.put(`/queue/${entry.id}/start`);
      navigate(
        `/doctor/consultation?queueId=${entry.id}&patientId=${entry.patientId}&appointmentId=${
          entry.appointmentId || ''
        }`
      );
    } catch (err: any) {
      alert(err.message || 'Échec du lancement.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement de la file d attente du cabinet...</div>;
  }

  const activeQueue = queue.filter((entry) => entry.status !== 'COMPLETED' && entry.status !== 'CANCELLED');
  const completedQueue = queue.filter((entry) => entry.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">File d Attente Active du Cabinet ({activeQueue.length})</h2>
          <p className="text-xs text-slate-500">
            Appelez les patients en salle d attente et démarrer leur consultation. Une fois la consultation et ordonnance validées, le patient est automatiquement retiré de cette liste.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {activeQueue.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
          Aucun patient en attente dans la file active pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeQueue.map((entry) => (
            <div
              key={entry.id}
              className={`bg-white p-5 rounded-2xl border transition-all ${
                entry.status === 'CALLED'
                  ? 'border-cyan-400 bg-cyan-50/40 ring-2 ring-cyan-400/30'
                  : entry.status === 'IN_CONSULTATION'
                  ? 'border-violet-300 bg-violet-50/30'
                  : 'border-slate-200/80'
              } shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 text-teal-400 font-black text-xl rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Ticket</span>
                  <span>{entry.ticketNumber}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">{entry.patientName}</h3>
                    <StatusBadge status={entry.status} />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Service: <strong className="text-slate-800">{entry.serviceName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Arrivé à: {new Date(entry.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                {(entry.status === 'WAITING' || entry.status === 'IN_QUEUE') && (
                  <button
                    onClick={() => handleCall(entry.id)}
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    id={`doc-queue-call-${entry.id}`}
                  >
                    <PhoneCall className="w-4 h-4" /> Appeler
                  </button>
                )}

                {(entry.status === 'WAITING' || entry.status === 'CALLED' || entry.status === 'IN_QUEUE' || entry.status === 'IN_CONSULTATION') && (
                  <button
                    onClick={() => handleStartConsultation(entry)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    id={`doc-queue-start-${entry.id}`}
                  >
                    <Stethoscope className="w-4 h-4" /> Ouvrir Consultation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Consultations Section */}
      {completedQueue.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Consultations & Ordonnances Terminées Aujourd hui ({completedQueue.length})
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {completedQueue.map((entry) => (
              <div key={entry.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded-lg">{entry.ticketNumber}</span>
                  <span className="font-bold text-slate-800">{entry.patientName}</span>
                  <span>— {entry.serviceName}</span>
                </div>
                <StatusBadge status={entry.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
