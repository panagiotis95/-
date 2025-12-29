
import React, { useState } from 'react';
import { Sparkles, X, Wand2, Star, Heart, Flame, Loader2, Sparkle } from 'lucide-react';
// Fixed: MiracleIdea is now correctly exported from geminiService
import { generateMiracleIdea, MiracleIdea } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

const MiracleSpark: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [miracle, setMiracle] = useState<MiracleIdea | null>(null);

  const handleTrigger = async () => {
    if (isLoading) return;
    setIsLoading(true);
    soundManager.playClick();
    
    try {
      const idea = await generateMiracleIdea();
      setMiracle(idea);
      setIsOpen(true);
      soundManager.playGiftOpen();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-12 z-[100]">
      {/* Floating Artifact */}
      <button 
        onClick={handleTrigger}
        disabled={isLoading}
        className="relative group transition-all hover:scale-110 active:scale-95"
      >
        <div className={`absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl transition-all duration-1000 ${isLoading ? 'scale-150 animate-pulse' : 'group-hover:scale-125'}`} />
        
        <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-indigo-900 via-indigo-600 to-purple-500 rounded-full border-2 border-white/20 shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
          
          {isLoading ? (
            <div className="flex flex-col items-center animate-fade-in">
              <Loader2 className="text-white animate-spin" size={32} />
            </div>
          ) : (
            <div className="relative">
              <Sparkles className="text-white group-hover:rotate-12 transition-transform" size={32} />
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              </div>
            </div>
          )}
        </div>
        
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 flex items-center gap-2">
            Generate Miracle <Wand2 size={12} />
          </span>
        </div>
      </button>

      {/* Portal Modal */}
      {isOpen && miracle && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-gradient-to-br from-indigo-950 via-purple-950 to-[#020617] w-full max-w-2xl rounded-[3.5rem] border-2 border-yellow-500/20 shadow-[0_0_100px_rgba(234,179,8,0.2)] p-10 md:p-16 relative overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-10 relative">
                <div className="text-8xl md:text-9xl drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-float">
                  {miracle.emoji}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <Star size={180} className="text-yellow-400 animate-spin-slow" />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-festive text-yellow-100 mb-6 drop-shadow-lg">
                {miracle.title}
              </h2>

              <div className="w-full max-w-md mx-auto space-y-8">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 relative">
                  <span className="absolute -top-3 left-8 bg-indigo-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-indigo-400">
                    The Miracle Recipe
                  </span>
                  <div className="flex flex-wrap justify-center gap-3">
                    {miracle.recipe.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 text-xs font-bold text-indigo-200">
                        <Sparkle size={12} className="text-yellow-400" /> {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-lg md:text-xl text-blue-100/80 leading-relaxed italic">
                    "{miracle.description}"
                  </p>
                  
                  <div className="flex flex-col items-center gap-4 py-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400/40">
                      <Heart size={14} className="fill-current" /> The Miracle Effect
                    </div>
                    <p className="text-2xl font-festive text-yellow-500">
                      {miracle.miracleEffect}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="mt-8 bg-white/5 hover:bg-white/10 text-white font-black px-12 py-4 rounded-2xl transition-all border border-white/10 uppercase tracking-widest text-xs"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MiracleSpark;
