import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerPortal from './pages/Farmer/FarmerPortal';
import BuyerPortal from './pages/Buyer/BuyerPortal';
import OfficerPortal from './pages/Officer/OfficerPortal';
import AdminPortal from './pages/Admin/AdminPortal';
import YieldCalculatorModal from './components/YieldCalculatorModal';
import DiseaseDetectorModal from './components/DiseaseDetectorModal';

export default function App() {
  const { user, isAuthenticated, isFarmer, isBuyer, isOfficer, isAdmin } = useAuth();

  // Navigation page: 'landing', 'login', 'register', 'dashboard'
  const [currentPage, setCurrentPage] = useState('landing');
  // Sidebar active section
  const [activeSection, setActiveSection] = useState('overview');

  // Global AI tools modal states
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setActiveSection('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8] text-slate-800">
      <Navbar
        onOpenYieldModal={() => setShowYieldModal(true)}
        onOpenDiseaseModal={() => setShowDiseaseModal(true)}
        currentTab={currentPage}
        setCurrentTab={handleNavigate}
      />

      {currentPage === 'landing' && (
        <main className="flex-1">
          <LandingPage
            onNavigate={handleNavigate}
            onOpenYieldModal={() => setShowYieldModal(true)}
            onOpenDiseaseModal={() => setShowDiseaseModal(true)}
          />
        </main>
      )}

      {currentPage === 'login' && (
        <main className="flex-1">
          <LoginPage onNavigate={handleNavigate} />
        </main>
      )}

      {currentPage === 'register' && (
        <main className="flex-1">
          <RegisterPage onNavigate={handleNavigate} />
        </main>
      )}

      {currentPage === 'dashboard' && isAuthenticated && (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          <main className="flex-1 p-6 overflow-y-auto max-w-[calc(100%-16rem)]">
            {isFarmer && (
              <FarmerPortal activeSection={activeSection} setActiveSection={setActiveSection} />
            )}
            {isBuyer && (
              <BuyerPortal activeSection={activeSection} setActiveSection={setActiveSection} />
            )}
            {isOfficer && (
              <OfficerPortal activeSection={activeSection} setActiveSection={setActiveSection} />
            )}
            {isAdmin && (
              <AdminPortal activeSection={activeSection} setActiveSection={setActiveSection} />
            )}
          </main>
        </div>
      )}

      {/* Fallback if user tries to open dashboard while unauthenticated */}
      {currentPage === 'dashboard' && !isAuthenticated && (
        <main className="flex-1">
          <LoginPage onNavigate={handleNavigate} />
        </main>
      )}

      {/* Global AI Yield Modal */}
      <YieldCalculatorModal
        isOpen={showYieldModal}
        onClose={() => setShowYieldModal(false)}
      />

      {/* Global AI Crop Disease Diagnostic Modal */}
      <DiseaseDetectorModal
        isOpen={showDiseaseModal}
        onClose={() => setShowDiseaseModal(false)}
      />
    </div>
  );
}
