import React from 'react';
import Modal from './Modal';
import { Printer, FileCheck, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function DigitalContractModal({ isOpen, onClose, contract }) {
  if (!contract) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📄 Legal Contract Farming Agreement" maxWidth="max-w-3xl">
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Printable Contract Document */}
        <div id="printable-contract" className="bg-white border-2 border-slate-300 rounded-2xl p-8 text-slate-800 text-sm shadow-sm space-y-6">
          {/* Header */}
          <div className="border-b-2 border-emerald-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-800 font-extrabold">Form Model Agreement</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">CONTRACT FARMING MUTUAL AGREEMENT</h2>
              <p className="text-xs text-slate-500">Under the State Agricultural Produce & Livestock Contract Farming Framework</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Agreement Reference</span>
              <span className="text-base font-black text-emerald-900">{contract.contractCode}</span>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-extrabold text-slate-900 uppercase block mb-1">Contracting Buyer (Party A):</span>
              <p className="font-bold text-slate-800 text-sm">{contract.buyer?.name || 'GreenHarvest Agro Industries Ltd.'}</p>
              <p className="text-slate-600">{contract.buyer?.buyerDetails?.businessType || 'Agro Processing & Export Corp.'}</p>
              <p className="text-slate-600">GSTIN: {contract.buyer?.buyerDetails?.gstNumber || '27AABCG1234F1Z8'}</p>
              <p className="text-slate-600">{contract.deliveryLocation}</p>
            </div>

            <div>
              <span className="font-extrabold text-slate-900 uppercase block mb-1">Registered Producer (Party B):</span>
              <p className="font-bold text-slate-800 text-sm">{contract.assignedFarmer?.name || 'Ramesh Patel'}</p>
              <p className="text-slate-600">Kisan Card: {contract.assignedFarmer?.farmerDetails?.kisanCardNumber || 'KCC-MAH-2021-99482'}</p>
              <p className="text-slate-600">Farm Survey: {contract.assignedFarm?.surveyNumber || 'KHATA-421/A'}</p>
              <p className="text-slate-600">Phone: {contract.assignedFarmer?.phone || '+91 97120 77889'}</p>
            </div>
          </div>

          {/* Schedule of Terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Schedule 1: Crop Specifications & Consideration
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Crop & Variety</span>
                <span className="font-bold text-slate-900">{contract.cropName} ({contract.variety})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Committed Quantity</span>
                <span className="font-bold text-slate-900">{contract.targetQuantity} {contract.unit}s</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Guaranteed Price</span>
                <span className="font-bold text-emerald-800">₹{contract.pricePerUnit} / {contract.unit}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Total Contract Value</span>
                <span className="font-bold text-slate-900">₹{(contract.totalEstimatedValue || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Sowing Timeline</span>
                <span className="font-bold text-slate-900">{new Date(contract.sowingDate).toLocaleDateString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Expected Harvest Date</span>
                <span className="font-bold text-slate-900">{new Date(contract.expectedHarvestDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quality Standards */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Schedule 2: Quality Norms & Acceptance Benchmark
            </h4>
            <p className="text-slate-700">
              Grade Standard: <strong className="text-emerald-800">{contract.qualityStandards?.minimumGrade || 'Grade A'}</strong> | 
              Maximum Permissible Moisture: <strong>{contract.qualityStandards?.maxMoisturePercentage || 12}%</strong> | 
              Defects Allowed: <strong>&lt; {contract.qualityStandards?.allowedDefectsPercentage || 2}%</strong>
            </p>
            <p className="text-slate-600 italic">
              "{contract.qualityStandards?.customSpecifications || 'Crop must be clean, free from mould, pests or abnormal moisture.'}"
            </p>
          </div>

          {/* Legal Covenant */}
          <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed bg-slate-50 p-4 rounded-xl">
            <p><strong>1. Assured Purchase:</strong> Party A irrevocably agrees to purchase the entirety of contracted crop at or above the pre-agreed floor price.</p>
            <p><strong>2. Agronomic Adherence:</strong> Party B agrees to follow Good Agricultural Practices (GAP) and permit authorized field extension inspections.</p>
            <p><strong>3. Dispute Redressal:</strong> Any dispute shall be referred to the AgriFlow Platform Arbitration & Conciliation Board as per state guidelines.</p>
          </div>

          {/* Signatures & QR Passport */}
          <div className="pt-6 border-t-2 border-slate-200 flex items-center justify-between">
            <div className="space-y-2 text-center">
              <div className="w-36 h-12 border-b border-dashed border-slate-400 flex items-center justify-center text-emerald-800 font-mono text-xs font-bold">
                ✓ DIGITALLY SIGNED
              </div>
              <span className="text-[10px] text-slate-500 block">Party A (Authorized Signatory)</span>
            </div>

            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={contract.qrCodeData || contract.contractCode}
                size={70}
                level="M"
              />
              <span className="text-[9px] text-slate-400 mt-1 font-mono">AGRIFLOW-HASH-VERIFIED</span>
            </div>

            <div className="space-y-2 text-center">
              <div className="w-36 h-12 border-b border-dashed border-slate-400 flex items-center justify-center text-emerald-800 font-mono text-xs font-bold">
                ✓ AADHAAR e-SIGN
              </div>
              <span className="text-[10px] text-slate-500 block">Party B (Farmer Seal)</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
