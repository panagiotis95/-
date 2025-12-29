
import React, { useState } from 'react';
import { X, Sparkles, Wand2, Loader2, Heart, User, Smile } from 'lucide-react';
import { generateElfName } from '../services/geminiService';
import { ElfNameResult } from '../types';
import { soundManager } from '../services/soundManager';

interface ElfNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ElfNameModal: React.FC<ElfNameModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('Παιχνιδιάρικο');
  const [result, setResult] = useState<ElfNameResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;
    setIsLoading(true);
    soundManager.playClick();
    try {
      const res = await generateElfName(name, personality);
      setResult(res);
      soundManager.playGiftOpen();
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-indigo-950 border-2 border-indigo-500/30 w-full max-w-md rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(79,70,229,0.3)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={24} /></button>
        
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-red-600 p-3 rounded-2xl"><Smile className="text-white" size={24} /></div>
           <h2 className="text-3xl font-festive text-white">Elf Name Generator</h2>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Το Όνομά σου</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="π.χ. Γιάννης" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-indigo-500" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Προσωπικότητα</label>
                <select value={personality} onChange={e => setPersonality(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500">
                  <option>Παιχνιδιάρικο</option>
                  <option>Σοβαρό</option>
                  <option>Λαίμαργο</option>
                  <option>Εφευρετικό</option>
                  <option>Τεμπέλικο</option>
                </select>
             </div>
             <button disabled={!name.trim() || isLoading} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-30">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                Δημιούργησε Μαγεία
             </button>
          </form>
        ) : (
          <div className="text-center space-y-6 animate-pop-in">
             <div className="text-7xl drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-bounce">{result.emoji}</div>
             <div>
                <p className="text-indigo-400 text-[10px] uppercase font-black tracking-[0.3em] mb-1">Το όνομά σου στο εργαστήριο:</p>
                <h3 className="text-4xl font-festive text-white">{result.elfName}</h3>
             </div>
             <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <p className="text-xs text-white font-bold mb-2 uppercase tracking-widest text-indigo-300">Ρόλος: {result.role}</p>
                <p className="text-indigo-100/60 italic text-sm">"{result.backstory}"</p>
             </div>
             <button onClick={() => setResult(null)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/10 text-[10px] uppercase tracking-widest">Δοκίμασε Ξανά</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElfNameModal;
