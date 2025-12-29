
import React, { useState } from 'react';
import { X, Lightbulb, Sparkles, Wand2, ArrowRight, Loader2, CheckCircle2, Zap, Heart, Star, CreditCard, ShieldCheck, Lock, Coffee, Wallet, Users, Gift, LayoutGrid } from 'lucide-react';
import { solveLifeProblem } from '../services/geminiService';
import { MagicSolution } from '../types';
import { soundManager } from '../services/soundManager';

interface MagicSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SolverMode = 'general' | 'host' | 'budget' | 'peace' | 'gift';
type SolverState = 'MODE_SELECT' | 'INPUT' | 'LOADING' | 'PAYMENT' | 'PROCESSING_PAYMENT' | 'SUCCESS';

interface ModuleConfig {
  id: SolverMode;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  emoji: string;
}

const MODULES: ModuleConfig[] = [
  { id: 'general', label: 'Life Navigator', desc: 'Καθημερινή οργάνωση & παραγωγικότητα', icon: <LayoutGrid />, color: 'from-blue-600 to-indigo-600', emoji: '🧭' },
  { id: 'host', label: 'Host Master', desc: 'Τραπέζια, φιλοξενία & γιορτινή ατμόσφαιρα', icon: <Coffee />, color: 'from-orange-600 to-red-600', emoji: '🍗' },
  { id: 'budget', label: 'Budget Guardian', desc: 'Οικονομικές λύσεις & έξυπνη εξοικονόμηση', icon: <Wallet />, color: 'from-emerald-600 to-teal-600', emoji: '💰' },
  { id: 'peace', label: 'Peace Maker', desc: 'Οικογενειακή διπλωματία & κοινωνική ηρεμία', icon: <Users />, color: 'from-purple-600 to-pink-600', emoji: '🤝' },
  { id: 'gift', label: 'Gift Guru', desc: 'Εύρεση δώρων για τις πιο δύσκολες περιπτώσεις', icon: <Gift />, color: 'from-yellow-600 to-orange-500', emoji: '🎁' }
];

