
import React, { useState, useEffect } from 'react';
import { X, Utensils, Zap, Sparkles, Loader2, CreditCard, ArrowRight, ArrowLeft, ChefHat, ScrollText, Lock, CheckCircle2, Star, Flame, Wallet, Info, ChevronRight, Bookmark, Wand2, Beaker, Hexagon, Compass, Wind, Key, Palette, Eye, Heart, MessageSquare, Send, Smile, RefreshCcw } from 'lucide-react';
import { generateUniqueRecipe, generateStepByStepGuide } from '../services/geminiService';
import { UniqueRecipe, StepByStepGuide, Comment } from '../types';
import { soundManager } from '../services/soundManager';

interface FestiveKitchenAndLogisticsProps {
  isOpen: boolean;
  onClose: () => void;
}

type StudioTab = 'recipes' | 'alchemy' | 'logistics' | 'engineering' | 'sensory' | 'cryptography';

const PRICING_TIERS = [
  { label: 'Δωρεάν', value: 0, icon: '🎁', badge: 'Basic' },
  { label: 'Μικρο-Μαγεία', value: 0.50, icon: '✨', badge: 'Rare' },
  { label: 'Elf Premium', value: 2.50, icon: '🧝', badge: 'Epic' },
  { label: 'Legendary', value: 10.00, icon: '💎', badge: 'Mythic' }
];

const QUICK_EMOJIS = ['✨', '🔥', '🎄', '🍪', '🎁', '🍗', '🧪', '💎', '❄️', '⭐'];

// Use Icon Component types instead of React Elements to avoid internal string conversion errors
const TAB_CONFIG: Record<StudioTab, { label: string, Icon: React.ElementType, color: string, prompt: string, theme: string }> = {
  recipes: { label: 'Secret Kitchen', Icon: ChefHat, color: 'bg-orange-600', prompt: 'π.χ. Ένα γλυκό με σοκολάτα και άρωμα πεύκου...', theme: 'orange' },
  alchemy: { label: 'Potion Lab', Icon: Beaker, color: 'bg-cyan-600', prompt: 'π.χ. Ένα ποτό για "Υπομονή με τους συγγενείς"...', theme: 'cyan' },
  sensory: { label: 'Atmosphere', Icon: Wind, color: 'bg-purple-600', prompt: 'π.χ. Σενάριο "Βόρειο Σέλας στο Σαλόνι"...', theme: 'purple' },
  logistics: { label: 'Logistics', Icon: Compass, color: 'bg-indigo-600', prompt: 'π.χ. Πώς να οργανώσω ένα πάρτι για 50 άτομα...', theme: 'indigo' },
  engineering: { label: '3D Studio', Icon: Hexagon, color: 'bg-emerald-600', prompt: 'π.χ. Ένα Gingerbread House που αιωρείται...', theme: 'emerald' },
  cryptography: { label: 'Crypto Lab', Icon: Key, color: 'bg-amber-600', prompt: 'π.χ. Κυνήγι θησαυρού για ένα δώρο στο κήπο...', theme: 'amber' }
};

