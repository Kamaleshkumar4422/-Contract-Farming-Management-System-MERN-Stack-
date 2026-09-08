import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import DigitalContractModal from '../../components/DigitalContractModal';
import ContractQRModal from '../../components/ContractQRModal';
import Modal from '../../components/Modal';
import {
  FileSpreadsheet,
  PlusCircle,
  Users,
  Sprout,
  CheckCircle,
  CreditCard,
  PieChart,
  Check,
  X,
  FileText,
  QrCode,
  Sparkles,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import confetti from 'canvas-confetti';

export default function BuyerPortal({ activeSection, setActiveSection }) {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [contracts, setContracts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedContractApps, setSelectedContractApps] = useState([]);
  const [activeContractForApps, setActiveContractForApps] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedContractForDoc, setSelectedContractForDoc] = useState(null);
  const [selectedContractForQR, setSelectedContractForQR] = useState(null);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedCropForQuality, setSelectedCropForQuality] = useState(null);

  // New Contract Form
  const [contractForm, setContractForm] = useState({
    title: '',
    cropName: 'Basmati Rice',
    variety: 'Pusa Basmati 1121',
    targetQuantity: 100,
    minimumLandRequired: 5,
    pricePerUnit: 4200,
    unit: 'Quintal',
    sowingDate: '2025-06-15',
    expectedHarvestDate: '2025-10-25',
    deliveryLocation: 'GreenHarvest Processing Hub, Pune Food Park',
    advancePaymentPercentage: 20,
    minimumGrade: 'Grade A',
    maxMoisturePercentage: 12,
    allowedDefectsPercentage: 2,
    customSpecifications: 'Clean, mature, free from mould or live weevils.',
    termsAndConditions: '1. Assured purchase at fixed price. 2. Timely field inspections mandatory. 3. Payouts processed within 48 hours of quality sign-off.',
  });

  // Quality grading form
  const [qualityForm, setQualityForm] = useState({
    suppliedQuantityInQuintals: 150,
    moistureLevelPercentage: 11.4,
    foreignMatterPercentage: 0.5,
    grainSizeUniformityPercentage: 95,
    qualityGrade: 'Grade A+',
    qualityScore: 94,
    status: 'Approved',
    remarks: 'Grain length and moisture well within export quality norms.',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractsRes, cropsRes, paymentsRes] = await Promise.all([
        api.get(`/contracts?buyerId=${user?._id || ''}`),
        api.get('/crops'),
        api.get('/payments/buyer-payments'),
      ]);

      if (contractsRes.data.success) {
        setContracts(contractsRes.data.contracts);
        if (contractsRes.data.contracts.length > 0 && !activeContractForApps) {
          fetchApplications(contractsRes.data.contracts[0]);
        }
      }
      if (cropsRes.data.success) setCrops(cropsRes.data.crops);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.payments);
    } catch (err) {
      console.error('Buyer data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchApplications = async (contract) => {
    setActiveContractForApps(contract);
    try {
      const res = await api.get(`/contracts/${contract._id}/applications`);
      if (res.data.success) {
        setSelectedContractApps(res.data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...contractForm,
        qualityStandards: {
          minimumGrade: contractForm.minimumGrade,
          maxMoisturePercentage: contractForm.maxMoisturePercentage,
          allowedDefectsPercentage: contractForm.allowedDefectsPercentage,
          customSpecifications: contractForm.customSpecifications,
        },
      };

      const res = await api.post('/contracts', payload);
      if (res.data.success) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        showToast('Farming Contract issued to platform marketplace! 📜');
        fetchData();
        setActiveSection('manage_contracts');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to issue contract', 'error');
    }
  };

  const handleReviewApplication = async (appId, status) => {
    try {
      const res = await api.put(`/contracts/applications/${appId}/status`, {
        status,
        reviewRemarks: status === 'accepted' ? 'Contract signed and approved.' : 'Capacity limit reached.',
      });
      if (res.data.success) {
        if (status === 'accepted') {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          showToast('Farmer accepted! Contract is now in cultivation stage 🎉');
        } else {
          showToast('Application marked as rejected.');
        }
        fetchData();
        if (activeContractForApps) fetchApplications(activeContractForApps);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update application', 'error');
    }
  };

  const handleSubmitQualityCheck = async (e) => {
    e.preventDefault();
    if (!selectedCropForQuality) return;
    try {
      const res = await api.post('/quality', {
        contractId: selectedCropForQuality.contract._id,
        cropId: selectedCropForQuality._id,
        ...qualityForm,
      });

      if (res.data.success) {
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
        showToast('Quality Certificate issued! Payout escrow allocated 🏅');
        setShowQualityModal(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit quality check', 'error');
    }
  };

  const handleReleaseEscrow = async (paymentId) => {
    try {
      const res = await api.put(`/payments/${paymentId}/release`);
      if (res.data.success) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        showToast('Escrow funds released directly to farmer account! 💰');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to release escrow', 'error');
    }
  };

  const totalCommittedValue = contracts.reduce((sum, c) => sum + (c.totalEstimatedValue || 0), 0);
  const totalVolumeQuintals = contracts.reduce((sum, c) => sum + (c.targetQuantity || 0), 0);
  const activeContractsCount = contracts.filter((c) => c.status === 'in_progress').length;

  const chartData = contracts.map((c) => ({
    name: c.cropName,
    committed: (c.totalEstimatedValue || 0) / 1000,
    volume: c.targetQuantity,
  }));

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Procurement Control Center • {user?.buyerDetails?.companyName || user?.name}
              </span>
              <h2 className="text-2xl font-black mt-1">Corporate Agronomy Hub 🏢</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Manage raw produce procurement quotas, binding farmer buyback contracts, field extension tracking, and automated escrow settlements.
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Committed Capital"
              value={`₹${totalCommittedValue.toLocaleString()}`}
              subtitle="Secured Buyback Volume"
              icon={CreditCard}
              color="emerald"
            />
            <MetricCard
              title="Procurement Quota"
              value={`${totalVolumeQuintals} Q`}
              subtitle="Aggregated Contract Tons"
              icon={FileSpreadsheet}
              color="blue"
            />
            <MetricCard
              title="Active In-Cultivation"
              value={activeContractsCount}
              subtitle="Live Monitored Fields"
              icon={Sprout}
              color="amber"
            />
            <MetricCard
              title="Escrow Account Reserve"
              value={`₹${(user?.buyerDetails?.escrowBalance || 1250000).toLocaleString()}`}
              subtitle="Guaranteed Bank Escrow"
              icon={Building2}
              color="purple"
            />
          </div>

          {/* Quick Issue CTA */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Need to contract new seasonal crops?</h3>
              <p className="text-xs text-slate-500">
                Issue forward contracts with certified quality parameters to invite qualified farmers.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('create_contract')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch Contract Studio</span>
            </button>
          </div>

          {/* Procurement Distribution Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Procurement Capital Allocation by Commodity (₹ in Thousands)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="committed" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ISSUE NEW CONTRACT */}
      {activeSection === 'create_contract' && (
        <div className="max-w-3xl bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Contract Studio</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">Issue Institutional Farming Buyback Contract</h3>
            <p className="text-xs text-slate-500">
              Define target tonnage, floor pricing, certified grade standards, and mobilization terms.
            </p>
          </div>

          <form onSubmit={handleCreateContract} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contract Title</label>
              <input
                type="text"
                placeholder="e.g. Certified Extra Long Grain Basmati Rice - 150 Quintals Export Batch"
                value={contractForm.title}
                onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name</label>
                <select
                  value={contractForm.cropName}
                  onChange={(e) => setContractForm({ ...contractForm, cropName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Basmati Rice">Basmati Rice</option>
                  <option value="Wheat">Wheat (Sharbati / Durum)</option>
                  <option value="Cotton">Cotton (Bt Long Staple)</option>
                  <option value="Soybean">Soybean (Non-GMO)</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Tomato">Tomato (Processing Grade)</option>
                  <option value="Potato">Potato (Chip Processing)</option>
                  <option value="Turmeric">Turmeric (High Curcumin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seed Variety / Specification</label>
                <input
                  type="text"
                  placeholder="e.g. Pusa Basmati 1121 Extra Long"
                  value={contractForm.variety}
                  onChange={(e) => setContractForm({ ...contractForm, variety: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Volume (Quintals)</label>
                <input
                  type="number"
                  value={contractForm.targetQuantity}
                  onChange={(e) => setContractForm({ ...contractForm, targetQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Farm Area (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={contractForm.minimumLandRequired}
                  onChange={(e) => setContractForm({ ...contractForm, minimumLandRequired: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Price (₹/Quintal)</label>
                <input
                  type="number"
                  value={contractForm.pricePerUnit}
                  onChange={(e) => setContractForm({ ...contractForm, pricePerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Sowing Date</label>
                <input
                  type="date"
                  value={contractForm.sowingDate}
                  onChange={(e) => setContractForm({ ...contractForm, sowingDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Harvest Delivery Date</label>
                <input
                  type="date"
                  value={contractForm.expectedHarvestDate}
                  onChange={(e) => setContractForm({ ...contractForm, expectedHarvestDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery / Intake Warehouse Location</label>
              <input
                type="text"
                value={contractForm.deliveryLocation}
                onChange={(e) => setContractForm({ ...contractForm, deliveryLocation: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Quality Norms */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Quality Norms & Permissible Tolerances
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Acceptance Grade</label>
                  <select
                    value={contractForm.minimumGrade}
                    onChange={(e) => setContractForm({ ...contractForm, minimumGrade: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Grade A+">Grade A+ (Export Premium)</option>
                    <option value="Grade A">Grade A (Standard)</option>
                    <option value="Grade B">Grade B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Max Moisture %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={contractForm.maxMoisturePercentage}
                    onChange={(e) => setContractForm({ ...contractForm, maxMoisturePercentage: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Allowed Defects %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={contractForm.allowedDefectsPercentage}
                    onChange={(e) => setContractForm({ ...contractForm, allowedDefectsPercentage: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-slate-700 flex justify-between items-center">
              <span>Estimated Platform Gross Value:</span>
              <strong className="text-base font-black text-emerald-950">
                ₹{(contractForm.targetQuantity * contractForm.pricePerUnit).toLocaleString()}
              </strong>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all"
            >
              Sign & Publish Farming Contract
            </button>
          </form>
        </div>
      )}

      {/* 3. MANAGE CONTRACTS & APPLICANTS */}
      {activeSection === 'manage_contracts' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">Contracts Portfolio & Farmer Proposals</h3>
            <p className="text-xs text-slate-500">
              Select a contract to review applicants and allocate land parcels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contracts.map((c) => (
              <div
                key={c._id}
                onClick={() => fetchApplications(c)}
                className={`cursor-pointer bg-white rounded-3xl p-5 border transition-all space-y-3 ${
                  activeContractForApps?._id === c._id
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{c.contractCode}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2">{c.title}</h4>
                <div className="text-xs text-slate-600 flex justify-between">
                  <span>Quota: {c.targetQuantity} Q</span>
                  <strong className="text-emerald-800">₹{c.pricePerUnit}/Q</strong>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>View Applicants</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Applicants Panel */}
          {activeContractForApps && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant Review Desk</span>
                  <h4 className="text-lg font-black text-slate-900">{activeContractForApps.title}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedContractForDoc(activeContractForApps)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Agreement</span>
                  </button>
                  <button
                    onClick={() => setSelectedContractForQR(activeContractForApps)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Passport</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {selectedContractApps.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    No farmer proposals submitted for this contract yet.
                  </p>
                ) : (
                  selectedContractApps.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-900">{app.farmer?.name}</h5>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="text-xs text-slate-500">
                          Allocated Farm: <strong className="text-slate-800">{app.farm?.farmName}</strong> ({app.farm?.areaInAcres} Acres - {app.farm?.soilType})
                        </p>
                        <p className="text-xs text-slate-600 italic">
                          "{app.proposalNote || 'Committed to complete contract fulfillment.'}"
                        </p>
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleReviewApplication(app._id, 'rejected')}
                            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleReviewApplication(app._id, 'accepted')}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept & Sign</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CROP TELEMETRY */}
      {activeSection === 'monitoring' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">Contract Crop Telemetry & Growth Audit</h3>
          <div className="space-y-4">
            {crops.map((crop) => (
              <div
                key={crop._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400">{crop.contract?.contractCode}</span>
                    <h4 className="text-base font-black text-slate-900">{crop.cropName} ({crop.variety})</h4>
                    <span className="text-xs text-slate-500">Contractor: {crop.farmer?.name}</span>
                  </div>
                  <StatusBadge status={crop.stage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Growth Velocity: {crop.growthPercentage}%</span>
                    <span>Crop Health: <strong className="text-emerald-700">{crop.healthStatus}</strong></span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                      style={{ width: `${crop.growthPercentage}%` }}
                    />
                  </div>
                </div>

                {crop.stageHistory && crop.stageHistory.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-600">
                    <strong className="block text-slate-800 text-[10px] uppercase">Latest Telemetry Note:</strong>
                    {crop.stageHistory[crop.stageHistory.length - 1].notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. QUALITY GRADING LAB */}
      {activeSection === 'quality' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Quality Assessment & Harvest Certification</h3>
              <p className="text-xs text-slate-500">
                Inspect delivered crop consignments, assign quality grades, and trigger automated milestone escrow payouts.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {crops.map((crop) => (
              <div
                key={crop._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{crop.contract?.contractCode}</span>
                    <StatusBadge status={crop.stage} />
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    {crop.cropName} ({crop.variety}) • {crop.contract?.targetQuantity} Quintals
                  </h4>
                  <p className="text-xs text-slate-500">
                    Cultivated by {crop.farmer?.name} • Farm: {crop.farm?.farmName}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCropForQuality(crop);
                      setShowQualityModal(true);
                    }}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Conduct Quality Sign-Off</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ESCROW & PAYMENTS */}
      {activeSection === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Escrow Allocations & Payout Desk</h3>
              <p className="text-xs text-slate-500">
                Manage mobilization advances and release harvest escrow allocations to farmers.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Txn ID</th>
                  <th className="px-5 py-3">Milestone</th>
                  <th className="px-5 py-3">Farmer</th>
                  <th className="px-5 py-3">Gross</th>
                  <th className="px-5 py-3">Net Payout</th>
                  <th className="px-5 py-3">Escrow Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{p.transactionId}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{p.milestoneType}</td>
                    <td className="px-5 py-3.5 text-slate-700">{p.farmer?.name || 'Farmer Partner'}</td>
                    <td className="px-5 py-3.5 text-slate-500">₹{p.grossAmount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-black text-emerald-700 text-sm">₹{p.netAmount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.status === 'escrow_held' ? (
                        <button
                          onClick={() => handleReleaseEscrow(p._id)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Release Funds
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium">Disbursed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. REPORTS & ANALYTICS */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">Procurement Intelligence & Compliance Reports</h3>
            <p className="text-xs text-slate-500">
              Aggregated procurement fulfillment rates, acreage distributions, and capital commitments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Quota</span>
              <span className="text-2xl font-black text-slate-900">{totalVolumeQuintals} Quintals</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <span className="text-xs text-slate-500 block">Fulfillment Rate</span>
              <span className="text-2xl font-black text-emerald-700">96.8%</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <span className="text-xs text-slate-500 block">Average Quality Score</span>
              <span className="text-2xl font-black text-emerald-700">94.2 / 100</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Quality Grading Sign-Off */}
      <Modal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        title="🏅 Conduct Harvest Quality Verification & Escrow Allocation"
      >
        <form onSubmit={handleSubmitQualityCheck} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivered Quantity (Quintals)</label>
              <input
                type="number"
                value={qualityForm.suppliedQuantityInQuintals}
                onChange={(e) => setQualityForm({ ...qualityForm, suppliedQuantityInQuintals: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Moisture Level (%)</label>
              <input
                type="number"
                step="0.1"
                value={qualityForm.moistureLevelPercentage}
                onChange={(e) => setQualityForm({ ...qualityForm, moistureLevelPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade Awarded</label>
              <select
                value={qualityForm.qualityGrade}
                onChange={(e) => setQualityForm({ ...qualityForm, qualityGrade: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Grade A+">Grade A+ (Export Premium)</option>
                <option value="Grade A">Grade A (Standard Contract Benchmark)</option>
                <option value="Grade B">Grade B (Acceptable with slight discount)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quality Score (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={qualityForm.qualityScore}
                onChange={(e) => setQualityForm({ ...qualityForm, qualityScore: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Inspector Remarks & Lab Findings</label>
            <textarea
              rows={2}
              value={qualityForm.remarks}
              onChange={(e) => setQualityForm({ ...qualityForm, remarks: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
          >
            Issue Quality Certificate & Lock Escrow
          </button>
        </form>
      </Modal>

      {/* Contract Legal Document */}
      <DigitalContractModal
        isOpen={!!selectedContractForDoc}
        onClose={() => setSelectedContractForDoc(null)}
        contract={selectedContractForDoc}
      />

      {/* QR Passport */}
      <ContractQRModal
        isOpen={!!selectedContractForQR}
        onClose={() => setSelectedContractForQR(null)}
        contract={selectedContractForQR}
      />
    </div>
  );
}
