
import React, { useState } from 'react';
import { X, Sparkles, Jar2, Loader2, Quote, Heart, Stars, History } from 'lucide-react';
import { generateMemoryReflection } from '../services/geminiService';
import { ChristmasIdea } from '../types';
import { soundManager } from '../services/soundManager';

interface MemoryJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChristmasIdea[];
}

const MemoryJarModal: React.FC<MemoryJarModalProps> = ({ isOpen, onClose, history }) => {
  const [reflection, setReflection] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleReflect = async () => {
    if (history.length === 0 || isLoading) return;
    setIsLoading(true);
    soundManager.playClick();
    try {
      const text = await generateMemoryReflection(history);
      setReflection(text);
      soundManager.playGiftOpen();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-fade-in">
      <div className="bg-gradient-to-b from-indigo-900 via-[#0a0a2e] to-indigo-950 w-full max-w-2xl rounded-[3.5rem] border-2 border-indigo-500/30 shadow-[0_0_100px_rgba(79,70,229,0.3)] relative overflow-hidden flex flex-col animate-slide-up">
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl">
              <History className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">Το Βάζο των Αναμνήσεων</h2>
              <p className="text-indigo-400/40 text-[10px] uppercase tracking-[0.3em] font-black">AI Season Reflection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 flex-grow overflow-y-auto custom-scrollbar flex flex-col items-center">
           {!reflection ? (
             <div className="text-center space-y-8 animate-fade-in">
                <div className="relative inline-block">
                   <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border-2 border-dashed border-indigo-500/30">
                      <Sparkles size={64} className="text-indigo-400/20" />
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                      <Heart size={40} className="text-red-500/40 fill-current" />
                   </div>
                </div>
                <h3 className="text-2xl font-festive text-white">Ας θυμηθούμε τις στιγμές μας...</h3>
                <p className="text-indigo-200/60 italic text-sm max-w-sm mx-auto leading-relaxed">
                  "Η AI θα μελετήσει όλες τις ιδέες που σου άρεσαν και θα φτιάξει ένα μοναδικό γιορτινό κείμενο μόνο για σένα."
                </p>
                <button 
                  onClick={handleReflect}
                  disabled={history.length === 0 || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black px-10 py-5 rounded-[2rem] shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-3"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Stars size={20} />}
                  Δημιουργία Ανασκόπησης
                </button>
                {history.length === 0 && <p className="text-red-400/60 text-[9px] uppercase font-black">Πρέπει να βρεις μερικές ιδέες πρώτα!</p>}
             </div>
           ) : (
             <div className="w-full space-y-8 animate-pop-in">
                <div className="bg-white/5 border border-indigo-500/20 p-10 rounded-[3rem] relative">
                   <Quote className="absolute -top-4 -left-4 text-indigo-500 opacity-20" size={64} />
                   <p className="text-xl text-indigo-100 leading-relaxed italic whitespace-pre-wrap font-serif">
                     {reflection}
                   </p>
                   <Quote className="absolute -bottom-4 -right-4 text-indigo-500 opacity-20 rotate-180" size={64} />
                </div>
                <button onClick={() => setReflection('')} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase rounded-2xl transition-all border border-white/10">Νέα Ανασκόπηση</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MemoryJarModal;
