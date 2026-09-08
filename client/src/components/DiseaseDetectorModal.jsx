import React, { useState } from 'react';
import Modal from './Modal';
import { Stethoscope, Sparkles, AlertTriangle, ShieldCheck, UploadCloud } from 'lucide-react';
import api from '../services/api';

export default function DiseaseDetectorModal({ isOpen, onClose }) {
  const [cropName, setCropName] = useState('Wheat');
  const [affectedPart, setAffectedPart] = useState('Leaves');
  const [observedSymptoms, setObservedSymptoms] = useState('Yellowish powdery stripes observed on upper leaves.');
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const sampleImages = {
    Wheat: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=60',
    Rice: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=60',
    Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800&auto=format&fit=crop&q=60',
    Tomato: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=60',
    Soybean: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=60',
  };

  const handleDiagnose = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/diagnose-disease', {
        cropName,
        affectedPart,
        observedSymptoms,
      });
      if (res.data.success) {
        setDiagnosis(res.data.diagnosis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔬 AI Crop Health & Disease Diagnostic Scanner" maxWidth="max-w-2xl">
      <form onSubmit={handleDiagnose} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Crop</label>
            <select
              value={cropName}
              onChange={(e) => {
                setCropName(e.target.value);
                setPreviewImage(sampleImages[e.target.value]);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Wheat">Wheat (Triticum aestivum)</option>
              <option value="Rice">Rice / Paddy (Oryza sativa)</option>
              <option value="Cotton">Cotton (Gossypium)</option>
              <option value="Tomato">Tomato (Solanum lycopersicum)</option>
              <option value="Soybean">Soybean (Glycine max)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Affected Plant Anatomy</label>
            <select
              value={affectedPart}
              onChange={(e) => setAffectedPart(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Leaves">Foliage / Upper Canopy Leaves</option>
              <option value="Stem">Stem / Tillers / Internodes</option>
              <option value="Fruit">Grain / Earhead / Boll / Fruit</option>
              <option value="Roots">Root System / Crown</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Observed Symptoms / Leaf Lesions</label>
          <textarea
            rows={2}
            value={observedSymptoms}
            onChange={(e) => setObservedSymptoms(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Yellow concentric pustules, dark spots with halos, water-soaked brown edges..."
          />
        </div>

        {/* Upload simulation & image sample preview */}
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50 flex flex-col items-center justify-center">
          {previewImage || sampleImages[cropName] ? (
            <div className="flex items-center gap-3">
              <img
                src={previewImage || sampleImages[cropName]}
                alt="Crop Sample"
                className="w-20 h-20 object-cover rounded-xl shadow-sm border border-slate-200"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-800 block">Leaf Specimen Loaded</span>
                <span className="text-[11px] text-slate-500">Spectral analysis ready for pattern matching</span>
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-600">Simulate Leaf Sample Scan</span>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Processing Agronomic Neural Model...</span>
          ) : (
            <>
              <Stethoscope className="w-4 h-4" />
              <span>Run AI Pathology Diagnosis</span>
            </>
          )}
        </button>
      </form>

      {/* Diagnosis result */}
      {diagnosis && (
        <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800 animate-slide-up space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                Pathogen Identified
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-1">{diagnosis.diseaseName}</h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-600 block">Confidence Match</span>
              <span className="text-sm font-black text-emerald-700">{diagnosis.confidence}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Organic / Bio Remedy</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{diagnosis.organicRemedy}</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Target Chemical Spray</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{diagnosis.chemicalRemedy}</p>
            </div>
          </div>

          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 text-xs text-slate-700">
            <span className="font-bold text-slate-900">Preventative Cultural Practices: </span>
            {diagnosis.preventativeTips}
          </div>
        </div>
      )}
    </Modal>
  );
}
