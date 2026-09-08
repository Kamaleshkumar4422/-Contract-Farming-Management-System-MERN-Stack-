import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { Sprout, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, quickDemoLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      onNavigate('dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleDemoFill = async (roleKey) => {
    const creds = DEMO_USERS[roleKey];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      const res = await quickDemoLogin(roleKey);
      if (res.success) {
        onNavigate('dashboard');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Sign in to AgriFlow</h2>
          <p className="text-xs text-slate-500">
            Access your role-based contract farming portal
          </p>
        </div>

        {/* 1-Click Demo Fill Selector */}
        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click Role Auto-Login:</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(DEMO_USERS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDemoFill(key)}
                className="px-2.5 py-2 text-left rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-100 text-xs transition-all shadow-2xs"
              >
                <strong className="block text-emerald-950 capitalize text-[11px]">{key}</strong>
                <span className="text-[10px] text-slate-400 block truncate">{item.email}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-emerald-700 hover:underline"
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
}
