
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, Zap, Coffee, Package, Loader2, Sparkles, Wand2, Hammer, Cog, Beaker, Play, Share2, TrendingUp, Activity, Truck, Signal } from 'lucide-react';
// Fixed: ToyBlueprint is now correctly exported from geminiService
import { generateToyBlueprint, ToyBlueprint } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

const BELT_ITEMS = ['🎁', '📦', '🧸', '🚲', '🎮', '🚂', '🥁', '🛹', '🎄', '🕯️', '🍪', '🥛'];

interface StatHistory {
  production: number[];
  happiness: number[];
  cocoa: number[];
  magic: number[];
}

const ElfFactory: React.FC = () => {
  const [blueprint, setBlueprint] = useState<ToyBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isOverdrive, setIsOverdrive] = useState(false);
  
  const [stats, setStats] = useState({
    production: 1420,
    happiness: 94,
    cocoaConsumed: 480,
    magicEnergy: 88
  });

  const [history, setHistory] = useState<StatHistory>({
    production: Array(20).fill(1420),
    happiness: Array(20).fill(94),
    cocoa: Array(20).fill(480),
    magic: Array(20).fill(88)
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const nextStats = {
          production: prev.production + (isOverdrive ? 5 : 1),
          happiness: Math.max(70, Math.min(100, prev.happiness + (Math.random() * 2 - 1))),
          cocoaConsumed: prev.cocoaConsumed + (isOverdrive ? 0.3 : 0.1),
          magicEnergy: Math.max(5, prev.magicEnergy - (isOverdrive ? 0.4 : 0.05))
        };

        setHistory(h => ({
          production: [...h.production.slice(1), nextStats.production],
          happiness: [...h.happiness.slice(1), nextStats.happiness],
          cocoa: [...h.cocoa.slice(1), nextStats.cocoaConsumed],
          magic: [...h.magic.slice(1), nextStats.magicEnergy]
        }));

        return nextStats;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isOverdrive]);

  const handleRequestBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    soundManager.playClick();
    try {
      const result = await generateToyBlueprint(userInput);
      setBlueprint(result);
      soundManager.playGiftOpen();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOverdrive = () => {
    soundManager.playClick();
    soundManager.playEngineRev();
    setIsOverdrive(!isOverdrive);
  };

  return (
    <section className="w-full max-w-6xl mx-auto my-32 px-4 animate-fade-in">
      <div className="bg-[#0f172a]/60 backdrop-blur-2xl rounded-[3rem] border-4 border-indigo-500/20 p-8 md:p-12 shadow-[0_0_80px_rgba(79,70,229,0.2)] relative overflow-hidden group">
        
        {/* Decorative Gears */}
        <div className="absolute top-10 -right-10 opacity-10 animate-spin-slow pointer-events-none">
          <Cog size={200} className="text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col gap-12">
          
          {/* Header HUD */}
          <div className="flex flex-wrap items-center justify-between gap-8 border-b border-white/5 pb-8">
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-4 rounded-[2rem] shadow-xl shadow-indigo-500/30">
                <Hammer className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-4xl font-festive text-white">Elf Factory & Design Lab</h2>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-indigo-300/40 text-[8px] uppercase tracking-[0.4em] font-black">Production Status:</p>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Signal size={10} className="text-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase">Dock Connected</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-8">
              <StatItem icon={<Package size={14} />} label="Production" value={stats.production.toLocaleString()} color="emerald" data={history.production} />
              <StatItem icon={<Truck size={14} />} label="Loading Dock" value="ACTIVE" color="indigo" data={history.production} />
              <StatItem icon={<Coffee size={14} />} label="Cocoa" value={`${Math.floor(stats.cocoaConsumed)}L`} color="orange" data={history.cocoa} />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Interactive Assembly Line */}
            <div className="space-y-8">
              <div className="bg-black/40 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-3">
                    <Play size={16} className="text-indigo-400 animate-pulse" /> Live Assembly Line
                  </h3>
                  <button onClick={toggleOverdrive} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isOverdrive ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                    {isOverdrive ? 'Overdrive ON' : 'Standard Mode'}
                  </button>
                </div>

                <div className="relative h-24 bg-indigo-950/20 rounded-2xl border-2 border-white/5 overflow-hidden flex items-center">
                   <div className={`flex gap-12 ${isOverdrive ? 'animate-belt-fast' : 'animate-belt'}`}>
                      {[...BELT_ITEMS, ...BELT_ITEMS, ...BELT_ITEMS].map((item, i) => (
                        <span key={i} className="text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] hover:scale-125 transition-transform cursor-pointer">{item}</span>
                      ))}
                   </div>
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,1)] z-10" />
                </div>

                <div className="mt-8 flex gap-4">
                  <div className="flex-grow bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                    <Beaker size={20} className="text-indigo-400" />
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase">Status</p>
                      <p className="text-xs font-bold text-white">Quantum Packaging...</p>
                    </div>
                  </div>
                  <div className="bg-indigo-600/20 px-6 py-4 rounded-2xl border border-indigo-500/20 flex flex-col items-center justify-center">
                    <p className="text-[14px] font-black text-indigo-400 leading-none">{stats.happiness.toFixed(1)}%</p>
                    <p className="text-[8px] font-bold text-indigo-300/40 uppercase">Elf Joy</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600/10 p-8 rounded-[2.5rem] border border-indigo-500/30">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                  <Wand2 className="text-indigo-400" size={20} /> Request Custom Blueprint
                </h4>
                <form onSubmit={handleRequestBlueprint} className="relative">
                  <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="π.χ. 'Ένα ρομπότ που φτιάχνει ζεστή σοκολάτα'..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-16 text-white text-sm focus:border-indigo-500 outline-none transition-all shadow-inner" />
                  <button disabled={isLoading || !userInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 disabled:opacity-30">
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: AI Blueprint Display */}
            <div className="relative">
               {blueprint ? (
                 <div className="bg-white/5 border-2 border-dashed border-indigo-500/30 rounded-[3rem] p-10 h-full flex flex-col animate-pop-in relative">
                    <div className="absolute top-6 right-6 flex gap-2">
                       <button className="p-2 text-white/30 hover:text-white transition-colors"><Share2 size={18} /></button>
                    </div>
                    <div className="flex flex-col items-center text-center mb-8">
                       <div className="text-8xl mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-float">{blueprint.emoji}</div>
                       <h3 className="text-3xl font-festive text-indigo-300 mb-2">{blueprint.name}</h3>
                       <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400/60 uppercase tracking-widest bg-indigo-500/10 px-4 py-1 rounded-full">
                          <Settings size={12} /> Approved by Head Elf
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black text-white/20 uppercase mb-2">Required Materials</p>
                          <div className="flex flex-wrap gap-2">
                             {blueprint.materials.map((m, i) => (
                               <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-indigo-200">{m}</span>
                             ))}
                          </div>
                       </div>
                       <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                          <p className="text-[9px] font-black text-white/20 uppercase mb-2">Magic Intensity</p>
                          <div className="flex items-end gap-2">
                             <span className="text-2xl font-black text-indigo-400 leading-none">{blueprint.magicLevel}</span>
                             <div className="h-1 flex-grow bg-white/10 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-indigo-500" style={{ width: `${blueprint.magicLevel}%` }} />
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-auto bg-indigo-600/5 p-6 rounded-3xl border border-indigo-500/10 italic">
                       <p className="text-sm text-indigo-100/60 leading-relaxed">
                         <span className="text-indigo-400 font-black not-italic text-xs block mb-1">Elf's Secret Note:</span>
                         "{blueprint.elfNote}"
                       </p>
                    </div>
                 </div>
               ) : (
                 <div className="bg-black/20 border-2 border-dashed border-white/5 rounded-[3rem] p-12 h-full flex flex-col items-center justify-center text-center opacity-30">
                    <Hammer size={80} className="text-indigo-400 mb-6" />
                    <p className="text-xl font-festive text-white">Enter an idea to generate a unique toy blueprint</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes belt { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes belt-fast { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-belt { animation: belt 15s linear infinite; }
        .animate-belt-fast { animation: belt-fast 5s linear infinite; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 30;
  const width = 80;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const colors: Record<string, string> = { emerald: '#10b981', pink: '#ec4899', indigo: '#6366f1', orange: '#f97316' };
  return (
    <div className="mt-2 h-8 w-20 opacity-50 overflow-visible">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs><linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={colors[color]} stopOpacity="0.5" /><stop offset="100%" stopColor={colors[color]} stopOpacity="0" /></linearGradient></defs>
        <path d={`M 0,${height} L ${points} L ${width},${height} Z`} fill={`url(#grad-${color})`} className="transition-all duration-1000" />
        <polyline fill="none" stroke={colors[color]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} className="transition-all duration-1000" />
      </svg>
    </div>
  );
};

const StatItem = ({ icon, label, value, color, data }: { icon: React.ReactNode, label: string, value: string, color: string, data: number[] }) => {
  const colorClasses: Record<string, string> = { emerald: 'text-emerald-400 bg-emerald-400/10', pink: 'text-pink-400 bg-pink-400/10', indigo: 'text-indigo-400 bg-indigo-400/10', orange: 'text-orange-400 bg-orange-400/10' };
  return (
    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
      <div className={`p-2.5 rounded-xl ${colorClasses[color].split(' ')[1]} ${colorClasses[color].split(' ')[0]}`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1">{label}</span>
        <span className={`text-sm font-black ${colorClasses[color].split(' ')[0]} leading-none`}>{value}</span>
        <Sparkline data={data} color={color} />
      </div>
    </div>
  );
};

export default ElfFactory;
