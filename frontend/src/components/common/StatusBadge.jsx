import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getBadgeStyle = (statusName) => {
    const s = (statusName || '').toLowerCase();
    if (['completed', 'approved', 'active', 'success'].includes(s)) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (['pending', 'in_progress', 'warning', 'in progress'].includes(s)) {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (['rejected', 'failed', 'error', 'breached', 'escalated'].includes(s)) {
      return 'bg-rose-100 text-rose-700 border-rose-200';
    }
    if (['draft', 'inactive'].includes(s)) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(status)} ${className}`}>
      {status ? status.replace(/_/g, ' ') : 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
