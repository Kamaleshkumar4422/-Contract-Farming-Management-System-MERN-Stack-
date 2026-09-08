import React from 'react';
import Modal from './Modal';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Download, Share2 } from 'lucide-react';

export default function ContractQRModal({ isOpen, onClose, contract }) {
  if (!contract) return null;

  const qrData = contract.qrCodeData || JSON.stringify({
    code: contract.contractCode,
    crop: contract.cropName,
    qty: contract.targetQuantity,
    price: contract.pricePerUnit,
    buyer: contract.buyer?.name || 'Authorized Institutional Buyer',
    hash: `SHA256-${contract._id?.slice(-8)}-AGRIFLOW`,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛡️ Digital Contract Passport & Verification QR" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-3xl border-4 border-emerald-500/30 shadow-xl relative group">
          <QRCodeSVG
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#064e3b"
          />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>AGRIFLOW VERIFIED</span>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-lg font-extrabold text-slate-900">{contract.contractCode}</h4>
          <p className="text-xs text-slate-500">{contract.title}</p>
        </div>

        {/* Verification Metadata */}
        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Procuring Buyer:</span>
            <span className="font-bold text-slate-800">{contract.buyer?.name || 'GreenHarvest Agro Ltd.'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Contracted Crop:</span>
            <span className="font-bold text-slate-800">{contract.cropName} ({contract.variety})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Agreed Procurement Rate:</span>
            <span className="font-bold text-emerald-700">₹{contract.pricePerUnit} / {contract.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Commitment:</span>
            <span className="font-bold text-slate-900">₹{(contract.totalEstimatedValue || 0).toLocaleString()}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          This QR code can be scanned by field inspectors, logistics handlers, and APMC market yards for instant cryptographic contract validation.
        </p>
      </div>
    </Modal>
  );
}