const FestiveKitchenAndLogistics: React.FC<FestiveKitchenAndLogisticsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('recipes');
  const [prompt, setPrompt] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(PRICING_TIERS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [unlockedRecipes, setUnlockedRecipes] = useState<UniqueRecipe[]>([]);
  const [unlockedGuides, setUnlockedGuides] = useState<StepByStepGuide[]>([]);
  const [currentView, setCurrentView] = useState<'form' | 'payment' | 'result'>('form');
  const [pendingResult, setPendingResult] = useState<any>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [isLiking, setIsLiking] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const savedRecipes = localStorage.getItem('elf_kitchen_recipes_v4');
    const savedGuides = localStorage.getItem('elf_kitchen_guides_v4');
    if (savedRecipes) setUnlockedRecipes(JSON.parse(savedRecipes));
    if (savedGuides) setUnlockedGuides(JSON.parse(savedGuides));
  }, []);

  useEffect(() => {
    localStorage.setItem('elf_kitchen_recipes_v4', JSON.stringify(unlockedRecipes));
    localStorage.setItem('elf_kitchen_guides_v4', JSON.stringify(unlockedGuides));
  }, [unlockedRecipes, unlockedGuides]);

  if (!isOpen) return null;

  const handleGenerateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    soundManager.playClick();
    try {
      if (activeTab === 'recipes' || activeTab === 'alchemy' || activeTab === 'sensory') {
        const recipe = await generateUniqueRecipe(prompt, selectedPrice.value, activeTab === 'alchemy' ? 'potion' : activeTab === 'sensory' ? 'sensory' : 'cooking');
        setPendingResult({ ...recipe, likes: 0, rating: 0, comments: [] });
      } else {
        const guide = await generateStepByStepGuide(prompt, selectedPrice.value, activeTab === 'engineering' ? 'engineering' : activeTab === 'cryptography' ? 'cryptography' : 'logistics');
        setPendingResult({ ...guide, likes: 0, rating: 0, comments: [] });
      }
      if (selectedPrice.value > 0) setCurrentView('payment');
      else finalizeUnlock();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    soundManager.playClick();
    setTimeout(() => {
      setIsProcessingPayment(false);
      finalizeUnlock();
      soundManager.playGiftOpen();
    }, 2000);
  };

  const finalizeUnlock = () => {
    const resWithCat = { 
      ...pendingResult, 
      isUnlocked: true, 
      category: activeTab, 
      unlockedAt: new Date().toISOString(),
      likes: pendingResult?.likes || 0,
      rating: pendingResult?.rating || 0,
      comments: pendingResult?.comments || []
    };
    if (activeTab === 'recipes' || activeTab === 'alchemy' || activeTab === 'sensory') {
      setUnlockedRecipes(prev => [resWithCat, ...prev]);
    } else {
      setUnlockedGuides(prev => [resWithCat, ...prev]);
    }
    setPendingResult(resWithCat);
    setCurrentStepIdx(0);
    setCurrentView('result');
  };

  const handleLike = () => {
    if (isLiking) return;
    setIsLiking(true);
    soundManager.playClick();
    const updateFn = (item: any) => item.id === pendingResult.id ? { ...item, likes: (item.likes || 0) + 1 } : item;
    if (activeTab === 'recipes' || activeTab === 'alchemy' || activeTab === 'sensory') {
      setUnlockedRecipes(prev => prev.map(updateFn));
    } else {
      setUnlockedGuides(prev => prev.map(updateFn));
    }
    setPendingResult(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    setTimeout(() => setIsLiking(false), 1000);
  };

  const handleRate = (rating: number) => {
    soundManager.playClick();
    const updateFn = (item: any) => item.id === pendingResult.id ? { ...item, rating } : item;
    if (activeTab === 'recipes' || activeTab === 'alchemy' || activeTab === 'sensory') {
      setUnlockedRecipes(prev => prev.map(updateFn));
    } else {
      setUnlockedGuides(prev => prev.map(updateFn));
    }
    setPendingResult(prev => ({ ...prev, rating }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `comm-${Date.now()}`,
      author: 'Elite Member',
      text: newComment,
      emoji: selectedEmoji,
      timestamp: new Date().toISOString()
    };
    const updateFn = (item: any) => item.id === pendingResult.id ? { ...item, comments: [comment, ...(item.comments || [])] } : item;
    if (activeTab === 'recipes' || activeTab === 'alchemy' || activeTab === 'sensory') {
      setUnlockedRecipes(prev => prev.map(updateFn));
    } else {
      setUnlockedGuides(prev => prev.map(updateFn));
    }
    setPendingResult(prev => ({ ...prev, comments: [comment, ...(prev.comments || [])] }));
    setNewComment('');
    soundManager.playClick();
  };

  const startNew = () => {
    setPrompt('');
    setPendingResult(null);
    setCurrentView('form');
    setShowTechnical(false);
  };

  const currentTabInfo = TAB_CONFIG[activeTab];
  const ActiveIcon = currentTabInfo.Icon;

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="bg-[#020617] w-full max-w-7xl h-[92vh] rounded-[4rem] border-2 border-orange-500/20 shadow-[0_0_150px_rgba(249,115,22,0.2)] relative flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header HUD */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className={`${currentTabInfo.color} p-5 rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500`}>
               <ActiveIcon size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-festive text-white">Elite Festive Studio</h2>
              <p className="text-orange-400/40 text-[9px] uppercase tracking-[0.5em] font-black">AI Secret Vault & Social Lab v4.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-black/60 p-1 rounded-2xl border border-white/10 overflow-x-auto max-w-[500px] hide-scrollbar">
                {(Object.keys(TAB_CONFIG) as StudioTab[]).map(tabKey => {
                  const Icon = TAB_CONFIG[tabKey].Icon;
                  return (
                    <button 
                      key={tabKey}
                      onClick={() => { setActiveTab(tabKey); soundManager.playClick(); startNew(); }} 
                      className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tabKey ? `${TAB_CONFIG[tabKey].color} text-white shadow-lg` : 'text-indigo-200/30 hover:text-white hover:bg-white/5'}`}
                    >
                      <Icon size={14} /> {TAB_CONFIG[tabKey].label}
                    </button>
                  );
                })}
             </div>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50 hover:rotate-90">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="flex-grow flex overflow-hidden">
          <div className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed relative">
            
            {currentView === 'form' && (
              <div className="max-w-3xl mx-auto space-y-16 animate-fade-in py-10">
                <div className="text-center space-y-6">
                  <div className={`inline-block p-6 ${currentTabInfo.color.replace('bg-', 'bg-')}/10 rounded-full mb-4 border border-white/5 shadow-inner`}>
                    <div className={currentTabInfo.color.replace('bg-', 'text-')}>
                        <ActiveIcon size={72} />
                    </div>
                  </div>
                  <h3 className="text-5xl font-festive text-white">
                    {activeTab === 'recipes' && 'Ανακάλυψε μια Μυστική Συνταγή'}
                    {activeTab === 'alchemy' && 'Παρασκεύασε ένα Μαγικό Φίλτρο'}
                    {activeTab === 'sensory' && 'Σχεδίασε μια Αισθητηριακή Εμπειρία'}
                    {activeTab === 'logistics' && 'Λύσε ένα Οργανωτικό Πρόβλημα'}
                    {activeTab === 'engineering' && 'Σχεδίασε μια 3D Κατασκευή'}
                    {activeTab === 'cryptography' && 'Δημιούργησε ένα Κυνήγι Γρίφων'}
                  </h3>
                </div>

                <form onSubmit={handleGenerateRequest} className="space-y-12">
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder={currentTabInfo.prompt}
                      className="w-full bg-black/60 border-2 border-white/5 rounded-[3rem] p-10 text-2xl text-white outline-none focus:border-indigo-500/50 transition-all shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] placeholder:text-white/10"
                    />
                    <Sparkles className="absolute right-10 top-1/2 -translate-y-1/2 text-orange-500/30 group-focus-within:text-orange-400 group-focus-within:animate-pulse transition-all" size={40} />
                  </div>

                  <div className="space-y-6">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Επίλεξε Επίπεδο Μαγείας (AI Depth)</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {PRICING_TIERS.map(tier => (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => { soundManager.playClick(); setSelectedPrice(tier); }}
                          className={`flex flex-col items-center gap-3 p-6 rounded-[2.5rem] border-2 transition-all group/btn ${selectedPrice.value === tier.value ? `${currentTabInfo.color}/20 ${currentTabInfo.color.replace('bg-', 'border-')} shadow-[0_20px_40px_rgba(0,0,0,0.3)]` : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                          <span className="text-4xl group-hover/btn:scale-110 transition-transform">{tier.icon}</span>
                          <span className="text-xs font-black text-white block">{tier.label}</span>
                          <span className={`text-[10px] font-bold py-1 px-3 rounded-full bg-black/40 ${currentTabInfo.color.replace('bg-', 'text-')}`}>{tier.value === 0 ? 'FREE' : `${tier.value.toFixed(2)}€`}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="w-full bg-white text-black font-black py-8 rounded-[3rem] text-xl uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] active:scale-95 disabled:opacity-30"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={28} /> : <Wand2 size={28} />}
                    {selectedPrice.value === 0 ? 'Generate Concept' : 'Authorize Secure Unlock'}
                  </button>
                </form>
              </div>
            )}

            {currentView === 'payment' && (
              <div className="max-w-md mx-auto text-center space-y-10 animate-pop-in py-20">
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto border-2 border-white/10 shadow-inner relative">
                  <CreditCard size={56} className="text-orange-400" />
                  <div className="absolute inset-0 border-2 border-orange-500 rounded-full animate-ping opacity-20" />
                </div>
                <h3 className="text-4xl font-festive text-white">Payment Secure</h3>
                <div className="bg-black/40 border-2 border-white/10 p-10 rounded-[4rem] space-y-8 shadow-2xl">
                  <div className="flex justify-between items-center text-left">
                    <div>
                      <h4 className="text-xl font-bold text-white leading-tight">{pendingResult?.name || pendingResult?.title}</h4>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${currentTabInfo.color.replace('bg-', 'text-')}`}>Premium {currentTabInfo.label}</p>
                    </div>
                    <span className="text-4xl font-black text-white">{selectedPrice.value.toFixed(2)}€</span>
                  </div>
                  <button 
                    onClick={handlePayment}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
                  >
                    {isProcessingPayment ? <Loader2 className="animate-spin" /> : <Lock size={20} />}
                    {isProcessingPayment ? 'Authorizing...' : 'Pay & Unlock Magic'}
                  </button>
                </div>
                <button onClick={startNew} className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white transition-colors">Ακύρωση</button>
              </div>
            )}

            {currentView === 'result' && pendingResult && (
              <div className="max-w-5xl mx-auto space-y-12 animate-slide-up pb-40">
                <div className="flex flex-col items-center text-center">
                  <div className="text-[120px] mb-8 drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-float">
                    {activeTab === 'recipes' ? '🎂' : 
                     activeTab === 'alchemy' ? '🧪' : 
                     activeTab === 'sensory' ? '🌬️' :
                     activeTab === 'engineering' ? '🏗️' : 
                     activeTab === 'cryptography' ? '🧩' : '📜'}
                  </div>
                  <h3 className="text-6xl font-festive text-white mb-4">{pendingResult.name || pendingResult.title}</h3>
                  
                  <div className="flex items-center gap-6 mb-8 bg-white/5 px-8 py-3 rounded-full border border-white/10 backdrop-blur-md">
                    <button onClick={handleLike} className="flex items-center gap-2 group transition-all">
                      <Heart size={20} className={`transition-all ${pendingResult.likes > 0 ? 'text-red-500 fill-red-500' : 'text-white/20 group-hover:text-red-400'}`} />
                      <span className="text-sm font-black text-white/60">{pendingResult.likes || 0}</span>
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={18} 
                          onClick={() => handleRate(star)}
                          className={`cursor-pointer transition-all ${star <= (pendingResult.rating || 0) ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-white/10 hover:text-yellow-400/40'}`} 
                        />
                      ))}
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2 text-white/40">
                      <MessageSquare size={18} />
                      <span className="text-sm font-black">{pendingResult.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {(activeTab === 'recipes' || activeTab === 'alchemy' || activeTab === 'sensory') ? (
                  <div className="grid md:grid-cols-2 gap-12">
                     <div className="bg-black/40 border-2 border-white/5 p-10 rounded-[3.5rem] shadow-2xl relative">
                        <h4 className={`text-xs font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3 ${currentTabInfo.color.replace('bg-', 'text-')}`}>
                          Master Ingredients
                        </h4>
                        <ul className="space-y-5">
                          {pendingResult.ingredients.map((ing: string, i: number) => (
                            <li key={i} className="text-base text-indigo-100/70 flex items-start gap-4 border-b border-white/5 pb-3 group">
                               <div className={`w-2 h-2 rounded-full mt-2 shrink-0 transition-transform group-hover:scale-150 ${currentTabInfo.color}`} /> {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-8">
                        <h4 className={`text-xs font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-3 ${currentTabInfo.color.replace('bg-', 'text-')}`}>
                          Execution Plan
                        </h4>
                        {pendingResult.instructions.map((step: string, i: number) => (
                          <div key={i} className="flex gap-6 group">
                            <span className="text-2xl font-black text-white/10 group-hover:text-white transition-colors">{i+1}</span>
                            <p className="text-base text-indigo-100/80 italic leading-relaxed pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                  </div>
                ) : (
                  <div className="bg-black/60 border-2 border-white/5 rounded-[4rem] p-12 md:p-20 relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center shadow-2xl">
                     <h4 className="text-4xl font-bold text-white mb-6 leading-tight">{pendingResult.steps[currentStepIdx].title}</h4>
                     <p className="text-xl text-indigo-100/70 italic leading-relaxed mb-12 max-w-2xl mx-auto">{pendingResult.steps[currentStepIdx].instruction}</p>
                     <div className="absolute inset-y-0 left-8 flex items-center">
                        <button disabled={currentStepIdx === 0} onClick={() => { setCurrentStepIdx(prev => prev - 1); soundManager.playClick(); }} className="p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-white/50 disabled:opacity-0 transition-all"><ArrowLeft size={48} /></button>
                     </div>
                     <div className="absolute inset-y-0 right-8 flex items-center">
                        <button disabled={currentStepIdx === pendingResult.steps.length - 1} onClick={() => { setCurrentStepIdx(prev => prev + 1); soundManager.playClick(); }} className={`p-8 ${currentTabInfo.color} hover:brightness-110 rounded-full text-white shadow-2xl disabled:opacity-0 transition-all`}><ArrowRight size={56} /></button>
                     </div>
                  </div>
                )}

                <div className="mt-20 space-y-12">
                   <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                      <div className="p-3 bg-white/5 rounded-2xl">
                         <Smile className="text-indigo-400" size={24} />
                      </div>
                      <h4 className="text-2xl font-festive text-white">Community Feedback</h4>
                   </div>

                   <div className="grid lg:grid-cols-3 gap-12">
                      <div className="lg:col-span-1 space-y-6">
                         <form onSubmit={handleAddComment} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                            <div className="flex flex-wrap gap-2 justify-center p-4 bg-black/40 rounded-2xl border border-white/5">
                               {QUICK_EMOJIS.map(e => (
                                 <button 
                                  key={e} 
                                  type="button" 
                                  onClick={() => setSelectedEmoji(e)}
                                  className={`text-2xl p-2 rounded-xl transition-all hover:scale-125 ${selectedEmoji === e ? 'bg-white/10 scale-125 shadow-lg' : 'opacity-40'}`}
                                 >
                                   {e}
                                 </button>
                               ))}
                            </div>
                            <div className="relative">
                               <textarea 
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Γράψε ένα σχόλιο ή μια ερώτηση..."
                                className="w-full h-32 bg-black/60 border border-white/10 rounded-2xl p-5 text-indigo-100 text-sm italic focus:border-indigo-500 outline-none transition-all resize-none"
                               />
                               <div className="absolute bottom-4 right-4 text-3xl opacity-40 select-none">{selectedEmoji}</div>
                            </div>
                            <button 
                              type="submit"
                              disabled={!newComment.trim()}
                              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${newComment.trim() ? `${currentTabInfo.color} text-white shadow-lg` : 'bg-white/5 text-white/20'}`}
                            >
                               <Send size={16} /> Δημοσίευση
                            </button>
                         </form>
                      </div>

                      <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                         {(pendingResult.comments || []).length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-center opacity-20 italic p-12 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem]">
                              <MessageSquare size={48} className="mb-4" />
                              <p>Κανένα σχόλιο ακόμα. Γίνε ο πρώτος!</p>
                           </div>
                         ) : (
                           pendingResult.comments.map((c: Comment) => (
                             <div key={c.id} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex gap-6 hover:bg-white/10 transition-all animate-fade-in group">
                                <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                   {c.emoji}
                                </div>
                                <div className="flex-grow min-w-0">
                                   <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-black text-indigo-400 text-[10px] uppercase tracking-widest">{c.author}</h5>
                                      <span className="text-[8px] text-white/10 font-bold">{new Date(c.timestamp).toLocaleTimeString()}</span>
                                   </div>
                                   <p className="text-sm text-indigo-100/70 italic leading-relaxed">"{c.text}"</p>
                                </div>
                             </div>
                           ))
                         )}
                      </div>
                   </div>
                </div>

                <div className="flex justify-center pb-20">
                   <button onClick={startNew} className="bg-white/5 hover:bg-white/10 text-white font-black px-16 py-5 rounded-3xl transition-all border-2 border-white/10 uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                     <RefreshCcw size={16} /> Initiate New AI Simulation
                   </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-96 bg-black/40 border-l border-white/5 p-10 flex flex-col gap-10 backdrop-blur-md relative z-20">
            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3">
              <Bookmark size={18} className="text-indigo-400" /> The Vault Archive
            </h3>
            
            <div className="flex-grow overflow-y-auto space-y-8 custom-scrollbar-thin hide-scrollbar hover:show-scrollbar">
              <div className="space-y-4">
                <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest border-b border-orange-500/20 pb-2">Formulas</p>
                {unlockedRecipes.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => { setPendingResult(r); setActiveTab((r as any).category || 'recipes'); setCurrentView('result'); }} 
                    className="w-full text-left p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden"
                  >
                    <p className={`text-sm font-bold text-white truncate`}>{r.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1 text-[8px] font-black text-red-500/60">
                          <Heart size={10} fill={r.likes ? 'currentColor' : 'none'} /> {r.likes || 0}
                       </div>
                       <div className="flex items-center gap-1 text-[8px] font-black text-yellow-400/60">
                          <Star size={10} fill={r.rating ? 'currentColor' : 'none'} /> {r.rating || 0}
                       </div>
                       <div className="flex items-center gap-1 text-[8px] font-black text-indigo-400/60 ml-auto">
                          <MessageSquare size={10} /> {r.comments?.length || 0}
                       </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20 pb-2">Master Blueprints</p>
                {unlockedGuides.map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => { setPendingResult(g); setActiveTab((g as any).category || 'logistics'); setCurrentView('result'); setCurrentStepIdx(0); }} 
                    className="w-full text-left p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden"
                  >
                    <p className={`text-sm font-bold text-white truncate`}>{g.title}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1 text-[8px] font-black text-red-500/60">
                          <Heart size={10} fill={g.likes ? 'currentColor' : 'none'} /> {g.likes || 0}
                       </div>
                       <div className="flex items-center gap-1 text-[8px] font-black text-yellow-400/60">
                          <Star size={10} fill={g.rating ? 'currentColor' : 'none'} /> {g.rating || 0}
                       </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
               <div className="bg-gradient-to-tr from-yellow-600/10 to-orange-600/10 p-6 rounded-[2rem] border border-yellow-500/20 text-center">
                  <Star size={24} className="text-yellow-400 mx-auto mb-3 fill-yellow-400 animate-pulse" />
                  <p className="text-[11px] font-black text-white uppercase tracking-widest">Elite Access Verified</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
        .custom-scrollbar-thin::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pop-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default FestiveKitchenAndLogistics;
