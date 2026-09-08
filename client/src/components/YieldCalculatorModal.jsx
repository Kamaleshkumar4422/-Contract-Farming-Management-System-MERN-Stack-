import React, { useState } from 'react';
import Modal from './Modal';
import { Calculator, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function YieldCalculatorModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    cropName: 'Wheat',
    acreage: 5,
    soilType: 'Black Soil',
    irrigationType: 'Drip System',
    seedQuality: 'Certified Hybrid F1',
    farmingPractice: 'Conventional Precision',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const crops = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Sugarcane', 'Maize', 'Potato', 'Tomato', 'Mustard', 'Turmeric'];
  const soils = ['Black Soil', 'Alluvial Soil', 'Clayey Loam', 'Red & Yellow', 'Laterite', 'Sandy Loam'];
  const irrigations = ['Drip System', 'Sprinkler System', 'Canal Irrigation', 'Borewell', 'Rainfed / Natural'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/predict-yield', formData);
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🌱 AI Crop Yield Forecaster" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type</label>
            <select
              value={formData.cropName}
              onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cultivated Land (Acres)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={formData.acreage}
              onChange={(e) => setFormData({ ...formData, acreage: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Soil Quality</label>
            <select
              value={formData.soilType}
              onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {soils.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Irrigation System</label>
            <select
              value={formData.irrigationType}
              onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {irrigations.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Seed Stock Variety</label>
            <select
              value={formData.seedQuality}
              onChange={(e) => setFormData({ ...formData, seedQuality: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Certified Hybrid F1">Certified Hybrid F1 (+18% yield)</option>
              <option value="Farmer Saved Standard">Farmer Saved Standard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Farming Approach</label>
            <select
              value={formData.farmingPractice}
              onChange={(e) => setFormData({ ...formData, farmingPractice: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Conventional Precision">Precision Farming (GAP compliant)</option>
              <option value="Organic / Regenerative">Certified Organic Regenerative</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Computing Agronomic Forecast...</span>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              <span>Calculate Projected Harvest Yield</span>
            </>
          )}
        </button>
      </form>

      {/* Yield Prediction Output */}
      {result && (
        <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 animate-slide-up">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Forecast Result</span>
              <h4 className="text-xl font-extrabold text-emerald-950 mt-0.5">
                {result.totalEstimatedYieldQuintals} <span className="text-sm font-semibold">Quintals Total</span>
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-600 block">Per Acre Average</span>
              <span className="text-base font-bold text-slate-900">{result.estimatedYieldPerAcreQuintals} Q / Acre</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-slate-500 block">Expected Harvest Range</span>
              <span className="font-bold text-slate-800">{result.expectedYieldRange}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-slate-500 block">Model Confidence</span>
              <span className="font-bold text-emerald-700">{result.confidenceScore} (Precision Match)</span>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xs font-bold text-emerald-900 block mb-1">Agronomic Recommendations:</span>
            <ul className="space-y-1 text-xs text-slate-700">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
