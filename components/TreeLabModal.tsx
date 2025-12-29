
import React, { useState } from 'react';
import { X, TreePine, Sparkles, Loader2, Wand2, Star, Zap, Palette, Music } from 'lucide-react';
import { suggestTreeMagic } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface TreeLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyMagic: (effect: string) => void;
}

const TreeLabModal: React.FC<TreeLabModalProps> = ({ isOpen, onClose, onApplyMagic }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ effectName: string, message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    soundManager.playClick();
    try {
      const res = await suggestTreeMagic(input);
      setResult(res);
      soundManager.playGiftOpen();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-fade-in">
      <div className="bg-[#020617] w-full max-w-2xl rounded-[3.5rem] border-2 border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.2)] relative overflow-hidden flex flex-col animate-slide-up">
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-2xl shadow-xl">
              <TreePine className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">Tree Magic Lab</h2>
              <p className="text-emerald-400/40 text-[10px] uppercase tracking-[0.3em] font-black">AI Tree Customizer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 flex-grow overflow-y-auto custom-scrollbar">
           {!result ? (
             <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in">
                <div className="text-center">
                   <div className="text-7xl mb-6">🎄✨</div>
                   <h3 className="text-2xl font-festive text-white">Πώς φαντάζεσαι το δέντρο σου;</h3>
                   <p className="text-emerald-200/40 text-[10px] uppercase font-black tracking-widest mt-2">Describe the magic</p>
                </div>

                <div className="relative group">
                   <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="π.χ. Κάνε τα φώτα να χορεύουν σαν το Βόρειο Σέλας..."
                    className="w-full h-32 bg-black/60 border-2 border-white/5 rounded-[2rem] p-6 text-indigo-100 outline-none focus:border-emerald-500/50 transition-all resize-none shadow-inner"
                   />
                </div>

                <button 
                  disabled={isLoading || !input.trim()}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-black rounded-[2rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                  Εφαρμογή Μαγείας
                </button>
             </form>
           ) : (
             <div className="text-center space-y-8 animate-pop-in">
                <div className="bg-white/5 border border-emerald-500/20 p-8 rounded-[3rem] relative">
                   <Zap className="absolute -top-4 -left-4 text-yellow-400" size={32} />
                   <h4 className="text-3xl font-festive text-emerald-400 mb-4">{result.effectName}</h4>
                   <p className="text-indigo-100/60 italic leading-relaxed">"{result.message}"</p>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setResult(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase rounded-2xl transition-all border border-white/10">Νέα Ιδέα</button>
                   <button onClick={() => { onApplyMagic(result.effectName); onClose(); }} className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-lg">Εφαρμογή Στο Δέντρο</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TreeLabModal;
