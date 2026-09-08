import React, { useState } from 'react';
import Modal from './Modal';
import { MapPin, Navigation, Compass, Layers, Check } from 'lucide-react';

export default function FarmMapModal({ isOpen, onClose, farm, onSelectCoordinates }) {
  const [coords, setCoords] = useState({
    lat: farm?.location?.latitude || 20.2312,
    lng: farm?.location?.longitude || 79.0028,
  });

  const handleMapClick = (e) => {
    // Generate slight offset to simulate coordinate pinning on the visual satellite map
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const newLat = Number((20.0 + (1 - y) * 0.5).toFixed(4));
    const newLng = Number((79.0 + x * 0.5).toFixed(4));
    setCoords({ lat: newLat, lng: newLng });
  };

  const handleSave = () => {
    if (onSelectCoordinates) {
      onSelectCoordinates(coords);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📍 GPS Agricultural Land Mapper & GIS Coordinates" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Interactive Simulated Satellite Map Canvas */}
        <div
          onClick={handleMapClick}
          className="relative w-full h-72 rounded-2xl overflow-hidden cursor-crosshair border-2 border-emerald-500/30 shadow-inner group"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.8) 100%), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Farm Cadastral Boundary Simulation */}
          <div className="absolute top-1/4 left-1/3 w-36 h-28 border-2 border-dashed border-emerald-400 bg-emerald-500/20 rounded-lg flex items-center justify-center pointer-events-none shadow-lg backdrop-blur-[1px]">
            <span className="text-[10px] font-black text-white px-2 py-0.5 rounded bg-emerald-800/80">
              {farm?.farmName || 'Cadastral Boundary Plot'}
            </span>
          </div>

          {/* Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl ring-4 ring-rose-400/40 animate-bounce">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900/90 text-[10px] text-white font-bold mt-1 shadow-md">
              GPS Verified
            </span>
          </div>

          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs border border-white/10 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Click map to pin GPS survey mark</span>
          </div>
        </div>

        {/* Coordinate Summary Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Latitude</span>
            <span className="font-bold text-slate-800 text-sm">{coords.lat}° N</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Longitude</span>
            <span className="font-bold text-slate-800 text-sm">{coords.lng}° E</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Survey Khata</span>
            <span className="font-bold text-slate-800 text-sm">{farm?.surveyNumber || 'KHATA-421/A'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Area Bound</span>
            <span className="font-bold text-emerald-700 text-sm">{farm?.areaInAcres || '8.0'} Acres</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Confirm GPS Location</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
