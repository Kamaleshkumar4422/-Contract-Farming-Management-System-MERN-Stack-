import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  Sprout,
  ShieldCheck,
  CreditCard,
  ClipboardCheck,
  TrendingUp,
  MapPin,
  Stethoscope,
  Calculator,
  QrCode,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Building2,
  FileCheck,
} from 'lucide-react';

export default function LandingPage({ onNavigate, onOpenYieldModal, onOpenDiseaseModal }) {
  const { quickDemoLogin, isAuthenticated, user } = useAuth();
  const [openContracts, setOpenContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const res = await api.get('/contracts?status=open');
        if (res.data.success) {
          setOpenContracts(res.data.contracts.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContracts(false);
      }
    };
    loadContracts();
  }, []);

  const handleRoleQuickLogin = async (roleKey) => {
    await quickDemoLogin(roleKey);
    onNavigate('dashboard');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.88), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MERN-Powered Institutional Contract Farming Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Assured Prices for <span className="text-emerald-400">Farmers</span>. Guaranteed Supply for{' '}
            <span className="text-amber-400">Agribusinesses</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate crop price volatility through legally binding forward contracts, real-time GPS farm mapping,
            objective field extension audits, and automated milestone escrow settlements.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-2"
              >
                <span>Enter Your Dashboard ({user?.role?.toUpperCase()})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all"
                >
                  Sign In to Account
                </button>
              </>
            )}
          </div>

          {/* One-Click Role Testing Switcher Cards */}
          <div className="pt-8 text-left max-w-4xl mx-auto">
            <div className="text-center mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                Instant 1-Click Role Sandbox (No Signup Required)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(DEMO_USERS).map(([roleKey, item]) => (
                <button
                  key={roleKey}
                  onClick={() => handleRoleQuickLogin(roleKey)}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-left transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-emerald-300 uppercase">{roleKey}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{item.label}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM IMPACT METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80">
          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <span className="text-3xl font-black text-slate-900 block">₹4.2 Cr+</span>
            <span className="text-xs font-semibold text-slate-500">Escrow Value Disbursed</span>
          </div>
          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <span className="text-3xl font-black text-emerald-700 block">18,500+</span>
            <span className="text-xs font-semibold text-slate-500">Verified Acres Under Contract</span>
          </div>
          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <span className="text-3xl font-black text-slate-900 block">98.4%</span>
            <span className="text-xs font-semibold text-slate-500">Fulfillment Assurance</span>
          </div>
          <div className="text-center p-3">
            <span className="text-3xl font-black text-amber-600 block">100%</span>
            <span className="text-xs font-semibold text-slate-500">Model Act Compliant</span>
          </div>
        </div>
      </section>

      {/* 3. CONTRACT MARKETPLACE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Exchange</span>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">Active Procurement Contracts</h2>
            <p className="text-xs text-slate-500">
              Explore open buyback tenders from verified institutional agribusinesses.
            </p>
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start"
          >
            <span>View All Marketplace Contracts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {openContracts.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{c.contractCode}</span>
                  <StatusBadge status="open" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">By {c.buyer?.name || 'Verified Buyer'}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Guaranteed Floor Price:</span>
                    <strong className="text-emerald-900 text-sm font-black">₹{c.pricePerUnit} / {c.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Quantity Required:</span>
                    <strong className="text-slate-800 font-bold">{c.targetQuantity} Quintals</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRoleQuickLogin('farmer')}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all text-center"
              >
                Sign In as Farmer & Apply
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. END-TO-END CONTRACT FARMING LIFECYCLE */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">The AgriFlow Standard</span>
            <h2 className="text-3xl font-black">Complete Contract Farming Lifecycle</h2>
            <p className="text-xs text-slate-400">
              From contract agreement to harvest inspection and escrow disbursement, every stage is transparently audited.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Contract Issue', desc: 'Buyer defines crop variety, volume, floor MSP, and grade tolerances.' },
              { step: '02', title: 'Farmer Proposal', desc: 'Farmer allocates verified GPS acreage and signs agreement.' },
              { step: '03', title: 'Mobilization Payout', desc: 'Pre-sowing advance payment deposited to farmer account.' },
              { step: '04', title: 'Extension Audits', desc: 'Agricultural officer verifies tillering, soil moisture & foliage health.' },
              { step: '05', title: 'Quality Grading', desc: 'Delivered grain tested for moisture & purity to issue Grade Certificate.' },
              { step: '06', title: 'Escrow Settlement', desc: 'Remaining contract consideration credited within 48 hours.' },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-black text-emerald-400">{s.step}</span>
                <h4 className="text-sm font-bold text-white">{s.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ADVANCED INTEGRATED AGRONOMIC TOOLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Next-Gen Agronomy</span>
          <h2 className="text-3xl font-black text-slate-900">Advanced Integrated Features</h2>
          <p className="text-xs text-slate-500">
            Empowering participants with AI-powered pathology, yield forecasters, live agro-weather, and QR verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={onOpenYieldModal}
            className="cursor-pointer bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Crop Yield Predictor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculate expected quintals per acre based on soil taxonomy, irrigation system, and seed quality.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Launch Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={onOpenDiseaseModal}
            className="cursor-pointer bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">AI Pathology Scanner</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Identify plant diseases, rusts, and blights instantly with organic biological remedies and spray guidelines.
            </p>
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <span>Run Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">GPS Cadastral Mapping</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pin verified agricultural land coordinates, survey Khata boundaries, and soil moisture telemetry.
            </p>
            <span className="text-xs font-bold text-blue-600">Built-in to Farmer Portal</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Digital QR Passports</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cryptographically signed QR codes for instant verification at field audits, APMC gates, and intake bays.
            </p>
            <span className="text-xs font-bold text-purple-600">Tamper-Proof Verification</span>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white pt-10 pb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="font-black text-slate-900">AgriFlow Management System</span>
          </div>
          <p className="text-xs text-slate-400">
            Full-Stack MERN Agricultural Ecosystem • Designed for Academic & Enterprise Evaluation.
          </p>
        </div>
      </footer>
    </div>
  );
}
