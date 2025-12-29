
import React, { useState, useEffect, useMemo } from 'react';
// Added Wind to the lucide-react import list
import { Radar, Navigation, MapPin, Gift, Zap, Activity, ChevronRight, Loader2, Sparkles, Target, Wind } from 'lucide-react';
import { DeliveryPoint } from '../types';
import { generateDeliveryMapData } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface SantaRadarSectionProps {
  onOpenFullMap: () => void;
}

const SantaRadarSection: React.FC<SantaRadarSectionProps> = ({ onOpenFullMap }) => {
  const [points, setPoints] = useState<DeliveryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [telemetry, setTelemetry] = useState({
    speed: 12400,
    altitude: 38000,
    energy: 98,
    heartRate: 72
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        speed: prev.speed + (Math.random() * 20 - 10),
        altitude: prev.altitude + (Math.random() * 10 - 5),
        energy: Math.max(0, prev.energy - 0.001),
        heartRate: 70 + Math.floor(Math.random() * 10)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (points.length > 0) {
      const interval = setInterval(() => {
        setCurrentIdx(prev => (prev + 1) % points.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [points]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await generateDeliveryMapData();
      setPoints(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMission = points[currentIdx];

  return (
    <section className="w-full max-w-6xl mx-auto mt-64 mb-20 px-4 animate-fade-in">
      <div className="bg-indigo-950/30 backdrop-blur-2xl rounded-[3rem] border-2 border-white/10 p-8 shadow-2xl relative overflow-hidden group">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Left: Interactive Radar */}
          <div className="relative shrink-0" onClick={() => { soundManager.playClick(); onOpenFullMap(); }}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-black/40 border-2 border-indigo-500/30 relative flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all shadow-inner">
              {/* Radar Sweep */}
              <div className="absolute inset-0 rounded-full border-l border-indigo-500/40 animate-radar-sweep pointer-events-none" />
              
              {/* Blips */}
              {points.map((p, i) => (
                <div 
                  key={p.id}
                  className={`absolute w-2 h-2 rounded-full transition-all duration-500 ${i === currentIdx ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] scale-150' : 'bg-emerald-500/40'}`}
                  style={{ 
                    left: `${p.coords.x}%`, 
                    top: `${p.coords.y}%` 
                  }}
                />
              ))}
              
              <Radar className="text-indigo-500/20" size={120} />
              
              {/* Center Sleigh */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
              Live Sleigh Radar
            </div>
          </div>

          {/* Middle: Mission Data */}
          <div className="flex-grow w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600/20 p-2 rounded-xl">
                <Target className="text-red-400" size={20} />
              </div>
              <h3 className="text-xs font-black text-indigo-300 uppercase tracking-[0.3em]">Active Mission Profile</h3>
            </div>

            {isLoading ? (
              <div className="h-32 flex items-center justify-center gap-4">
                <Loader2 className="text-indigo-400 animate-spin" size={24} />
                <span className="text-indigo-200/40 text-sm italic">Establishing connection...</span>
              </div>
            ) : currentMission ? (
              <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="text-4xl">{currentMission.emoji}</div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recipient</p>
                      <p className="text-xl font-bold text-white">{currentMission.recipient}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <MapPin className="text-red-400" size={20} />
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Location</p>
                      <p className="text-base font-bold text-white">{currentMission.location}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Gift className="text-emerald-400" size={20} />
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Payload</p>
                      <p className="text-base font-bold text-white italic">"{currentMission.gift}"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Wind className="text-blue-400" size={20} />
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Chimney Access</p>
                      <p className={`text-base font-bold uppercase ${currentMission.chimneyStatus === 'clear' ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {currentMission.chimneyStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: Telemetry Sidebar */}
          <div className="w-full lg:w-64 flex flex-col gap-4">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-indigo-300/40 uppercase">Sleigh Speed</span>
                <div className="flex items-center gap-1 text-white font-bold text-sm">
                  <Zap size={12} className="text-yellow-400" /> {Math.floor(telemetry.speed).toLocaleString()} <span className="text-[8px] opacity-40">km/h</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-indigo-300/40 uppercase">Altitude</span>
                <div className="flex items-center gap-1 text-white font-bold text-sm">
                  <Navigation size={12} className="text-blue-400" /> {Math.floor(telemetry.altitude).toLocaleString()} <span className="text-[8px] opacity-40">ft</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-indigo-300/40 uppercase">Reindeer Core</span>
                <div className="flex items-center gap-1 text-white font-bold text-sm">
                  <Activity size={12} className="text-emerald-400" /> {telemetry.heartRate} <span className="text-[8px] opacity-40">bpm</span>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-[9px] font-black text-indigo-300/40 uppercase mb-1">
                  <span>Magic Charge</span>
                  <span>{telemetry.energy.toFixed(1)}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${telemetry.energy}%` }} />
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => { soundManager.playClick(); onOpenFullMap(); }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest group/btn"
            >
              Tactical View <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Animated Scanning Line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
          <div className="w-full h-1 bg-white animate-scan-line" />
        </div>
      </div>

      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-radar-sweep {
          animation: radar-sweep 4s linear infinite;
          transform-origin: center;
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        .animate-scan-line {
          animation: scan-line 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default SantaRadarSection;
