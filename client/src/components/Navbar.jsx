import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Sprout,
  Bell,
  User as UserIcon,
  LogOut,
  Sparkles,
  Stethoscope,
  Calculator,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar({
  onOpenDiseaseModal,
  onOpenYieldModal,
  currentTab,
  setCurrentTab,
}) {
  const { user, logout, quickDemoLogin, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = async (roleKey) => {
    await quickDemoLogin(roleKey);
    setShowDemoMenu(false);
    setCurrentTab('overview');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('landing')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center">
                  Agri<span className="text-emerald-600">Flow</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-600 block -mt-1">
                  Contract Farming OS
                </span>
              </div>
            </button>
          </div>

          {/* Quick AI Tools Launchers */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenYieldModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Yield Forecaster</span>
            </button>

            <button
              onClick={onOpenDiseaseModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
              <span>AI Crop Pathology</span>
            </button>
          </div>

          {/* User Controls & Demo Switcher */}
          <div className="flex items-center gap-3">
            {/* 1-Click Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Demo Roles</span>
                <span className="sm:hidden">Switch</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-slide-up">
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Instant 1-Click Role Testing
                  </div>
                  {Object.entries(DEMO_USERS).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => handleRoleSwitch(key)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 ${
                        user?.role === key
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{item.label}</span>
                        {user?.role === key && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 p-3 z-50 animate-slide-up">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Alerts & Updates ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 py-2">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                              n.isRead
                                ? 'bg-slate-50 text-slate-600'
                                : 'bg-emerald-50 text-emerald-950 font-medium border border-emerald-100'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold">{n.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold text-emerald-700">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-slide-up">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl mt-1 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Role Portal</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        setCurrentTab('landing');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl mt-1 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('register')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-fade-in">
          <button
            onClick={() => {
              setCurrentTab('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-bold text-slate-800"
          >
            Home / Marketplace
          </button>
          {isAuthenticated && (
            <button
              onClick={() => {
                setCurrentTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-bold text-emerald-700"
            >
              My Dashboard ({user?.role?.toUpperCase()})
            </button>
          )}
          <button
            onClick={() => {
              onOpenYieldModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-700 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Yield Forecaster</span>
          </button>
          <button
            onClick={() => {
              onOpenDiseaseModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-700 flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4 text-rose-500" />
            <span>AI Pathology Scanner</span>
          </button>
        </div>
      )}
    </header>
  );
}
