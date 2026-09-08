import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'emerald', trend }) {
  const colorSchemes = {
    emerald: {
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'text-emerald-700 bg-emerald-50',
    },
    amber: {
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'text-amber-700 bg-amber-50',
    },
    blue: {
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'text-blue-700 bg-blue-50',
    },
    purple: {
      border: 'border-purple-100 hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-600',
      badge: 'text-purple-700 bg-purple-50',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.emerald;

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`px-2 py-0.5 rounded-md font-bold ${scheme.badge}`}>
              {trend}
            </span>
          )}
          <span className="text-slate-500">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
