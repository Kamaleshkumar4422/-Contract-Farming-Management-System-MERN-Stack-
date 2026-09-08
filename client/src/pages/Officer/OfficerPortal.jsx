import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import {
  ClipboardCheck,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OfficerPortal({ activeSection, setActiveSection }) {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [contracts, setContracts] = useState([]);
  const [farms, setFarms] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Conduct Inspection Form
  const [inspectionForm, setInspectionForm] = useState({
    contractId: '',
    farmId: '',
    cropCondition: 'Healthy / Good',
    growthPercentage: 60,
    pestOrDiseaseDetected: false,
    pestDiseaseDetails: '',
    soilMoistureCondition: 'Optimal',
    irrigationStatus: 'Operational',
    remarks: 'Foliage canopy is clean with uniform tillering and no major fungal lesions.',
    recommendedActions: 'Continue scheduled organic fertigation and maintain 3cm standing water during vegetative peak.',
    overallScore: 92,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractsRes, farmsRes, inspectionsRes] = await Promise.all([
        api.get('/contracts'),
        api.get('/farms'),
        api.get('/inspections/my-inspections'),
      ]);

      if (contractsRes.data.success) {
        setContracts(contractsRes.data.contracts);
        if (contractsRes.data.contracts.length > 0 && !inspectionForm.contractId) {
          setInspectionForm((prev) => ({
            ...prev,
            contractId: contractsRes.data.contracts[0]._id,
            farmId: contractsRes.data.contracts[0].assignedFarm?._id || farmsRes.data.farms[0]?._id || '',
          }));
        }
      }
      if (farmsRes.data.success) setFarms(farmsRes.data.farms);
      if (inspectionsRes.data.success) setInspections(inspectionsRes.data.inspections);
    } catch (err) {
      console.error('Officer data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inspections', inspectionForm);
      if (res.data.success) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        showToast('Field Inspection report certified and transmitted! 📋');
        fetchData();
        setActiveSection('history');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit inspection', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Agricultural Extension Jurisdiction • Badge: {user?.officerDetails?.badgeId || 'EXT-OFF-2023-882'}
              </span>
              <h2 className="text-2xl font-black mt-1">Field Extension & Audit Hub 🔍</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Certified audits ensure strict compliance with Good Agricultural Practices (GAP), verifiable crop health telemetry, and unbiased quality assessments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Assigned Plots"
              value={farms.length}
              subtitle="Registered Farmlands"
              icon={MapPin}
              color="emerald"
            />
            <MetricCard
              title="Active Contracts"
              value={contracts.filter((c) => c.status === 'in_progress').length}
              subtitle="Field Visits Required"
              icon={FileSpreadsheet}
              color="amber"
            />
            <MetricCard
              title="Audits Completed"
              value={inspections.length}
              subtitle="Certified Reports Filed"
              icon={ClipboardCheck}
              color="blue"
            />
            <MetricCard
              title="Avg Field Health"
              value="92 / 100"
              subtitle="Regional Canopy Index"
              icon={ShieldCheck}
              color="purple"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Conduct Scheduled Field Visit</h3>
              <p className="text-xs text-slate-500">
                Log crop foliage condition, pest occurrences, and soil moisture directly on the digital inspection pad.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('conduct')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 shrink-0"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Open Digital Inspection Pad</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ASSIGNED FARMS & PLOTS */}
      {activeSection === 'assigned' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">Assigned Contract Plots in Jurisdiction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farms.map((farm) => (
              <div
                key={farm._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Survey #{farm.surveyNumber}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">{farm.farmName}</h4>
                    <p className="text-xs text-slate-500">
                      Farmer: <strong className="text-slate-800">{farm.farmer?.name}</strong> • Phone: {farm.farmer?.phone}
                    </p>
                  </div>
                  <span className="text-base font-black text-slate-900">{farm.areaInAcres} Acres</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Soil Type</span>
                    <span className="font-bold text-slate-800">{farm.soilType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Irrigation</span>
                    <span className="font-bold text-slate-800">{farm.irrigationSource}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Water Access</span>
                    <span className="font-bold text-slate-800">{farm.waterAvailability}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">GPS: {farm.location?.latitude}° N, {farm.location?.longitude}° E</span>
                  <button
                    onClick={() => {
                      setInspectionForm((prev) => ({
                        ...prev,
                        farmId: farm._id,
                      }));
                      setActiveSection('conduct');
                    }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Conduct Audit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DIGITAL INSPECTION PAD */}
      {activeSection === 'conduct' && (
        <div className="max-w-3xl bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Digital Inspection Pad</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">Field Extension Inspection Certificate</h3>
            <p className="text-xs text-slate-500">
              Submit agronomic verification report. This updates live crop health status for both the Farmer and Contracting Buyer.
            </p>
          </div>

          <form onSubmit={handleSubmitInspection} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contract Reference</label>
                <select
                  value={inspectionForm.contractId}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, contractId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  {contracts.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.contractCode} - {c.cropName} ({c.title.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inspected Farm Land</label>
                <select
                  value={inspectionForm.farmId}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, farmId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  {farms.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.farmName} ({f.areaInAcres} Acres - {f.farmer?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crop Condition</label>
                <select
                  value={inspectionForm.cropCondition}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, cropCondition: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Excellent">Excellent - Vigorous Vegetative Canopy</option>
                  <option value="Healthy / Good">Healthy / Good - Normal Development</option>
                  <option value="Fair / Needs Care">Fair / Needs Care</option>
                  <option value="Severe Pest Infection">Severe Pest Infection Alert</option>
                  <option value="Damaged">Damaged (Hail / Inundation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Growth Velocity (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={inspectionForm.growthPercentage}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, growthPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Soil Moisture State</label>
                <select
                  value={inspectionForm.soilMoistureCondition}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, soilMoistureCondition: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Optimal">Optimal Field Capacity</option>
                  <option value="Dry / Underwatered">Dry / Underwatered</option>
                  <option value="Waterlogged">Waterlogged / Poor Drainage</option>
                  <option value="Saline / Alkaline">Saline / Alkaline Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Irrigation System Status</label>
                <select
                  value={inspectionForm.irrigationStatus}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, irrigationStatus: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Operational">Operational & Clean</option>
                  <option value="Partially Blocked">Partially Blocked Nozzles</option>
                  <option value="Deficient">Deficient Water Pressure</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Pest or Foliage Disease Detected?</span>
                <span className="text-[11px] text-slate-500">Flags immediate alert on farmer dashboard</span>
              </div>
              <input
                type="checkbox"
                checked={inspectionForm.pestOrDiseaseDetected}
                onChange={(e) => setInspectionForm({ ...inspectionForm, pestOrDiseaseDetected: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            {inspectionForm.pestOrDiseaseDetected && (
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">Pest / Pathology Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Minor leaf hopper activity noticed at field borders."
                  value={inspectionForm.pestDiseaseDetails}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, pestDiseaseDetails: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Auditor Remarks & Field Evaluation</label>
              <textarea
                rows={2}
                value={inspectionForm.remarks}
                onChange={(e) => setInspectionForm({ ...inspectionForm, remarks: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Agronomic Actions for Farmer</label>
              <input
                type="text"
                value={inspectionForm.recommendedActions}
                onChange={(e) => setInspectionForm({ ...inspectionForm, recommendedActions: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Overall Inspection Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={inspectionForm.overallScore}
                onChange={(e) => setInspectionForm({ ...inspectionForm, overallScore: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all"
            >
              Digitally Sign & Certify Field Audit
            </button>
          </form>
        </div>
      )}

      {/* 4. AUDIT TRAIL */}
      {activeSection === 'history' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">Certified Inspection History & Audit Trail</h3>
          <div className="space-y-4">
            {inspections.map((insp) => (
              <div
                key={insp._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Filed on {new Date(insp.inspectionDate).toLocaleDateString()}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">
                      {insp.contract?.cropName || 'Contract Crop'} - Plot: {insp.farm?.farmName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Contractor: {insp.contract?.assignedFarmer?.name} • Buyer: {insp.contract?.buyer?.name}
                    </p>
                  </div>
                  <span className="text-xl font-black text-emerald-700">{insp.overallScore}/100</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Condition</span>
                    <strong className="text-slate-800">{insp.cropCondition}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Growth</span>
                    <strong className="text-slate-800">{insp.growthPercentage}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Soil Moisture</span>
                    <strong className="text-slate-800">{insp.soilMoistureCondition}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Irrigation</span>
                    <strong className="text-slate-800">{insp.irrigationStatus}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                  <strong>Findings:</strong> {insp.remarks}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