const MagicSolverModal: React.FC<MagicSolverModalProps> = ({ isOpen, onClose }) => {
  const [problem, setProblem] = useState('');
  const [selectedMode, setSelectedMode] = useState<SolverMode | null>(null);
  const [solution, setSolution] = useState<MagicSolution | null>(null);
  const [state, setState] = useState<SolverState>('MODE_SELECT');

  if (!isOpen) return null;

  const handleSelectMode = (mode: SolverMode) => {
    soundManager.playClick();
    setSelectedMode(mode);
    setState('INPUT');
  };

  const handleInitialSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim() || state === 'LOADING' || !selectedMode) return;

    setState('LOADING');
    soundManager.playClick();
    try {
      const result = await solveLifeProblem(problem, selectedMode);
      setSolution({ ...result, modeLabel: MODULES.find(m => m.id === selectedMode)?.label });
      // Wait a bit for dramatic effect
      setTimeout(() => {
        setState('PAYMENT');
        soundManager.playGiftOpen();
      }, 1500);
    } catch (error) {
      console.error(error);
      setState('INPUT');
    }
  };

  const handlePayment = () => {
    setState('PROCESSING_PAYMENT');
    soundManager.playClick();
    
    // Simulate bank authorization
    setTimeout(() => {
      setState('SUCCESS');
      soundManager.playGiftOpen();
    }, 2500);
  };

  const reset = () => {
    setProblem('');
    setSolution(null);
    setSelectedMode(null);
    setState('MODE_SELECT');
  };

  const activeModule = MODULES.find(m => m.id === selectedMode);

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className={`bg-gradient-to-br from-[#020617] via-[#1e1b4b] to-[#020617] w-full max-w-2xl rounded-[3rem] border-2 shadow-[0_0_100px_rgba(234,179,8,0.2)] relative overflow-hidden flex flex-col animate-slide-up transition-all duration-500 ${activeModule ? 'border-indigo-500/30' : 'border-yellow-500/20'}`}>
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-xl transition-all duration-500 ${activeModule ? 'bg-indigo-600' : 'bg-yellow-500 shadow-yellow-500/20'}`}>
              {activeModule ? activeModule.icon : <Lightbulb className="text-black" size={28} />}
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">
                {activeModule ? activeModule.label : 'Miracle Solver'}
              </h2>
              <p className="text-yellow-400/40 text-[10px] uppercase tracking-[0.3em] font-black">
                {activeModule ? activeModule.desc : 'AI Life Solutions'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar min-h-[500px] flex flex-col justify-center">
          
          {/* STAGE 0: MODE SELECT */}
          {state === 'MODE_SELECT' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-festive text-white mb-2">Επίλεξε Μαγική Ενότητα</h3>
                <p className="text-indigo-300/40 text-xs italic">Πώς μπορούμε να κάνουμε τη ζωή σου ευκολότερη σήμερα;</p>
              </div>
              <div className="grid gap-4">
                {MODULES.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => handleSelectMode(m.id)}
                    className="flex items-center gap-6 p-5 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all text-left group"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${m.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {m.emoji}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black text-white text-base leading-tight">{m.label}</h4>
                      <p className="text-[10px] text-indigo-300/60 font-bold uppercase tracking-wider">{m.desc}</p>
                    </div>
                    <ArrowRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 1: INPUT */}
          {state === 'INPUT' && (
            <div className="flex flex-col items-center text-center max-w-md mx-auto animate-fade-in">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-2xl bg-gradient-to-tr ${activeModule?.color}`}>
                <span className="text-4xl">{activeModule?.emoji}</span>
              </div>
              <h3 className="text-3xl font-festive text-white mb-4">Τι σε απασχολεί;</h3>
              <p className="text-indigo-200/60 leading-relaxed italic mb-8 text-sm px-6">
                "Περίγραψε το πρόβλημα στην ενότητα {activeModule?.label} και η AI θα δημιουργήσει ένα μαγικό πλάνο."
              </p>

              <form onSubmit={handleInitialSolve} className="w-full space-y-6">
                <textarea 
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder={`π.χ. ${activeModule?.id === 'budget' ? 'Πώς να κάνω δώρα σε 20 άτομα με 100€;' : 'Περίγραψε εδώ...'}`}
                  className="w-full h-32 bg-black/40 border-2 border-indigo-500/20 rounded-[2rem] p-6 text-white placeholder:text-indigo-300/20 focus:border-yellow-500/50 outline-none transition-all shadow-inner resize-none text-sm"
                />
                <div className="flex gap-4">
                   <button 
                    type="button"
                    onClick={() => setState('MODE_SELECT')}
                    className="flex-grow bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl transition-all border border-white/10 uppercase tracking-widest text-[10px]"
                  >
                    Πίσω
                  </button>
                  <button 
                    type="submit"
                    disabled={!problem.trim()}
                    className="flex-[2] bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 text-black font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                  >
                    <Wand2 size={18} /> Δημιουργία Λύσης
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STAGE 2: LOADING AI */}
          {state === 'LOADING' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="relative mb-8">
                <Loader2 className="animate-spin text-indigo-500" size={80} />
                <Sparkles className="absolute inset-0 m-auto text-yellow-400 animate-pulse" size={32} />
              </div>
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Υπολογισμός Θαύματος...</p>
              <p className="text-indigo-300/40 text-[10px] mt-2 italic">Εξειδικευμένη ανάλυση στο module {activeModule?.label}</p>
            </div>
          )}

          {/* STAGE 3: PAYMENT GATEWAY */}
          {state === 'PAYMENT' && (
            <div className="flex flex-col items-center animate-pop-in">
              <div className="bg-white/5 border border-yellow-500/30 rounded-[2.5rem] p-8 w-full max-w-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl" />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Premium {activeModule?.label} Solution</span>
                    <h4 className="text-xl font-bold text-white mt-1">Ξεκλείδωμα Λύσης</h4>
                  </div>
                  <div className="bg-yellow-500 text-black font-black px-3 py-1 rounded-lg text-lg">
                    1.99€
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-indigo-200/60 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Εξειδικευμένη {activeModule?.label} Ανάλυση</span>
                  </div>
                  <div className="flex items-center gap-3 text-indigo-200/60 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Practical + Festive + AI Plan</span>
                  </div>
                  <div className="flex items-center gap-3 text-indigo-200/60 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Άμεση Πρόσβαση στο Αρχείο</span>
                  </div>
                </div>

                <button 
                  onClick={handlePayment}
                  className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-yellow-50 transition-all active:scale-95 shadow-2xl text-xs uppercase"
                >
                  <CreditCard size={18} /> Πληρωμή & Ξεκλείδωμα
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-[8px] text-white/20 uppercase font-black">
                  <ShieldCheck size={12} /> Secure Encryption SSL
                </div>
              </div>
              <p className="mt-6 text-indigo-300/40 text-[10px] uppercase font-bold cursor-pointer hover:text-white transition-colors" onClick={reset}>Ακύρωση & Επιστροφή</p>
            </div>
          )}

          {/* STAGE 4: PROCESSING PAYMENT */}
          {state === 'PROCESSING_PAYMENT' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-8 relative">
                 <Lock className="text-indigo-400 animate-bounce" size={32} />
                 <div className="absolute inset-0 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Εξουσιοδότηση Τράπεζας...</h4>
              <p className="text-indigo-300/40 text-[10px] mt-2">Παρακαλώ μην κλείσετε το παράθυρο</p>
            </div>
          )}

          {/* STAGE 5: SUCCESS & REVEAL */}
          {state === 'SUCCESS' && solution && (
            <div className="space-y-6 animate-pop-in">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="text-7xl mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-bounce-subtle">
                  {solution.emoji}
                </div>
                <div className="flex items-center gap-2 mb-3">
                   <div className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-[0.2em]">
                    Payment Success
                  </div>
                  <div className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-[0.2em]">
                    {solution.modeLabel}
                  </div>
                </div>
                <p className="text-lg font-bold text-white leading-tight">"{solution.problem}"</p>
              </div>

              <div className="grid gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] relative group">
                  <div className="absolute -top-3 left-6 bg-indigo-600 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white">
                    Πρακτική Συμβουλή
                  </div>
                  <p className="text-xs text-indigo-100 italic mt-1 leading-relaxed">{solution.practicalStep}</p>
                </div>

                <div className="bg-red-900/10 border border-red-500/20 p-5 rounded-[2rem] relative group">
                  <div className="absolute -top-3 left-6 bg-red-600 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white">
                    Γιορτινό Κόλπο
                  </div>
                  <p className="text-xs text-red-100 italic mt-1 leading-relaxed">{solution.festiveTwist}</p>
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-[2rem] relative group">
                  <div className="absolute -top-3 left-6 bg-yellow-500 px-4 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-black">
                    AI Life Hack
                  </div>
                  <p className="text-xs text-yellow-100 font-bold mt-1 leading-relaxed">{solution.lifeHack}</p>
                </div>
              </div>

              <button 
                onClick={reset}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl transition-all border border-white/10 uppercase tracking-widest text-[9px] mt-4"
              >
                Νέο Πρόβλημα
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-black/40 border-t border-white/5 text-center">
          <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-black flex items-center justify-center gap-2">
            <Heart size={10} className="text-red-500" /> Premium AI Module v2.0 <Heart size={10} className="text-red-500" />
          </p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        @keyframes pop-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default MagicSolverModal;
