import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import WeatherWidget from '../../components/WeatherWidget';
import FarmMapModal from '../../components/FarmMapModal';
import ContractQRModal from '../../components/ContractQRModal';
import DigitalContractModal from '../../components/DigitalContractModal';
import Modal from '../../components/Modal';
import {
  MapPin,
  FileSpreadsheet,
  Sprout,
  ClipboardCheck,
  CreditCard,
  AlertCircle,
  Plus,
  QrCode,
  FileText,
  CheckCircle2,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FarmerPortal({ activeSection, setActiveSection }) {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [farms, setFarms] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [selectedFarmForMap, setSelectedFarmForMap] = useState(null);
  const [selectedContractForApply, setSelectedContractForApply] = useState(null);
  const [selectedContractForQR, setSelectedContractForQR] = useState(null);
  const [selectedContractForDoc, setSelectedContractForDoc] = useState(null);
  const [selectedCropForUpdate, setSelectedCropForUpdate] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Form states
  const [newFarm, setNewFarm] = useState({
    farmName: '',
    surveyNumber: '',
    areaInAcres: 5,
    soilType: 'Black Soil',
    irrigationSource: 'Drip System',
    waterAvailability: 'Year-Round',
    village: 'Warora',
    district: 'Chandrapur',
    state: 'Maharashtra',
    organicCertified: false,
    latitude: 20.2312,
    longitude: 79.0028,
  });

  const [applyForm, setApplyForm] = useState({
    farmId: '',
    proposedQuantity: '',
    proposalNote: '',
  });

  const [cropUpdateForm, setCropUpdateForm] = useState({
    stage: 'Vegetative',
    growthPercentage: 60,
    healthStatus: 'Good',
    notes: '',
  });

  const [complaintForm, setComplaintForm] = useState({
    category: 'Payment Dispute',
    subject: '',
    description: '',
    priority: 'Medium',
  });

  const [marketFilter, setMarketFilter] = useState('');

  // Fetch all Farmer data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [farmsRes, contractsRes, cropsRes, paymentsRes, complaintsRes] = await Promise.all([
        api.get('/farms/my-farms'),
        api.get('/contracts'),
        api.get('/crops/my-crops'),
        api.get('/payments/my-payments'),
        api.get('/complaints/my-complaints'),
      ]);

      if (farmsRes.data.success) setFarms(farmsRes.data.farms);
      if (contractsRes.data.success) setContracts(contractsRes.data.contracts);
      if (cropsRes.data.success) {
        setCrops(cropsRes.data.crops);
        // If there's an active crop, fetch its inspections
        if (cropsRes.data.crops.length > 0 && cropsRes.data.crops[0].contract) {
          const inspRes = await api.get(`/inspections/contract/${cropsRes.data.crops[0].contract._id}`);
          if (inspRes.data.success) setInspections(inspRes.data.inspections);
        }
      }
      if (paymentsRes.data.success) setPayments(paymentsRes.data.payments);
      if (complaintsRes.data.success) setComplaints(complaintsRes.data.complaints);
    } catch (err) {
      console.error('Farmer data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Actions
  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/farms', {
        ...newFarm,
        location: {
          village: newFarm.village,
          district: newFarm.district,
          state: newFarm.state,
          latitude: newFarm.latitude,
          longitude: newFarm.longitude,
        },
      });
      if (res.data.success) {
        showToast('Farm registered successfully! 🌾');
        setShowAddFarmModal(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register farm', 'error');
    }
  };

  const handleApplyContract = async (e) => {
    e.preventDefault();
    if (!selectedContractForApply) return;
    try {
      const res = await api.post(`/contracts/${selectedContractForApply._id}/apply`, applyForm);
      if (res.data.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        showToast('Application submitted to buyer for review!');
        setSelectedContractForApply(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application', 'error');
    }
  };

  const handleUpdateCrop = async (e) => {
    e.preventDefault();
    if (!selectedCropForUpdate) return;
    try {
      const res = await api.put(`/crops/${selectedCropForUpdate._id}/stage`, cropUpdateForm);
      if (res.data.success) {
        showToast('Crop progress updated successfully!');
        setSelectedCropForUpdate(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update crop', 'error');
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/complaints', complaintForm);
      if (res.data.success) {
        showToast('Dispute ticket lodged with admin desk.');
        setShowComplaintModal(false);
        setComplaintForm({ category: 'Payment Dispute', subject: '', description: '', priority: 'Medium' });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to raise complaint', 'error');
    }
  };

  const totalAcreage = farms.reduce((acc, f) => acc + (f.areaInAcres || 0), 0);
  const totalEarnings = payments
    .filter((p) => p.status === 'completed')
    .reduce((acc, p) => acc + (p.netAmount || 0), 0);
  const activeContractsCount = crops.length;

  const filteredContracts = contracts.filter(
    (c) =>
      c.status === 'open' &&
      (c.cropName.toLowerCase().includes(marketFilter.toLowerCase()) ||
        c.title.toLowerCase().includes(marketFilter.toLowerCase()) ||
        c.deliveryLocation.toLowerCase().includes(marketFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW SECTION */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                Kisan Seva Kendra • Warora District
              </span>
              <h2 className="text-2xl font-black mt-1">Namaste, {user?.name}! 🙏</h2>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                Your farm contracts, crop growth stages, and MSP-guaranteed buyback settlements are active.
                Farming Performance Score: <strong className="text-amber-300">94/100 (Tier 1 Certified)</strong>.
              </p>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Registered Acreage"
              value={`${totalAcreage} Acres`}
              subtitle={`${farms.length} Verified Plots`}
              icon={MapPin}
              color="emerald"
            />
            <MetricCard
              title="Active Contracts"
              value={activeContractsCount}
              subtitle="Cultivation In-Progress"
              icon={Sprout}
              color="amber"
            />
            <MetricCard
              title="Total Disbursed"
              value={`₹${totalEarnings.toLocaleString()}`}
              subtitle="Direct to Bank Account"
              icon={CreditCard}
              color="blue"
            />
            <MetricCard
              title="Open Grievances"
              value={complaints.filter((c) => c.status !== 'resolved').length}
              subtitle="Platform Arbitration"
              icon={AlertCircle}
              color="purple"
            />
          </div>

          {/* Weather Widget */}
          <WeatherWidget state="Maharashtra" district="Chandrapur" />

          {/* Active Crop Spotlight */}
          {crops.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Current Season Priority Crop
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {crops[0].cropName} ({crops[0].variety || 'Certified High-Yield'})
                  </h3>
                </div>
                <StatusBadge status={crops[0].stage} />
              </div>

              {/* Growth Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Growth Velocity: {crops[0].growthPercentage}% Completed</span>
                  <span>Health: <strong className="text-emerald-700">{crops[0].healthStatus}</strong></span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${crops[0].growthPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  Allocated Plot: <strong className="text-slate-800">{crops[0].farm?.farmName || 'Primary Plot'}</strong>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCropForUpdate(crops[0]);
                      setCropUpdateForm({
                        stage: crops[0].stage,
                        growthPercentage: crops[0].growthPercentage,
                        healthStatus: crops[0].healthStatus,
                        notes: '',
                      });
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Update Growth Stage
                  </button>
                  {crops[0].contract && (
                    <button
                      onClick={() => setSelectedContractForDoc(crops[0].contract)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Legal Agreement</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MY REGISTERED FARMS */}
      {activeSection === 'farms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-900">Registered Agricultural Lands</h3>
              <p className="text-xs text-slate-500">
                Land parcels verified with GIS coordinates, soil taxonomy, and irrigation profiles.
              </p>
            </div>
            <button
              onClick={() => setShowAddFarmModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Farm</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farms.map((farm) => (
              <div
                key={farm._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Survey: {farm.surveyNumber}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">{farm.farmName}</h4>
                    <p className="text-xs text-slate-500">
                      {farm.location.village}, {farm.location.district}, {farm.location.state}
                    </p>
                  </div>
                  <span className="text-lg font-black text-slate-900">{farm.areaInAcres} Acres</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Soil Quality</span>
                    <span className="font-bold text-slate-800">{farm.soilType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Irrigation Method</span>
                    <span className="font-bold text-slate-800">{farm.irrigationSource}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Water Availability</span>
                    <span className="font-bold text-slate-800">{farm.waterAvailability}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Organic Status</span>
                    <span className="font-bold text-emerald-700">
                      {farm.organicCertified ? 'Certified Organic' : 'Standard GAP'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFarmForMap(farm)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Inspect GPS Cadastral Map</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BROWSE CONTRACTS MARKETPLACE */}
      {activeSection === 'browse_contracts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-900">Institutional Procurement Marketplace</h3>
              <p className="text-xs text-slate-500">
                Browse pre-season binding buyback contracts offered by verified food processors and exporters.
              </p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search crop, buyer, location..."
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContracts.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.contractCode}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">{c.title}</h4>
                    <p className="text-xs text-emerald-800 font-bold mt-0.5">
                      By {c.buyer?.name || 'Authorized Buyer'}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Offered Price:</span>
                      <strong className="text-emerald-900 text-sm font-black">₹{c.pricePerUnit} / {c.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Volume Required:</span>
                      <strong className="text-slate-800 font-bold">{c.targetQuantity} Quintals</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Min Land Area:</span>
                      <strong className="text-slate-800 font-bold">{c.minimumLandRequired} Acres</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Quality Benchmark:</span>
                      <strong className="text-slate-800 font-bold">{c.qualityStandards?.minimumGrade} (Moisture &lt; {c.qualityStandards?.maxMoisturePercentage}%)</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedContractForApply(c);
                      setApplyForm({
                        farmId: farms[0]?._id || '',
                        proposedQuantity: c.targetQuantity,
                        proposalNote: '',
                      });
                    }}
                    className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Apply for Contract
                  </button>
                  <button
                    onClick={() => setSelectedContractForDoc(c)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                    title="View Full Terms"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ACTIVE CROPS & STAGES */}
      {activeSection === 'my_contracts' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">Active Crop Cycles & Growth Milestone Tracking</h3>
          <div className="space-y-4">
            {crops.map((crop) => (
              <div
                key={crop._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">{crop.contract?.contractCode}</span>
                      <StatusBadge status={crop.stage} />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mt-1">
                      {crop.cropName} - {crop.variety}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Planted on {crop.farm?.farmName || 'Primary Farm'} • {crop.acreageAllocated} Acres Allocated
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCropForUpdate(crop);
                        setCropUpdateForm({
                          stage: crop.stage,
                          growthPercentage: crop.growthPercentage,
                          healthStatus: crop.healthStatus,
                          notes: '',
                        });
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Update Growth Progress
                    </button>
                    {crop.contract && (
                      <button
                        onClick={() => setSelectedContractForQR(crop.contract)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                        title="View Verification QR Passport"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Growth Stage Stepper */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Crop Development Milestones</span>
                    <span className="text-emerald-700">{crop.growthPercentage}% Growth Velocity</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                      style={{ width: `${crop.growthPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-5 text-center mt-3 text-[11px] font-semibold text-slate-500">
                    <span className={crop.growthPercentage >= 15 ? 'text-emerald-800 font-bold' : ''}>Sowing</span>
                    <span className={crop.growthPercentage >= 35 ? 'text-emerald-800 font-bold' : ''}>Vegetative</span>
                    <span className={crop.growthPercentage >= 65 ? 'text-emerald-800 font-bold' : ''}>Flowering</span>
                    <span className={crop.growthPercentage >= 85 ? 'text-emerald-800 font-bold' : ''}>Maturation</span>
                    <span className={crop.growthPercentage >= 100 ? 'text-emerald-800 font-bold' : ''}>Harvested</span>
                  </div>
                </div>

                {/* Stage history logs */}
                {crop.stageHistory && crop.stageHistory.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
                    <span className="font-extrabold text-slate-800 block uppercase tracking-wider text-[10px]">
                      Recent Growth Log Entries:
                    </span>
                    {crop.stageHistory.slice(-2).map((log, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>{log.stage} ({new Date(log.updatedDate).toLocaleDateString()}):</strong> {log.notes}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. OFFICER FIELD AUDITS */}
      {activeSection === 'inspections' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">Agronomic Extension Inspection Reports</h3>
          <p className="text-xs text-slate-500">
            Certified field audits conducted by Agricultural Officers evaluating soil moisture, canopy foliage, and pest vigilance.
          </p>

          <div className="space-y-4">
            {inspections.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
                No inspection reports filed yet. Field officer visit scheduled for next tillering cycle.
              </div>
            ) : (
              inspections.map((insp) => (
                <div
                  key={insp._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Inspected on {new Date(insp.inspectionDate).toLocaleDateString()}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">
                        Auditor: {insp.officer?.name || 'Extension Officer'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Officer Designation: {insp.officer?.officerDetails?.designation || 'Agricultural Extension Officer'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Health Audit Score</span>
                      <span className="text-xl font-black text-emerald-700">{insp.overallScore}/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Crop Condition</span>
                      <strong className="text-slate-800">{insp.cropCondition}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pest / Disease</span>
                      <strong className={insp.pestOrDiseaseDetected ? 'text-rose-600' : 'text-emerald-700'}>
                        {insp.pestOrDiseaseDetected ? 'Risk Detected' : 'Nil Observed'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Soil Moisture</span>
                      <strong className="text-slate-800">{insp.soilMoistureCondition}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Irrigation Lines</span>
                      <strong className="text-slate-800">{insp.irrigationStatus}</strong>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-950 block">Officer Remarks:</span>
                    <p className="text-slate-700">{insp.remarks}</p>
                    {insp.recommendedActions && (
                      <p className="text-emerald-900 pt-1 font-semibold">
                        Action Recommended: {insp.recommendedActions}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. QUALITY & PASSBOOK */}
      {activeSection === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Farmer Financial Passbook</h3>
              <p className="text-xs text-slate-500">
                Transparent ledger of contract mobilization advances, harvest releases, and quality grade receipts.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Lifetime Earnings</span>
              <span className="text-2xl font-black text-emerald-700">₹{totalEarnings.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Transaction Ref</th>
                    <th className="px-5 py-3">Milestone Type</th>
                    <th className="px-5 py-3">Contract / Crop</th>
                    <th className="px-5 py-3">Gross</th>
                    <th className="px-5 py-3">Net Disbursed</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{p.transactionId}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{p.milestoneType}</td>
                      <td className="px-5 py-3.5 text-slate-600">{p.contract?.cropName || 'Contract Crop'}</td>
                      <td className="px-5 py-3.5 text-slate-500">₹{p.grossAmount?.toLocaleString()}</td>
                      <td className="px-5 py-3.5 font-black text-emerald-700 text-sm">₹{p.netAmount?.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. ARBITRATION / GRIEVANCES */}
      {activeSection === 'complaints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Dispute & Grievance Arbitration</h3>
              <p className="text-xs text-slate-500">
                Lodge formal arbitration tickets regarding payment terms, harvest pickup delays, or quality disagreements.
              </p>
            </div>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Raise New Grievance</span>
            </button>
          </div>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
                No active complaints filed. All contract farming operations running smoothly.
              </div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{c.complaintNumber}</span>
                        <span className="text-[10px] font-extrabold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md">
                          {c.category}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">{c.subject}</h4>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    {c.description}
                  </p>

                  {c.adminResponse && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-950">
                      <strong className="block text-emerald-800 mb-0.5">Admin Determination / Resolution:</strong>
                      {c.adminResponse}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: Register New Farm */}
      <Modal
        isOpen={showAddFarmModal}
        onClose={() => setShowAddFarmModal(false)}
        title="🌾 Register Farm Land Parcel"
      >
        <form onSubmit={handleCreateFarm} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Farm / Plot Name</label>
              <input
                type="text"
                placeholder="e.g. Krishna Valley North Plot"
                value={newFarm.farmName}
                onChange={(e) => setNewFarm({ ...newFarm, farmName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Survey / Khata Number</label>
              <input
                type="text"
                placeholder="e.g. KHATA-892/C"
                value={newFarm.surveyNumber}
                onChange={(e) => setNewFarm({ ...newFarm, surveyNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Land Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={newFarm.areaInAcres}
                onChange={(e) => setNewFarm({ ...newFarm, areaInAcres: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Soil Taxonomy</label>
              <select
                value={newFarm.soilType}
                onChange={(e) => setNewFarm({ ...newFarm, soilType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Black Soil">Black Soil (Regur)</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
                <option value="Clayey Loam">Clayey Loam</option>
                <option value="Red & Yellow">Red & Yellow</option>
                <option value="Laterite">Laterite</option>
                <option value="Sandy Loam">Sandy Loam</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Irrigation System</label>
              <select
                value={newFarm.irrigationSource}
                onChange={(e) => setNewFarm({ ...newFarm, irrigationSource: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Drip System">Drip Irrigation System</option>
                <option value="Canal Irrigation">Canal Irrigation</option>
                <option value="Borewell">Borewell with Solar Pump</option>
                <option value="Sprinkler System">Sprinkler System</option>
                <option value="Rainfed / Natural">Rainfed / Monsoon Natural</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Village & District</label>
              <input
                type="text"
                value={`${newFarm.village}, ${newFarm.district}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setNewFarm({
                    ...newFarm,
                    village: parts[0]?.trim() || '',
                    district: parts[1]?.trim() || 'Chandrapur',
                  });
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="organic"
              checked={newFarm.organicCertified}
              onChange={(e) => setNewFarm({ ...newFarm, organicCertified: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="organic" className="text-xs font-semibold text-slate-700">
              Hold valid Organic Farming certification (NPOP compliant)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
          >
            Submit Land Registration
          </button>
        </form>
      </Modal>

      {/* MODAL: Apply for Contract */}
      <Modal
        isOpen={!!selectedContractForApply}
        onClose={() => setSelectedContractForApply(null)}
        title="📝 Apply for Farming Buyback Contract"
      >
        {selectedContractForApply && (
          <form onSubmit={handleApplyContract} className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-950 block">{selectedContractForApply.title}</span>
              <p className="text-slate-600 mt-0.5">
                Crop: {selectedContractForApply.cropName} • Offered Rate: <strong>₹{selectedContractForApply.pricePerUnit} / {selectedContractForApply.unit}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Allocate Farm Plot</label>
              <select
                value={applyForm.farmId}
                onChange={(e) => setApplyForm({ ...applyForm, farmId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              >
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.farmName} ({f.areaInAcres} Acres - {f.soilType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Supply Quantity (Quintals)</label>
              <input
                type="number"
                value={applyForm.proposedQuantity}
                onChange={(e) => setApplyForm({ ...applyForm, proposedQuantity: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agronomic Commitment Note</label>
              <textarea
                rows={2}
                placeholder="Commitment regarding sowing date, organic bio-fertilizer usage, and expected yield..."
                value={applyForm.proposalNote}
                onChange={(e) => setApplyForm({ ...applyForm, proposalNote: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
            >
              Confirm & Submit Proposal
            </button>
          </form>
        )}
      </Modal>

      {/* MODAL: Update Crop Stage */}
      <Modal
        isOpen={!!selectedCropForUpdate}
        onClose={() => setSelectedCropForUpdate(null)}
        title="🌱 Update Crop Progress Stage"
      >
        <form onSubmit={handleUpdateCrop} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Growth Stage</label>
              <select
                value={cropUpdateForm.stage}
                onChange={(e) => setCropUpdateForm({ ...cropUpdateForm, stage: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Sowing">Sowing</option>
                <option value="Vegetative">Vegetative</option>
                <option value="Flowering">Flowering</option>
                <option value="Maturation">Maturation</option>
                <option value="Harvested">Harvested</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Growth Velocity (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={cropUpdateForm.growthPercentage}
                onChange={(e) => setCropUpdateForm({ ...cropUpdateForm, growthPercentage: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Field Health Condition</label>
            <select
              value={cropUpdateForm.healthStatus}
              onChange={(e) => setCropUpdateForm({ ...cropUpdateForm, healthStatus: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Excellent">Excellent - Vigorous Foliage</option>
              <option value="Good">Good - Steady Growth</option>
              <option value="Average">Average - Slow Canopy</option>
              <option value="Pest Risk">Pest Risk - Foliage Scouting Needed</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observations & Field Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Second fertigation completed. Tillering count 24/hill."
              value={cropUpdateForm.notes}
              onChange={(e) => setCropUpdateForm({ ...cropUpdateForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
          >
            Save Progress Update
          </button>
        </form>
      </Modal>

      {/* MODAL: Raise Complaint */}
      <Modal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        title="⚖️ Lodge Dispute with Platform Arbitration"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dispute Category</label>
            <select
              value={complaintForm.category}
              onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Payment Dispute">Payment Dispute / Delayed Escrow</option>
              <option value="Delayed Pickup/Delivery">Delayed Harvest Pickup / Transport</option>
              <option value="Quality Disagreement">Quality Disagreement / Grade Grading</option>
              <option value="Field Inspection Concern">Field Inspection Extension Concern</option>
              <option value="Breach of Terms">Breach of Terms & Conditions</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              placeholder="Brief summary of grievance"
              value={complaintForm.subject}
              onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              placeholder="Explain the factual timeline and specific contract reference..."
              value={complaintForm.description}
              onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm shadow-md"
          >
            Lodge Arbitration Ticket
          </button>
        </form>
      </Modal>

      {/* GPS Farm Map Modal */}
      <FarmMapModal
        isOpen={!!selectedFarmForMap}
        onClose={() => setSelectedFarmForMap(null)}
        farm={selectedFarmForMap}
      />

      {/* QR Passport Modal */}
      <ContractQRModal
        isOpen={!!selectedContractForQR}
        onClose={() => setSelectedContractForQR(null)}
        contract={selectedContractForQR}
      />

      {/* Legal Agreement Document Modal */}
      <DigitalContractModal
        isOpen={!!selectedContractForDoc}
        onClose={() => setSelectedContractForDoc(null)}
        contract={selectedContractForDoc}
      />
    </div>
  );
}
