import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingBasket, Sparkles, Loader2, Plus, Trash2, CheckCircle2, Copy, Check, Send, LayoutList, Package, Apple, Beef, Cookie, Wine, Utensils, Zap, Wallet, TrendingUp, ChevronRight } from 'lucide-react';
import { generateFestiveShoppingList, suggestMissingShoppingItems } from '../services/geminiService';
import { ShoppingItem } from '../types';
import { soundManager } from '../services/soundManager';

interface FestiveShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { id: 'trad', label: 'Traditional Dinner', icon: '🍗', prompt: 'Παραδοσιακό Χριστουγεννιάτικο Δείπνο για 6 άτομα' },
  { id: 'vegan', label: 'Vegan Magic', icon: '🥗', prompt: 'Vegan Χριστουγεννιάτικο μενού για 4 άτομα' },
  { id: 'party', label: 'Cocktail Night', icon: '🍸', prompt: 'Party με finger food και ποτά για 10 άτομα' },
  { id: 'kids', label: 'Kids Special', icon: '🍭', prompt: 'Παιδικό χριστουγεννιάτικο πάρτι με γλυκά και σνακ' }
];

const FestiveShoppingModal: React.FC<FestiveShoppingModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('festive_shopping_list_v2');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('festive_shopping_list_v2', JSON.stringify(items));
  }, [items]);

  const handleGenerate = async (query: string) => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    soundManager.playClick();
    try {
      const newItems = await generateFestiveShoppingList(query);
      setItems(prev => [...newItems, ...prev]);
      setPrompt('');
      soundManager.playGiftOpen();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggest = async () => {
    if (items.length === 0 || isSuggesting) return;
    setIsSuggesting(true);
    soundManager.playClick();
    try {
      const suggestions = await suggestMissingShoppingItems(items);
      setItems(prev => [...prev, ...suggestions]);
      soundManager.playGiftOpen();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isBought: !item.isBought } : item
    ));
    soundManager.playClick();
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    soundManager.playClick();
  };

  const clearList = () => {
    if (window.confirm("Θέλεις σίγουρα να διαγράψεις όλη τη λίστα;")) {
      setItems([]);
      soundManager.playClick();
    }
  };

  const estimatedTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [items]);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('κρέας') || cat.includes('meat') || cat.includes('beef')) return <Beef size={16} />;
    if (cat.includes('φρούτ') || cat.includes('λαχαν') || cat.includes('veg') || cat.includes('produce')) return <Apple size={16} />;
    if (cat.includes('γλυκ') || cat.includes('sweet') || cat.includes('cookie')) return <Cookie size={16} />;
    if (cat.includes('ποτά') || cat.includes('wine') || cat.includes('drink')) return <Wine size={16} />;
    if (cat.includes('διακόσμηση') || cat.includes('decor')) return <Sparkles size={16} />;
    return <Package size={16} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className="bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] w-full max-w-5xl h-[90vh] rounded-[3.5rem] border-2 border-emerald-500/30 shadow-[0_0_120px_rgba(16,185,129,0.3)] relative overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header HUD */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="bg-emerald-600 p-4 rounded-3xl shadow-xl shadow-emerald-500/20">
              <ShoppingBasket className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-festive text-white">Festive Logistics Pro</h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-emerald-400/40 text-[10px] uppercase tracking-[0.3em] font-black">Quantum AI Planner v2.4</p>
                <div className="h-1 w-1 rounded-full bg-emerald-500/50" />
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{items.length} Αντικείμενα</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Total Budget Tracker */}
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <Wallet size={18} className="text-emerald-400" />
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Estimated Budget</p>
                <p className="text-xl font-black text-white leading-none">{estimatedTotal.toFixed(2)}€</p>
              </div>
            </div>

            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50 hover:rotate-90">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="flex-grow flex overflow-hidden">
          {/* Left Panel: Controls & Presets */}
          <div className="w-80 border-r border-white/5 bg-black/20 p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={14} /> Quick Menu Presets
               </h3>
               <div className="grid gap-2">
                 {PRESETS.map(p => (
                   <button 
                    key={p.id}
                    onClick={() => handleGenerate(p.prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left group"
                   >
                     <span className="text-2xl group-hover:scale-110 transition-transform">{p.icon}</span>
                     <div>
                       <p className="text-xs font-bold text-white leading-none mb-1">{p.label}</p>
                       <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Generate Plan</p>
                     </div>
                   </button>
                 ))}
               </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Utensils size={14} /> Manual Add
              </h3>
              <form onSubmit={e => { e.preventDefault(); handleGenerate(prompt); }} className="relative">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Τι ψάχνεις; π.χ. 'Υλικά για κουλουράκια'..."
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-emerald-500 transition-all shadow-inner pr-12"
                />
                <button type="submit" disabled={isLoading || !prompt.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                </button>
              </form>
            </div>

            <div className="mt-auto space-y-3">
              <button 
                onClick={handleSuggest}
                disabled={items.length === 0 || isSuggesting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg"
              >
                {isSuggesting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Smart Suggestions
              </button>
              <button 
                onClick={clearList}
                disabled={items.length === 0}
                className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all"
              >
                <Trash2 size={16} /> Clear All
              </button>
            </div>
          </div>

          {/* Right Panel: Categorized List */}
          <div className="flex-grow bg-white/[0.02] p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
            
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 italic">
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8 border-2 border-dashed border-white/20">
                  <LayoutList size={64} className="text-white" />
                </div>
                <h3 className="text-3xl font-festive text-white">Η λίστα σου είναι άδεια...</h3>
                <p className="text-xs uppercase tracking-[0.3em] mt-4 max-w-xs leading-relaxed">
                  Επίλεξε ένα Preset ή πληκτρολόγησε την ανάγκη σου για να ξεκινήσεις το σχεδιασμό.
                </p>
              </div>
            ) : (
              <div className="space-y-12 pb-20">
                {/* Fixed type error where catItems was inferred as unknown by explicitly casting Object.entries(groupedItems) */}
                {(Object.entries(groupedItems) as [string, ShoppingItem[]][]).map(([category, catItems]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                       <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
                         {getCategoryIcon(category)}
                       </div>
                       <h4 className="text-sm font-black text-white uppercase tracking-widest">{category}</h4>
                       <span className="text-[10px] font-bold text-white/20 ml-auto">
                         {catItems.filter(i => i.isBought).length} / {catItems.length} Done
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {catItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center gap-4 p-5 rounded-[2.5rem] border transition-all group ${item.isBought ? 'bg-emerald-500/5 border-emerald-500/10 opacity-40' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:scale-[1.01]'}`}
                        >
                          <button 
                            onClick={() => toggleItem(item.id)}
                            className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${item.isBought ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/10 text-transparent hover:border-emerald-500/50'}`}
                          >
                            <Check size={20} strokeWidth={3} />
                          </button>
                          
                          <div className="flex-grow min-w-0" onClick={() => toggleItem(item.id)}>
                            <div className="flex items-center gap-3">
                              <h4 className={`font-bold text-lg truncate ${item.isBought ? 'line-through text-white/30' : 'text-white'}`}>{item.name}</h4>
                              <span className="bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">{item.quantity}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                             <p className="text-xs font-black text-white">{item.estimatedPrice?.toFixed(2)}€</p>
                             <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Est. Price</p>
                          </div>

                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions Floating Bar */}
            {items.length > 0 && (
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl shadow-black">
                  <button onClick={() => {
                    const text = items.map(i => `${i.isBought ? '[X]' : '[ ]'} ${i.name} (${i.quantity})`).join('\n');
                    navigator.clipboard.writeText(`Η Χριστουγεννιάτικη Λίστα μου:\n\n${text}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-full text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all">
                    {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy List'}
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-2" />
                  <div className="px-6 py-3 flex items-center gap-2 text-white/60">
                     <TrendingUp size={14} className="text-emerald-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Efficiency: {Math.round((items.filter(i => i.isBought).length / items.length) * 100)}%</span>
                  </div>
               </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-black/60 border-t border-white/5 flex justify-between items-center px-12">
           <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black">
             North Pole Global Supply Chain Link v2.0
           </p>
           {items.length > 0 && (
             <div className="flex gap-8">
               <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black text-emerald-400/40 uppercase tracking-widest">Progress</span>
                 <span className="text-xs font-black text-white">{items.filter(i => i.isBought).length} / {items.length} items</span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black text-emerald-400/40 uppercase tracking-widest">Total Weight</span>
                 <span className="text-xs font-black text-white">~12.4 kg</span>
               </div>
             </div>
           )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default FestiveShoppingModal;