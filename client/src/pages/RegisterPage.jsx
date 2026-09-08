import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, ArrowRight, AlertCircle, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterPage({ onNavigate }) {
  const { register, loading } = useAuth();
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    state: 'Maharashtra',
    district: 'Chandrapur',
    village: 'Warora',
    // Farmer
    totalAcreage: 8,
    kisanCardNumber: '',
    // Buyer
    companyName: '',
    gstNumber: '',
    businessType: 'Flour Mill & Grain Processing Export',
    // Officer
    badgeId: '',
    designation: 'Agricultural Extension Officer',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role,
      phone: form.phone,
      address: {
        village: form.village,
        district: form.district,
        state: form.state,
      },
      farmerDetails:
        role === 'farmer'
          ? {
              totalAcreage: Number(form.totalAcreage),
              kisanCardNumber: form.kisanCardNumber,
            }
          : undefined,
      buyerDetails:
        role === 'buyer'
          ? {
              companyName: form.companyName || form.name,
              gstNumber: form.gstNumber,
              businessType: form.businessType,
            }
          : undefined,
      officerDetails:
        role === 'officer'
          ? {
              badgeId: form.badgeId,
              designation: form.designation,
              assignedDistrict: form.district,
            }
          : undefined,
    };

    const res = await register(payload);
    if (res.success) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      onNavigate('dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Create AgriFlow Account</h2>
          <p className="text-xs text-slate-500">
            Select your platform role to configure tailored agricultural workflows
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100">
          <button
            type="button"
            onClick={() => setRole('farmer')}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'farmer' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Farmer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'buyer' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Buyer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('officer')}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'officer' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Field Officer</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'buyer' ? 'Contact Person Name' : 'Full Legal Name'}
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Patel"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="email@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          {role === 'farmer' && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Farmer Landholding Profile
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Acreage (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.totalAcreage}
                    onChange={(e) => setForm({ ...form, totalAcreage: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kisan Card / Aadhaar #</label>
                  <input
                    type="text"
                    placeholder="KCC-MAH-XXXXX"
                    value={form.kisanCardNumber}
                    onChange={(e) => setForm({ ...form, kisanCardNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'buyer' && (
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Corporate Agribusiness Credentials
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Entity Name</label>
                  <input
                    type="text"
                    placeholder="e.g. GreenHarvest Agro Ltd."
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="27AABCG1234F1Z8"
                    value={form.gstNumber}
                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'officer' && (
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
                Field Extension Officer Credentials
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Officer Badge ID</label>
                  <input
                    type="text"
                    placeholder="EXT-OFF-XXXX"
                    value={form.badgeId}
                    onChange={(e) => setForm({ ...form, badgeId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating Profile...</span>
            ) : (
              <>
                <span>Complete Registration & Enter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-emerald-700 hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
