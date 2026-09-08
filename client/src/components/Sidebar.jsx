import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  FileSpreadsheet,
  Sprout,
  ClipboardCheck,
  CreditCard,
  AlertCircle,
  PlusCircle,
  Users,
  Building2,
  PieChart,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function Sidebar({ activeSection, setActiveSection }) {
  const { user, isFarmer, isBuyer, isOfficer, isAdmin } = useAuth();

  const getMenuItems = () => {
    if (isFarmer) {
      return [
        { id: 'overview', label: 'Farmer Overview', icon: LayoutDashboard },
        { id: 'farms', label: 'My Registered Farms', icon: MapPin },
        { id: 'browse_contracts', label: 'Contract Marketplace', icon: FileSpreadsheet },
        { id: 'my_contracts', label: 'Active Crops & Stages', icon: Sprout },
        { id: 'inspections', label: 'Officer Field Audits', icon: ClipboardCheck },
        { id: 'payments', label: 'Quality & Passbook', icon: CreditCard },
        { id: 'complaints', label: 'Arbitration / Grievance', icon: AlertCircle },
      ];
    }

    if (isBuyer) {
      return [
        { id: 'overview', label: 'Buyer Dashboard', icon: LayoutDashboard },
        { id: 'create_contract', label: 'Issue New Contract', icon: PlusCircle },
        { id: 'manage_contracts', label: 'Contracts & Applicants', icon: FileSpreadsheet },
        { id: 'monitoring', label: 'Live Crop Telemetry', icon: Sprout },
        { id: 'quality', label: 'Quality Grading Lab', icon: CheckCircle },
        { id: 'payments', label: 'Escrow & Payouts', icon: CreditCard },
        { id: 'analytics', label: 'Procurement Reports', icon: PieChart },
      ];
    }

    if (isOfficer) {
      return [
        { id: 'overview', label: 'Field Extension Hub', icon: LayoutDashboard },
        { id: 'assigned', label: 'Assigned Farms & Plots', icon: MapPin },
        { id: 'conduct', label: 'Conduct Inspection', icon: ClipboardCheck },
        { id: 'history', label: 'Inspection Audit Trail', icon: ShieldCheck },
      ];
    }

    if (isAdmin) {
      return [
        { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
        { id: 'users', label: 'User Directory & KYC', icon: Users },
        { id: 'contracts', label: 'Contract Governance', icon: FileSpreadsheet },
        { id: 'payments', label: 'Platform Escrow & GMV', icon: CreditCard },
        { id: 'complaints', label: 'Dispute Redressal', icon: AlertCircle },
        { id: 'analytics', label: 'Platform Intelligence', icon: PieChart },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* User Badge */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center uppercase shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h4>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block mt-0.5">
                {user?.role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Compliance footer */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center gap-1 font-bold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Legally Protected</span>
        </div>
        <p className="text-[10px] leading-tight text-slate-400">
          Standard Model Farming Agreement compliant with state agriculture acts.
        </p>
      </div>
    </aside>
  );
}
