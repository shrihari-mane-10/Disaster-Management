import React from 'react';
import { Severity, IncidentStatus } from '../types';

interface StatusBadgeProps {
  status?: IncidentStatus;
  severity?: Severity;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, severity, className = '' }) => {
  if (severity) {
    const config: Record<Severity, { bg: string; text: string; label: string }> = {
      critical: { bg: 'bg-red-100 border-red-300', text: 'text-red-800', label: 'CRITICAL' },
      high: { bg: 'bg-orange-100 border-orange-300', text: 'text-orange-800', label: 'HIGH' },
      medium: { bg: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-800', label: 'MEDIUM' },
      low: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-800', label: 'LOW' },
    };
    const c = config[severity] || config.medium;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${className}`}
      >
        {c.label}
      </span>
    );
  }

  if (status) {
    const config: Record<IncidentStatus, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', label: 'Pending Review' },
      assigned: { bg: 'bg-indigo-100 border-indigo-300', text: 'text-indigo-800', label: 'Assigned' },
      in_progress: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', label: 'In Progress' },
      resolved: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', label: 'Resolved' },
      rejected: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', label: 'Rejected' },
    };
    const c = config[status] || config.pending;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${className}`}
      >
        {c.label}
      </span>
    );
  }

  return null;
};
