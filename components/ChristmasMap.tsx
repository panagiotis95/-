
import React, { useState, useEffect, useMemo } from 'react';
import { X, Navigation, Home, Gift, CheckCircle2, Star, Loader2, Sparkles, User, MapPin, Zap, Wind, ShieldAlert, Coffee, Radar, CloudSnow } from 'lucide-react';
import { DeliveryPoint } from '../types';
import { generateDeliveryMapData } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface ChristmasMapProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChristmasMap: React.FC<ChristmasMapProps> = ({ isOpen, onClose }) => {
  const [points, setPoints] = useState<DeliveryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<DeliveryPoint | null>(null);
  const [santaPosition, setSantaPosition] = useState(0); 
  const [viewMode, setViewMode] = useState<'standard' | 'aurora'>('standard');
  const [reindeerEnergy, setReindeerEnergy] = useState(100);
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    if (isOpen && points.length === 0) {
      handleLoadMap();
    }
  }, [isOpen]);

  // Santa movement animation & energy drain
  useEffect(() => {
    if (isOpen && points.length > 0) {
      const interval = setInterval(() => {
        setSantaPosition(prev => (prev + 0.1) % 100);
        setReindeerEnergy(prev => Math.max(5, prev - 0.02));
        setTotalDistance(prev => prev + 12);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isOpen, points]);

  const handleLoadMap = async () => {
    setIsLoading(true);
    soundManager.playClick();
    try {
      const data = await generateDeliveryMapData();
      setPoints(data);
      setReindeerEnergy(100);
      setTotalDistance(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPathPoint = useMemo(() => {
    if (points.length === 0) return { x: 50, y: 50 };
    const idx = Math.floor((santaPosition / 100) * points.length);
    const nextIdx = (idx + 1) % points.length;
    const p1 = points[idx].coords;
    const p2 = points[nextIdx].coords;
    const localT = (santaPosition / (100 / points.length)) % 1;
    
    return {
      x: p1.x + (p2.x - p1.x) * localT,
      y: p1.y + (p2.y - p1.y) * localT,
    };
  }, [santaPosition, points]);

  const handleDeliver = (id: string) => {
    soundManager.playGiftOpen();
    setPoints(prev => prev.map(p => p.id === id ? { ...p, status: 'delivered' } : p));
    setReindeerEnergy(prev => Math.min(100, prev + 15)); // Refuel on snack!
    setSelectedPoint(null);
  };

  const getChimneyColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'clear': return 'text-green-400';
      case 'blocked': return 'text-red-500';
      case 'fireplace-active': return 'text-orange-500';
      default: return 'text-yellow-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className={`w-full max-w-7xl h-[90vh] rounded-[3rem] border-2 shadow-[0_0_120px_rgba(79,70,229,0.4)] relative overflow-hidden flex flex-col animate-slide-up transition-all duration-1000 ${viewMode === 'aurora' ? 'bg-[#001a1a] border-emerald-500/30' : 'bg-[#020617] border-indigo-500/30'}`}>
        
        {/* HUD Top Bar */}
        <div className="p-6 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 relative z-20">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Flight Velocity</span>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-white leading-none">2,480</span>
                <span className="text-[10px] font-bold text-indigo-200/40">km/s</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Reindeer Core</span>
              <div className="w-32 h-2 bg-black/50 rounded-full p-0.5 border border-white/10">
                <div className={`h-full rounded-full transition-all duration-500 ${reindeerEnergy < 20 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} style={{ width: `${reindeerEnergy}%` }} />
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Total Traverse</span>
              <span className="text-xl font-black text-white leading-none">{(totalDistance / 1000).toFixed(1)}M km</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-black/60 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => { soundManager.playClick(); setViewMode('standard'); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'standard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-200/40 hover:text-white'}`}
              >
                <Radar size={14} /> Tactical
              </button>
              <button 
                onClick={() => { soundManager.playClick(); setViewMode('aurora'); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'aurora' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-200/40 hover:text-white'}`}
              >
                <Wind size={14} /> Aurora
              </button>
            </div>
            <button onClick={onClose} className="p-3 bg-red-600/10 hover:bg-red-600/20 rounded-full transition-colors text-red-500">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-grow relative overflow-hidden flex flex-col md:flex-row">
          
          {/* Main Map View */}
          <div className="flex-grow relative bg-black overflow-hidden group">
            {/* Map Effects */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${viewMode === 'aurora' ? 'opacity-40' : 'opacity-10'}`} style={{ background: 'radial-gradient(circle at 50% 50%, #10b981 0%, transparent 70%)' }} />
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(79, 70, 229, 0.08) 1px, transparent 0)', backgroundSize: '60px 60px' }} />
            
            {/* Radar Sweep Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-l border-indigo-500/20 rounded-full animate-radar-sweep pointer-events-none" />

            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30">
                <div className="relative">
                  <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full animate-ping" />
                  <Loader2 size={48} className="absolute inset-0 m-auto text-indigo-500 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-indigo-400 font-black uppercase tracking-[0.4em] mb-2">Synchronizing Satellite Feeds</p>
                  <p className="text-[10px] text-indigo-200/30 italic">Establishing North Pole Uplink...</p>
                </div>
              </div>
            ) : (
              <svg className="w-full h-full p-20 overflow-visible relative z-10">
                {/* Path Logic */}
                {points.length > 1 && (
                  <path
                    d={`M ${points.map(p => `${p.coords.x}% ${p.coords.y}%`).join(' L ')} Z`}
                    fill="none"
                    stroke={viewMode === 'aurora' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(79, 70, 229, 0.3)'}
                    strokeWidth="2"
                    strokeDasharray="15 15"
                    className="animate-dash"
                  />
                )}

                {/* Connection Glow */}
                {points.length > 1 && (
                  <path
                    d={`M ${points.map(p => `${p.coords.x}% ${p.coords.y}%`).join(' L ')} Z`}
                    fill="none"
                    stroke={viewMode === 'aurora' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)'}
                    strokeWidth="20"
                    className="blur-3xl"
                  />
                )}

                {/* Delivery Markers */}
                {points.map((p) => (
                  <g 
                    key={p.id} 
                    transform={`translate(${p.coords.x * 12}, ${p.coords.y * 12})`} 
                    className="cursor-pointer group/marker"
                    onClick={() => { soundManager.playClick(); setSelectedPoint(p); }}
                  >
                    <circle r="25" className={`transition-all duration-500 ${p.status === 'delivered' ? 'fill-emerald-500/10' : 'fill-indigo-600/10 group-hover/marker:fill-indigo-600/20'}`} />
                    <circle r="6" className={`transition-all ${p.status === 'delivered' ? 'fill-emerald-400' : 'fill-indigo-400'}`} />
                    
                    {/* Floating Info */}
                    <g className="opacity-0 group-hover/marker:opacity-100 transition-opacity">
                      <rect x="-50" y="-55" width="100" height="40" rx="10" className="fill-black/80 stroke-white/10" />
                      <text y="-38" textAnchor="middle" className="text-[10px] fill-white font-black">{p.recipient}</text>
                      <text y="-25" textAnchor="middle" className="text-[8px] fill-indigo-300 font-bold uppercase tracking-widest">{p.location}</text>
                    </g>
                    
                    <text x="-12" y="10" className="text-xl pointer-events-none drop-shadow-md">{p.status === 'delivered' ? '✅' : p.emoji}</text>
                  </g>
                ))}

                {/* Santa Sleigh Avatar */}
                {points.length > 0 && (
                  <g transform={`translate(${currentPathPoint.x * 12}, ${currentPathPoint.y * 12})`} className="drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                    <circle r="18" className="fill-red-500/20 animate-ping" />
                    <text x="-20" y="12" className="text-4xl pointer-events-none filter brightness-150">🛷</text>
                  </g>
                )}
              </svg>
            )}

            {/* Mission Briefing Card (Overlay) */}
            {selectedPoint && (
              <div className="absolute top-12 left-12 w-96 bg-[#020617]/90 backdrop-blur-2xl p-8 rounded-[3rem] border-2 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] animate-slide-up z-40">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                    {selectedPoint.status === 'delivered' ? '✅' : selectedPoint.emoji}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${selectedPoint.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-orange-500/10 border-orange-500/50 text-orange-400'}`}>
                      {selectedPoint.status === 'delivered' ? 'MISSION COMPLETE' : 'DEPLOYMENT PENDING'}
                    </span>
                    <button onClick={() => setSelectedPoint(null)} className="mt-3 text-white/20 hover:text-white transition-colors"><X size={18} /></button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-black text-white leading-tight">{selectedPoint.recipient}</h3>
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} /> {selectedPoint.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-1 text-indigo-300">
                        <Gift size={14} />
                        <span className="text-[9px] font-black uppercase">Payload</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{selectedPoint.gift}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-1 text-orange-400">
                        <Wind size={14} />
                        <span className="text-[9px] font-black uppercase">Chimney</span>
                      </div>
                      <p className={`text-xs font-bold truncate capitalize ${getChimneyColor(selectedPoint.chimneyStatus)}`}>{selectedPoint.chimneyStatus}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-1 text-yellow-400">
                        <Coffee size={14} />
                        <span className="text-[9px] font-black uppercase">Snacks</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate italic">{selectedPoint.snacks}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-1 text-red-500">
                        <ShieldAlert size={14} />
                        <span className="text-[9px] font-black uppercase">Threats</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate uppercase">{selectedPoint.threatLevel}</p>
                    </div>
                  </div>

                  {selectedPoint.status === 'pending' ? (
                    <button 
                      onClick={() => handleDeliver(selectedPoint.id)}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                    >
                      <Navigation size={18} /> Initiate Delivery
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center gap-3">
                      <CheckCircle2 size={18} /> Package Delivered
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tactical Sidebar */}
          <div className="w-full md:w-96 bg-[#01040f] border-l border-white/5 flex flex-col p-8 z-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] flex items-center gap-3">
                <Navigation size={16} className="text-indigo-400 animate-pulse" /> Deployment Status
              </h3>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
              </div>
            </div>

            <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar-tactical pr-2">
              {points.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { soundManager.playClick(); setSelectedPoint(p); }}
                  className={`w-full text-left p-4 rounded-3xl border transition-all flex items-center gap-5 relative group ${selectedPoint?.id === p.id ? 'bg-indigo-600/20 border-indigo-500/50 shadow-2xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-colors ${p.status === 'delivered' ? 'bg-emerald-500/20 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                    {p.status === 'delivered' ? '✅' : p.emoji}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate">{p.location}</p>
                      {p.status === 'delivered' && <span className="text-[8px] font-bold text-emerald-400">SYNCED</span>}
                    </div>
                    <p className="text-lg font-bold text-white truncate leading-none">{p.recipient}</p>
                    <div className="flex gap-1.5 mt-2">
                      {p.status === 'pending' ? (
                        <>
                          <div className={`w-8 h-1 rounded-full ${getChimneyColor(p.chimneyStatus).replace('text-', 'bg-')}`} />
                          <div className={`w-4 h-1 rounded-full ${p.threatLevel === 'low' ? 'bg-emerald-500/40' : 'bg-red-500/40'}`} />
                        </>
                      ) : (
                        <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className={`transition-transform duration-300 ${selectedPoint?.id === p.id ? 'translate-x-1 text-white' : 'text-white/10'}`} />
                </button>
              ))}
              
              {points.length === 0 && !isLoading && (
                <div className="h-64 flex flex-col items-center justify-center text-indigo-200/20 italic text-center gap-4">
                  <CloudSnow size={48} className="animate-bounce" />
                  <p className="text-sm">Initiate Satellite Scan<br/>to begin tracking...</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-[9px] font-black text-indigo-200/40 uppercase mb-1">Total Payload Status</p>
                   <p className="text-sm font-bold text-white">{points.filter(p => p.status === 'delivered').length} / {points.length} Drops</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] font-black text-indigo-200/40 uppercase mb-1">Santa's Mood</p>
                   <p className="text-sm font-bold text-yellow-400">JOLLY 🎅</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-indigo-200/20 px-10">
          <div className="flex gap-8">
            <span>Lat: {currentPathPoint.y.toFixed(4)}°N</span>
            <span>Lon: {currentPathPoint.x.toFixed(4)}°E</span>
            <span>Alt: 35,000 ft</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-yellow-400" /> Quantum-Encrypted Sleigh Link v7.0
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar-tactical::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-tactical::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.2); border-radius: 10px; }
        
        @keyframes radar-sweep {
          0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { transform: translate(-50%, -50%) rotate(360deg); opacity: 0.1; }
        }
        .animate-radar-sweep {
          animation: radar-sweep 6s linear infinite;
        }

        @keyframes dash {
          to { stroke-dashoffset: -200; }
        }
        .animate-dash {
          animation: dash 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

const ChevronRight = ({ className, size }: { className?: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default ChristmasMap;
