import React from 'react';

const STATUS_MAP = {
  // Contracts
  open: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Open Marketplace' },
  assigned: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Assigned' },
  in_progress: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'In Cultivation' },
  completed: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600', label: 'Fulfilled & Settled' },
  cancelled: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Cancelled' },

  // Applications
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Pending Review' },
  accepted: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Accepted' },
  rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Rejected' },

  // Crop Stages
  Sowing: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Sowing Stage' },
  Vegetative: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Vegetative Growth' },
  Flowering: { bg: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500', label: 'Flowering Stage' },
  Maturation: { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-600', label: 'Maturation / Ripening' },
  Harvested: { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500', label: 'Harvested' },

  // Quality Grades
  'Grade A+': { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600', label: 'Grade A+ (Export Premium)' },
  'Grade A': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Grade A (Standard)' },
  'Grade B': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Grade B (Acceptable)' },
  'Rejected': { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Quality Rejected' },

  // Payments
  escrow_held: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Escrow Secured' },
  resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Resolved' },
  active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Active & Verified' },
  blocked: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Suspended' },
};

export default function StatusBadge({ status, customLabel }) {
  const config = STATUS_MAP[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status || 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse-subtle ${config.dot}`} />
      {customLabel || config.label}
    </span>
  );
}
