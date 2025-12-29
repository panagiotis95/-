
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Loader2, Gift, Heart, Star, Wand2, MessageCircle, ShoppingBag, Zap, Globe, Thermometer, Cpu, Signal, ShieldCheck, Tag, Search, History, Database, CloudSnow, Wind, Activity, UserCircle2, Ghost, Smile } from 'lucide-react';
import { getPersonalizedGiftSuggestions } from '../services/geminiService';
import { ChristmasIdea } from '../types';
import { soundManager } from '../services/soundManager';

interface AIGiftAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveIdea: (idea: ChristmasIdea) => void;
}

type AIMode = 'elf' | 'santa' | 'grinch';

const QUICK_TAGS = [
  { label: 'Για Παιδιά', icon: '🧸' },
  { label: 'Gadgets', icon: '📱' },
  { label: 'Cozy / Σπίτι', icon: '🏠' },
  { label: 'Μαγειρική', icon: '🍳' },
  { label: 'Budget Φιλικά', icon: '💰' }
];

const AIGiftAssistant: React.FC<AIGiftAssistantProps> = ({ isOpen, onClose, onSaveIdea }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<ChristmasIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>('elf');
  const [terminalLines, setTerminalLines] = useState<string[]>(['> Initializing SleighNet...', '> Link established: NorthPole-Primary']);
  
  const [metrics, setMetrics] = useState({ 
    temp: -28.4, 
    energy: 98, 
    load: 12, 
    snowDensity: 42,
    elfEfficiency: 94
  });

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setMetrics(prev => ({
          temp: -25 - Math.random() * 10,
          energy: 95 + Math.random() * 5,
          load: 10 + Math.random() * 40,
          snowDensity: 30 + Math.random() * 30,
          elfEfficiency: 90 + Math.random() * 10
        }));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModeChange = (mode: AIMode) => {
    soundManager.playClick();
    setAiMode(mode);
    setTerminalLines(prev => [...prev, `> Mode switched to: ${mode.toUpperCase()}`]);
  };

  const handleSubmit = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = customInput || input;
    if (!finalInput.trim() || isLoading) return;

    setIsLoading(true);
    setHasStarted(true);
    soundManager.playClick();
    
    try {
      const results = await getPersonalizedGiftSuggestions(`${finalInput} (σε ύφος ${aiMode === 'grinch' ? 'αστείο/ειρωνικό' : aiMode === 'santa' ? 'σοφό/πατρικό' : 'παιχνιδιάρικο'})`);
      setSuggestions(results);
      soundManager.playGiftOpen();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="bg-gradient-to-br from-indigo-950 via-[#0a0a2e] to-indigo-950 w-full max-w-2xl h-[88vh] rounded-[3.5rem] border-2 border-indigo-500/30 shadow-[0_0_100px_rgba(79,70,229,0.3)] relative flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-xl">
              <Wand2 className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">Μαγικός Βοηθός</h2>
              <p className="text-indigo-300/40 text-[10px] uppercase tracking-[0.3em] font-black">AI Mode: {aiMode.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* AI MODE SWITCHER ICONS */}
             <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button onClick={() => handleModeChange('elf')} className={`p-2 rounded-xl transition-all ${aiMode === 'elf' ? 'bg-indigo-600 text-white' : 'text-white/20 hover:text-white'}`} title="Elf Mode"><Smile size={18} /></button>
                <button onClick={() => handleModeChange('santa')} className={`p-2 rounded-xl transition-all ${aiMode === 'santa' ? 'bg-red-600 text-white' : 'text-white/20 hover:text-white'}`} title="Santa Mode"><UserCircle2 size={18} /></button>
                <button onClick={() => handleModeChange('grinch')} className={`p-2 rounded-xl transition-all ${aiMode === 'grinch' ? 'bg-emerald-600 text-white' : 'text-white/20 hover:text-white'}`} title="Grinch Mode"><Ghost size={18} /></button>
             </div>
             <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white">
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar relative z-10">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto animate-fade-in">
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 animate-bounce-subtle border border-white/10 relative">
                <Database size={48} className="text-indigo-400" />
                <Sparkles className="absolute -top-2 -right-2 text-yellow-400" size={24} />
              </div>
              <h3 className="text-4xl font-festive text-white mb-4">Τι ψάχνεις φέτος;</h3>
              <p className="text-indigo-200/60 leading-relaxed italic mb-10">
                "Διάλεξε ένα ύφος πάνω δεξιά και πες μου τι δώρο ψάχνεις!"
              </p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_TAGS.map(tag => (
                  <button 
                    key={tag.label}
                    onClick={() => { setInput(tag.label); handleSubmit(undefined, tag.label); }}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all text-white/60 hover:text-white"
                  >
                    <span>{tag.icon}</span> {tag.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
                  <div className="relative">
                    <Loader2 size={64} className="text-indigo-500 animate-spin" />
                    <CloudSnow className="absolute inset-0 m-auto text-white/30" size={32} />
                  </div>
                  <p className="text-indigo-200/40 text-sm font-black uppercase tracking-widest animate-pulse">Αναλύοντας Δεδομένα...</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {suggestions.map((idea, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-start gap-6 hover:bg-white/10 transition-all animate-pop-in group"
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <span className="text-5xl drop-shadow-glow group-hover:scale-110 transition-transform">{idea.emoji}</span>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xl font-bold text-white mb-2">{idea.title}</h4>
                        <p className="text-sm text-indigo-100/60 italic leading-relaxed mb-4">"{idea.description}"</p>
                        <button 
                          onClick={() => onSaveIdea(idea)}
                          className="flex items-center gap-2 bg-indigo-600/30 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-indigo-500/20"
                        >
                          <Heart size={14} /> Αποθήκευση
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* QUANTUM DASHBOARD FOOTER */}
        <div className="p-8 bg-black/40 border-t border-white/10 relative z-10">
          <form onSubmit={handleSubmit} className="relative group mb-8">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Περίγραψε τον παραλήπτη..."
              className="w-full bg-indigo-950/20 border-2 border-indigo-500/20 rounded-[2rem] p-6 pr-20 text-white placeholder:text-indigo-300/20 focus:border-indigo-500 outline-none transition-all shadow-inner text-sm"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl transition-all active:scale-90"
            >
              <Send size={20} />
            </button>
          </form>

          <div className="grid grid-cols-5 gap-3">
             <Metric icon={<Thermometer size={14} />} label="N.P. Temp" value={`${metrics.temp.toFixed(1)}°C`} color="blue" />
             <Metric icon={<Cpu size={14} />} label="AI Load" value={`${Math.round(metrics.load)}%`} color="purple" />
             <Metric icon={<Activity size={14} />} label="Elf Eff." value={`${Math.round(metrics.elfEfficiency)}%`} color="emerald" />
             <Metric icon={<Signal size={14} />} label="Sync" value="LIVE" color="cyan" pulse />
             <Metric icon={<ShieldCheck size={14} />} label="Security" value="AES-256" color="yellow" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ icon, label, value, color, pulse }: { icon: any, label: string, value: string, color: string, pulse?: boolean }) => {
  const colors: Record<string, string> = { blue: 'text-blue-400', purple: 'text-purple-400', emerald: 'text-emerald-400', cyan: 'text-cyan-400', yellow: 'text-yellow-400' };
  return (
    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center gap-1 group hover:bg-white/10 transition-colors">
       <div className={`${colors[color]} ${pulse ? 'animate-pulse' : ''}`}>{icon}</div>
       <span className="text-white font-black text-[10px]">{value}</span>
       <span className="text-[6px] text-white/20 uppercase font-black">{label}</span>
    </div>
  );
};

export default AIGiftAssistant;
