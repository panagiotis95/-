
import React, { useState, useEffect } from 'react';
import { X, Heart, Coffee, Star, Gift, ExternalLink, Sparkles, Smile, Flame, Sun, Bell, CandyCane, Zap, HeartHandshake, Rocket } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface HugsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HugTier {
  name: string;
  price: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  id: string;
  isOffer?: boolean;
}

const HUG_TIERS: HugTier[] = [
  {
    id: "spark",
    name: "Μια Μικρή Σπίθα",
    price: "1€",
    description: "Μια στιγμιαία λάμψη χαράς που διώχνει το σκοτάδι.",
    icon: <Zap size={20} />,
    color: "bg-yellow-500/10 text-yellow-100 border-yellow-400/20"
  },
  {
    id: "smile",
    name: "Κρυφό Χαμόγελο",
    price: "2€",
    description: "Ένα μικρό μυστικό χαράς που ταξιδεύει αθόρυβα στις καρδιές.",
    icon: <Smile size={20} />,
    color: "bg-blue-500/20 text-blue-100 border-blue-400/30"
  },
  {
    id: "hug",
    name: "Ζεστή Αγκαλιά Αγάπης",
    price: "5€",
    description: "Σαν ένα μάλλινο κασκόλ που σε τυλίγει προστατευτικά τις κρύες νύχτες.",
    icon: <Heart size={20} />,
    color: "bg-red-500/20 text-red-100 border-red-400/30"
  },
  {
    id: "bundle-1",
    name: "Πακέτο 'Διπλή Χαρά'",
    price: "8€",
    description: "Προσφορά: Δύο αγκαλιές και τρία χαμόγελα σε ένα πακέτο!",
    icon: <HeartHandshake size={20} />,
    color: "bg-purple-500/30 text-purple-100 border-purple-400/50",
    isOffer: true
  },
  {
    id: "wish",
    name: "Γλυκιά Ευχή",
    price: "10€",
    description: "Μια ψιθυριστή ευχή που γίνεται αστέρι και φωτίζει το δρόμο κάποιου.",
    icon: <Bell size={20} />,
    color: "bg-emerald-500/20 text-emerald-100 border-emerald-400/30"
  },
  {
    id: "bundle-2",
    name: "Μαγική Έκρηξη Αγάπης",
    price: "25€",
    description: "Προσφορά: Η απόλυτη δόση χριστουγεννιάτικης ενέργειας!",
    icon: <Rocket size={20} />,
    color: "bg-orange-600/30 text-orange-100 border-orange-400/60",
    isOffer: true
  }
];

const HugsModal: React.FC<HugsModalProps> = ({ isOpen, onClose }) => {
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setEnergy(92), 500);
      return () => clearTimeout(timer);
    } else {
      setEnergy(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLinkClick = () => {
    soundManager.playClick();
  };

  return (
    <div 
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-[#1a0505] via-[#3d0a0a] to-[#1a0505] p-6 md:p-10 rounded-[3rem] border-2 border-red-500/30 shadow-[0_0_80px_rgba(220,38,38,0.3)] max-w-xl w-full relative overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Animated Background Icons */}
        <div className="absolute top-10 left-10 opacity-5 rotate-12 pointer-events-none"><CandyCane size={80} /></div>
        <div className="absolute bottom-10 right-10 opacity-5 -rotate-12 pointer-events-none"><Bell size={80} /></div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white z-10"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              <span className="text-5xl">🧸</span>
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" size={32} />
          </div>

          <h2 className="text-4xl font-festive text-red-100 mb-3">Το Κουτί των Αγκαλιών</h2>
          <p className="text-red-200/60 mb-8 text-sm max-w-sm mx-auto leading-relaxed italic">
            "Κάθε αγκαλιά είναι μια γέφυρα αγάπης που ενώνει τις ψυχές μας."
          </p>

          <div className="grid gap-4 w-full mb-10 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
            {HUG_TIERS.map((tier) => (
              <a 
                key={tier.id}
                href="https://www.paypal.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className={`group flex items-center p-5 rounded-[2rem] border transition-all hover:scale-[1.02] hover:brightness-125 active:scale-95 text-left relative overflow-hidden ${tier.color}`}
              >
                {tier.isOffer && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                    ΠΡΟΣΦΟΡΑ
                  </div>
                )}
                <div className="mr-4 bg-white/10 p-3 rounded-2xl shrink-0">
                  {tier.icon}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-lg truncate">{tier.name}</h3>
                  <p className="text-[10px] md:text-xs opacity-70 leading-snug line-clamp-2">{tier.description}</p>
                </div>
                <div className="text-xl md:text-2xl font-black ml-4 bg-white/20 px-4 py-1 rounded-full border border-white/10 shrink-0">
                  {tier.price}
                </div>
                <ExternalLink size={16} className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity" />
              </a>
            ))}
          </div>

          {/* Magic Hug Meter */}
          <div className="w-full mb-8 bg-black/40 p-4 rounded-3xl border border-white/5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-red-200/50 mb-2">
              <span>Magic Hug Energy</span>
              <span>{energy}%</span>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1">
              <div 
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-full transition-all duration-1000 relative shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                style={{ width: `${energy}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
             <a 
              href="https://www.buymeacoffee.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)] group"
            >
              <Heart size={20} className="fill-white group-hover:animate-ping" />
              <span>Κέρασμα με Αληθινή Αγάπη</span>
            </a>
          </div>

          <p className="mt-8 text-[11px] text-white/30 uppercase tracking-[0.3em] font-black">
            Σας ευχαριστούμε για τη ζεστασιά σας ❤️
          </p>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default HugsModal;
