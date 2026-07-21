import React from 'react';
import { AppointmentStatus, QueueStatus } from '../../types/index.js';

interface StatusBadgeProps {
  status: AppointmentStatus | QueueStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'CONFIRMED':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'CONFIRMÉ' };
      case 'PENDING':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'EN ATTENTE' };
      case 'REJECTED':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'REFUSÉ' };
      case 'RESCHEDULED':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'REPROGRAMMÉ' };
      case 'ARRIVED':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'ARRIVÉ' };
      case 'IN_QUEUE':
      case 'WAITING':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'EN FILE D ATTENTE' };
      case 'CALLED':
        return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200 animate-pulse', label: 'APPELÉ' };
      case 'IN_CONSULTATION':
        return { bg: 'bg-violet-50 text-violet-700 border-violet-200 font-semibold', label: 'EN CONSULTATION' };
      case 'COMPLETED':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'TERMINÉ' };
      case 'CANCELLED':
        return { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: 'ANNULÉ' };
      case 'NO_SHOW':
        return { bg: 'bg-red-50 text-red-600 border-red-200', label: 'ABSENT' };
      default:
        return { bg: 'bg-gray-50 text-gray-700 border-gray-200', label: st };
    }
  };

  const { bg, label } = getBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg}`}
    >
      {label}
    </span>
  );
};
