
import React, { useState, useEffect } from 'react';
import { CloudSnow, Thermometer, Wind, RefreshCcw, Loader2 } from 'lucide-react';
import { fetchMagicWeather } from '../services/geminiService';
import { MagicWeather } from '../types';
import { soundManager } from '../services/soundManager';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<MagicWeather | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMagicWeather();
      setWeather(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] w-64 shadow-2xl relative group overflow-hidden">
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">N. Pole Station</span>
          <span className="text-[7px] text-white/20 font-bold">Sync: Stable</span>
        </div>
        <button onClick={() => { soundManager.playClick(); fetchWeather(); }} disabled={isLoading} className="text-white/20 hover:text-white transition-colors">
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
        </button>
      </div>

      {weather ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-4">
             <div className="text-4xl drop-shadow-[0_0_10px_white]">{weather.emoji}</div>
             <div className="flex flex-col">
                <span className="text-lg font-black text-white leading-none">{weather.temperature}</span>
                <span className="text-[9px] text-blue-200/40 uppercase font-bold truncate">{weather.condition}</span>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
             <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/20 uppercase">Wind</span>
                <span className="text-[9px] font-bold text-indigo-300 truncate">{weather.windType}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-white/20 uppercase">Forecast</span>
                <span className="text-[8px] font-medium text-white/60 italic text-right leading-tight">{weather.forecast}</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center italic text-white/10 text-[10px]">Connecting to Satellite...</div>
      )}
    </div>
  );
};

export default WeatherWidget;
