
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, ShoppingBag, Sparkles, ShoppingCart, Plus, Wand2, Zap, ArrowRight, Package, Shirt, LayoutGrid, Tag, PenTool, Car, Palette, Star, Gift, Ticket, CheckCircle2, MessageCircle, MousePointer2, Send, Heart, Loader2, Music, Volume2, Info, Download } from 'lucide-react';
import { Product } from '../types';
// Fixed: Removed generateGreetingCard which is not exported from geminiService
import { suggestAIProducts, designCustomProduct, getSantaDailyPick, suggestFreeSample, generateSpeech } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SNOWBALL_TIERS = [
  { id: 'sb-classic', name: 'Classic Snowball', price: 19.90, desc: '8-bit Μελωδία & Ζεστό Φως', emoji: '❄️', features: ['Warm LED', 'Standard Tune', 'Plastic Base'] },
  { id: 'sb-deluxe', name: 'Deluxe Snowball', price: 39.90, desc: 'AI Συμφωνία & RGB LED', emoji: '🔮', features: ['RGB Lights', 'AI Melody Generator', 'Ceramic Base', 'Snow Glitter'] },
  { id: 'sb-master', name: 'Legendary Masterpiece', price: 89.90, desc: '3D AI Σκηνή & Magic Snow', emoji: '💎', features: ['Hand-Carved Wood', 'Ever-floating Nano-Snow', 'Personalized AI 3D Interior', 'Lifetime Guarantee'] }
];

