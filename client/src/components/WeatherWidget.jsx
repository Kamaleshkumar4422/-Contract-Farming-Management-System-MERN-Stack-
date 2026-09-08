import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, Thermometer, ShieldAlert, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function WeatherWidget({ state = 'Maharashtra', district = 'Chandrapur' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await api.get(`/ai/weather?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
        if (res.data.success) {
          setWeather(res.data.weather);
        }
      } catch (err) {
        console.error('Weather load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [state, district]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse flex items-center justify-center min-h-[140px]">
        <span className="text-slate-400 text-sm">Loading agrometeorological telemetry...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Farm Weather
            </span>
            <span className="text-xs text-slate-300">{weather.location}</span>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-black">{weather.current.temperature}°C</span>
            <span className="text-emerald-300 text-sm font-semibold">{weather.current.condition}</span>
          </div>
        </div>

        {/* Telemetry chips */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-slate-400 text-[10px] block">Humidity</span>
            <span className="font-bold">{weather.current.humidity}%</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
            <div className="flex items-center justify-center text-blue-400 mb-1">
              <Wind className="w-4 h-4" />
            </div>
            <span className="text-slate-400 text-[10px] block">Wind</span>
            <span className="font-bold">{weather.current.windSpeed}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <Thermometer className="w-4 h-4" />
            </div>
            <span className="text-slate-400 text-[10px] block">Soil Moisture</span>
            <span className="font-bold">{weather.current.soilMoistureSurface}</span>
          </div>
        </div>
      </div>

      {/* Agronomic advisory bar */}
      <div className="mt-4 pt-1 flex items-start gap-2.5 text-xs text-emerald-200">
        <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Farming Advisory: </span>
          <span>{weather.agriAdvisory.sprayingCondition} {weather.agriAdvisory.irrigationRecommendation}</span>
        </div>
      </div>
    </div>
  );
}