const STATIC_PRODUCTS: Product[] = [
  {
    id: "hoodie-classic-2025",
    name: "Classic Festive Hoodie",
    description: "Το απόλυτο φούτερ για τις γιορτές. Ζεστό, ανθεκτικό και γεμάτο στυλ.",
    price: 34.90,
    emoji: "🧥",
    category: "Ρούχα",
    customQuote: "Stay Jolly, Stay Warm",
    reward: "Δωρεάν Χριστουγεννιάτικο Μπρελόκ",
    benefits: ["100% Βαμβάκι", "Unisex Fit"]
  },
  {
    id: "mug-driver-pro",
    name: "Car Lover's Mug",
    description: "Κούπα αυτοκινήτου με διπλό τοίχωμα. Κρατάει τον καφέ ζεστό σε κάθε διαδρομή.",
    price: 14.50,
    emoji: "☕",
    category: "Car Gear",
    customQuote: "Fueled by Christmas Spirit",
    reward: "Επιπλέον Κουπόνι -10%",
    benefits: ["Stainless Steel", "Car Holder Ready"]
  }
];

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'catalog' | 'samples' | 'snowball'>('catalog');
  const [designPrompt, setDesignPrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [dailyPick, setDailyPick] = useState<Product | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Free Samples State
  const [sampleInterest, setSampleInterest] = useState('');
  const [generatedSample, setGeneratedSample] = useState<{ name: string; description: string; emoji: string; type: string } | null>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !dailyPick) {
      fetchDailyPick();
    }
    return () => stopMelody();
  }, [isOpen]);

  const fetchDailyPick = async () => {
    try {
      const pick = await getSantaDailyPick();
      setDailyPick(pick);
    } catch (e) { console.error(e); }
  };

  const stopMelody = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsAudioLoading(false);
  };

  const playMelodySample = async (tierName: string) => {
    if (isAudioLoading) {
      stopMelody();
      return;
    }
    setIsAudioLoading(true);
    soundManager.playClick();
    try {
      const text = `Ακούστε τη μαγική μελωδία για τη χιονόμπαλα ${tierName}. Ντιν ντιν ντιν, η μαγεία των Χριστουγέννων πλησιάζει!`;
      const base64 = await generateSpeech(text);
      if (base64) {
        const audioData = soundManager.decodeBase64(base64);
        const audioBuffer = await soundManager.decodePCMToBuffer(audioData, 24000, 1);
        const ctx = soundManager.getContext();
        if (ctx) {
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.onended = () => setIsAudioLoading(false);
          audioSourceRef.current = source;
          source.start();
        }
      }
    } catch (e) {
      console.error(e);
      setIsAudioLoading(false);
    }
  };

  const handleDesign = async () => {
    if (!designPrompt.trim() || isDesigning) return;
    setIsDesigning(true);
    soundManager.playClick();
    try {
      const product = await designCustomProduct(designPrompt);
      setCustomProducts(prev => [product, ...prev]);
      setDesignPrompt('');
      soundManager.playGiftOpen();
      setActiveTab('catalog');
    } catch (e) { console.error(e); } 
    finally { setIsDesigning(false); }
  };

  const handleRequestSample = async () => {
    if ( !sampleInterest.trim() || isSampleLoading) return;
    setIsSampleLoading(true);
    soundManager.playClick();
    try {
      const sample = await suggestFreeSample(sampleInterest);
      setGeneratedSample(sample);
      soundManager.playGiftOpen();
    } catch (e) { console.error(e); }
    finally { setIsSampleLoading(false); }
  };

  const addToCart = (product: Product | any) => {
    soundManager.playGiftOpen();
    setCart(prev => [...prev, product as Product]);
  };

  const allProducts = useMemo(() => [...STATIC_PRODUCTS, ...customProducts], [customProducts]);
  const total = cart.reduce((sum, p) => sum + p.price, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="bg-gradient-to-br from-[#020617] via-[#1e1b4b] to-[#020617] w-full max-w-6xl h-[94vh] rounded-[3.5rem] border-2 border-indigo-500/30 shadow-[0_0_150px_rgba(79,70,229,0.5)] relative overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-5">
            <div className="bg-red-600 p-4 rounded-3xl shadow-xl animate-pulse">
              <ShoppingBag className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-festive text-white">Magical Boutique 2025</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Handcrafted & AI Infused</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('catalog')}>
              <ShoppingCart size={32} className="text-indigo-200 group-hover:text-white transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full animate-bounce border-2 border-[#1e1b4b]">
                  {cart.length}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
              <X size={28} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-black/40 border-b border-white/5 overflow-x-auto">
          {[
            { id: 'catalog', label: 'Συλλογή', icon: <Package size={16} /> },
            { id: 'snowball', label: 'Χιονόμπαλες', icon: <Music size={16} /> },
            { id: 'studio', label: 'Design Studio', icon: <Palette size={16} /> },
            { id: 'samples', label: 'Free Samples', icon: <Gift size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[150px] py-6 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === tab.id ? 'bg-indigo-600/30 text-white border-b-4 border-indigo-500' : 'text-white/30 hover:bg-white/5'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
          <div className="flex-grow overflow-y-auto p-8 md:p-12 custom-scrollbar bg-white/[0.02]">
            
            {activeTab === 'catalog' && (
              <div className="flex flex-col gap-10">
                {dailyPick && (
                  <div className="bg-gradient-to-r from-red-900/40 to-indigo-900/40 p-8 rounded-[3rem] border-2 border-yellow-500/20 flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl animate-pop-in">
                    <div className="text-8xl">{dailyPick.emoji}</div>
                    <div className="flex-grow">
                      <h3 className="text-3xl font-festive text-white mb-2">Santa's Choice: {dailyPick.name}</h3>
                      <p className="text-indigo-200/60 italic mb-4">"{dailyPick.description}"</p>
                      <button onClick={() => addToCart(dailyPick)} className="bg-yellow-500 text-black font-black px-8 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all">
                        <Plus size={18} /> Προσθήκη - {dailyPick.price}€
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                  {allProducts.map(product => (
                    <div key={product.id} className="bg-white/5 border border-white/10 rounded-[3rem] p-8 flex flex-col gap-4 hover:bg-white/10 transition-all group overflow-hidden">
                      <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{product.emoji}</div>
                      <h4 className="text-2xl font-bold text-white font-festive">{product.name}</h4>
                      <p className="text-indigo-200/50 text-sm italic">"{product.description}"</p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-2xl font-black text-white">{product.price.toFixed(2)}€</span>
                        <button onClick={() => addToCart(product)} className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-95">
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'snowball' && (
              <div className="flex flex-col gap-12">
                <div className="text-center max-w-2xl mx-auto">
                  <h3 className="text-4xl font-festive text-white mb-4">Μουσικές Χιονόμπαλες</h3>
                  <p className="text-indigo-200/60 italic">Χειροποίητες δημιουργίες με ενσωματωμένη AI τεχνολογία για μοναδικές μελωδίες και εφέ.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {SNOWBALL_TIERS.map(tier => (
                    <div key={tier.id} className="bg-white/5 border border-white/10 rounded-[4rem] p-8 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                      <div className="text-8xl mb-6 group-hover:rotate-12 transition-transform">{tier.emoji}</div>
                      <h4 className="text-2xl font-black text-white mb-2">{tier.name}</h4>
                      <p className="text-indigo-300 text-sm mb-6">{tier.desc}</p>
                      
                      <div className="space-y-2 mb-8 w-full">
                        {tier.features.map((f, i) => (
                          <div key={i} className="text-[10px] uppercase font-black text-white/30 border-b border-white/5 pb-1">
                            {f}
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto w-full space-y-4">
                        <button 
                          onClick={() => playMelodySample(tier.name)}
                          className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-black py-3 rounded-2xl flex items-center justify-center gap-2 border border-white/10"
                        >
                          {isAudioLoading ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                          Άκουσε Δείγμα
                        </button>
                        <button 
                          onClick={() => addToCart({...tier, description: tier.desc})}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2"
                        >
                          Αγορά - {tier.price}€
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'studio' && (
              <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
                <Palette size={64} className="text-indigo-400 mb-6 animate-pulse" />
                <h3 className="text-4xl font-festive text-white mb-6">AI Design Studio</h3>
                <p className="text-indigo-200/60 mb-10 italic">Περιέγραψε το δώρο των ονείρων σου και η AI θα δημιουργήσει ένα μοναδικό προϊόν για σένα.</p>
                <div className="w-full flex gap-4">
                  <input 
                    value={designPrompt}
                    onChange={e => setDesignPrompt(e.target.value)}
                    placeholder="π.χ. Ένα φούτερ με έναν τάρανδο που κάνει σκι..."
                    className="flex-grow bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500"
                  />
                  <button onClick={handleDesign} disabled={isDesigning} className="bg-indigo-600 px-8 py-4 rounded-2xl font-black text-white shadow-xl hover:bg-indigo-500 transition-all">
                    {isDesigning ? <Loader2 size={24} className="animate-spin" /> : 'Σχεδίασε!'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'samples' && (
              <div className="max-w-4xl mx-auto flex flex-col items-center">
                <div className="bg-gradient-to-tr from-yellow-600/20 to-orange-600/20 p-10 rounded-[4rem] border-2 border-yellow-500/20 w-full text-center">
                  <Star size={48} className="text-yellow-400 mx-auto mb-6 animate-bounce" />
                  <h3 className="text-4xl font-festive text-white mb-4">Free Digital Samples</h3>
                  <p className="text-indigo-200/60 mb-8 italic">Περιέγραψε τα ενδιαφέροντά σου και λάβε ένα δωρεάν ψηφιακό δείγμα (συνταγή, οδηγό ή wallpaper).</p>
                  
                  <div className="flex gap-4 max-w-xl mx-auto mb-10">
                    <input 
                      value={sampleInterest}
                      onChange={e => setSampleInterest(e.target.value)}
                      placeholder="Τι σου αρέσει; (π.χ. Μαγειρική, Διακόσμηση)"
                      className="flex-grow bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-yellow-500"
                    />
                    <button 
                      onClick={handleRequestSample} 
                      disabled={isSampleLoading}
                      className="bg-yellow-500 px-8 py-4 rounded-2xl font-black text-black shadow-xl hover:bg-yellow-400 transition-all flex items-center gap-2"
                    >
                      {isSampleLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                      Λάβε Δείγμα
                    </button>
                  </div>

                  {generatedSample && (
                    <div className="bg-white/5 border border-yellow-500/30 p-8 rounded-[3rem] animate-pop-in text-left flex items-start gap-6">
                      <div className="text-7xl">{generatedSample.emoji}</div>
                      <div className="flex-grow">
                        <h4 className="text-2xl font-bold text-yellow-100 mb-2">{generatedSample.name}</h4>
                        <p className="text-indigo-200/70 italic mb-4">{generatedSample.description}</p>
                        <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2">
                           <Download size={14} /> DOWNLOAD SAMPLE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="w-full md:w-96 border-l border-white/10 bg-black/40 p-8 flex flex-col backdrop-blur-xl">
            <h3 className="font-black text-xl text-white mb-8 flex items-center gap-3">
              <ShoppingCart size={24} className="text-red-400" /> Καλάθι
            </h3>
            
            <div className="flex-grow overflow-y-auto space-y-4 mb-8 custom-scrollbar">
              {cart.map((item, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4 animate-pop-in">
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <p className="text-xs text-indigo-300">{item.price.toFixed(2)}€</p>
                  </div>
                  <button onClick={() => setCart(prev => prev.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-400">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {cart.length === 0 && <p className="text-center text-indigo-200/20 italic py-10">Το καλάθι είναι άδειο...</p>}
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-end mb-8">
                <span className="text-xs font-black text-indigo-300 uppercase">Total</span>
                <span className="text-4xl font-black text-white">{total.toFixed(2)}€</span>
              </div>
              <button 
                onClick={() => { setShowCheckoutSuccess(true); setTimeout(() => { setShowCheckoutSuccess(false); setCart([]); onClose(); }, 3000); }}
                disabled={cart.length === 0}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[2rem] shadow-xl disabled:opacity-20 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                Checkout <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {showCheckoutSuccess && (
          <div className="absolute inset-0 bg-[#020617]/95 flex flex-col items-center justify-center p-10 animate-fade-in text-center z-[200]">
            <CheckCircle2 size={80} className="text-emerald-500 mb-6 animate-bounce" />
            <h3 className="text-5xl font-festive text-white mb-4">Magic Completed!</h3>
            <p className="text-indigo-200/60 max-w-md">Η παραγγελία σας στάλθηκε στον Βόρειο Πόλο. Θα λάβετε σύντομα email επιβεβαίωσης!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopModal;
