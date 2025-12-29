
import React, { useState, useEffect } from 'react';
import { X, Heart, Coffee, Star, Gift, ExternalLink, Sparkles, Zap, Wind, ShoppingCart, ChevronRight, Info, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DonationTier {
  name: string;
  price: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isOffer?: boolean;
}

const DONATION_TIERS: DonationTier[] = [
  {
    name: "Ζεστή Αγκαλιά Αγάπης",
    price: "3€",
    description: "Ένα ζεστό ρόφημα φτιαγμένο με πολλή αγάπη για να μας κρατάει συντροφιά.",
    icon: <Coffee size={20} />,
    color: "bg-orange-500/10 text-orange-200 border-orange-500/20"
  },
  {
    name: "Δώρο Ζεστασιάς",
    price: "7€",
    description: "Μια απαλή κουβέρτα φροντίδας που διώχνει το κρύο από τις καρδιές μας.",
    icon: <Wind size={20} />,
    color: "bg-blue-500/20 text-blue-200 border-blue-400/30"
  },
  {
    name: "Γιορτινή Φλόγα Αγάπης",
    price: "10€",
    description: "Μια λάμψη που γεμίζει το δωμάτιο και τις καρδιές μας με γιορτινή αγάπη.",
    icon: <Gift size={20} />,
    color: "bg-red-500/20 text-red-200 border-red-500/30"
  },
  {
    name: "Λαμπερή Έκπληξη",
    price: "15€",
    description: "Ένα αστέρι που λαμπυρίζει μόνο για εσάς, φέρνοντας τύχη και χαρά.",
    icon: <Sparkles size={20} />,
    color: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30"
  },
  {
    name: "Μαγικό Πακέτο",
    price: "20€",
    description: "ΠΡΟΣΦΟΡΑ: Συνδυασμός όλων των παραπάνω με μια δόση επιπλέον μαγείας!",
    icon: <Zap size={20} />,
    color: "bg-purple-500/30 text-purple-200 border-purple-400/40",
    isOffer: true
  },
  {
    name: "Μαγικό Φως Αγάπης",
    price: "30€",
    description: "Η απόλυτη μαγεία των Χριστουγέννων που σκορπά απλόχερα φως και αγάπη.",
    icon: <Star size={20} />,
    color: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30"
  }
];

const GUIDE_STEPS = [
  {
    title: "Γιατί να στηρίξετε;",
    description: "Κάθε συνεισφορά βοηθά στη διατήρηση αυτής της μαγικής εμπειρίας και στη δημιουργία νέων AI ιστοριών για όλους.",
    icon: <Sparkles className="text-yellow-400" size={32} />,
  },
  {
    title: "Πού πηγαίνουν τα χρήματα;",
    description: "Από ένα ζεστό ρόφημα (3€) μέχρι ένα ολόκληρο πακέτο μαγείας (20€), τα δώρα σας χρηματοδοτούν την τεχνολογία και τη ζεστασιά μας.",
    icon: <Gift className="text-red-400" size={32} />,
  },
  {
    title: "Επιλέξτε τον αντίκτυπό σας",
    description: "Διαλέξτε το επίπεδο που σας ταιριάζει. Κάθε δωρεά συνοδεύεται από την απέραντη ευγνωμοσύνη μας!",
    icon: <CheckCircle2 className="text-emerald-400" size={32} />,
  }
];

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowGuide(true);
      setGuideStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLinkClick = () => {
    soundManager.playClick();
    soundManager.playGiftOpen();
  };

  const nextGuideStep = () => {
    soundManager.playClick();
    if (guideStep < GUIDE_STEPS.length - 1) {
      setGuideStep(prev => prev + 1);
    } else {
      setShowGuide(false);
    }
  };

  const skipGuide = () => {
    soundManager.playClick();
    setShowGuide(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-indigo-950 via-red-950 to-indigo-950 p-6 md:p-8 rounded-[2.5rem] border-2 border-yellow-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-lg w-full relative overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Onboarding Guide Overlay */}
        {showGuide && (
          <div className="absolute inset-0 z-50 bg-[#0a0a1a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="mb-8 p-6 bg-white/5 rounded-full relative group">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 animate-bounce-subtle">
                {GUIDE_STEPS[guideStep].icon}
              </div>
            </div>
            
            <h3 className="text-2xl font-festive text-yellow-100 mb-4 animate-pop-in">
              {GUIDE_STEPS[guideStep].title}
            </h3>
            
            <p className="text-blue-100/70 text-sm leading-relaxed mb-10 max-w-xs animate-pop-in" style={{ animationDelay: '0.1s' }}>
              {GUIDE_STEPS[guideStep].description}
            </p>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={nextGuideStep}
                className="bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20 group"
              >
                {guideStep === GUIDE_STEPS.length - 1 ? 'Ας ξεκινήσουμε!' : 'Επόμενο'} 
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={skipGuide}
                className="text-white/40 hover:text-white/60 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Παράλειψη Οδηγού
              </button>
            </div>

            <div className="flex gap-2 mt-12">
              {GUIDE_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === guideStep ? 'w-8 bg-red-500' : 'w-2 bg-white/20'}`} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white z-10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center shadow-inner">
              <Heart className="text-red-400 fill-red-400 animate-pulse" size={32} />
            </div>
            <Sparkles className="absolute -top-1 -right-1 text-yellow-400 animate-bounce" size={20} />
          </div>

          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-festive text-yellow-100">Υποστήριξε τη Μαγεία μας</h2>
            <button 
              onClick={() => setShowGuide(true)}
              className="p-1 text-white/30 hover:text-white/60 transition-colors"
              title="Εμφάνιση οδηγού"
            >
              <Info size={16} />
            </button>
          </div>
          
          <p className="text-blue-100/70 mb-6 text-sm max-w-xs mx-auto italic">
            "Η αγάπη είναι το πιο όμορφο δώρο των Χριστουγέννων."
          </p>

          <div className="grid gap-3 w-full mb-8 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
            {DONATION_TIERS.map((tier, idx) => (
              <a 
                key={idx}
                href="https://www.paypal.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className={`group flex items-center p-4 rounded-2xl border transition-all hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 text-left relative overflow-hidden ${tier.color}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                
                {tier.isOffer && (
                   <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[7px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest z-10">
                    Best Value
                  </div>
                )}
                
                <div className="mr-4 bg-white/10 p-3 rounded-xl shrink-0 relative z-10">
                  {tier.icon}
                </div>

                <div className="flex-grow min-w-0 mr-4 relative z-10">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-base truncate">{tier.name}</h3>
                    <span className="text-lg font-black">{tier.price}</span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-snug line-clamp-1 pr-6 italic">
                    {tier.description}
                  </p>
                </div>

                <div className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors shrink-0 border border-white/10 relative z-10 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  <ShoppingCart size={16} className="group-hover:scale-110 transition-transform" />
                </div>
                
                <div className="absolute bottom-2 right-12 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest flex items-center gap-1 z-10">
                  Αγορά Τώρα <ExternalLink size={8} />
                </div>
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-4 w-full">
             <a 
              href="https://www.buymeacoffee.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 bg-white text-indigo-950 font-bold py-3 rounded-xl transition-all hover:bg-yellow-50 shadow-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Coffee size={18} className="text-orange-500 group-hover:rotate-12 transition-transform relative z-10" />
              <span className="relative z-10">Κέρασμα με Αγάπη</span>
            </a>
          </div>

          <p className="mt-6 text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">
            Σας ευχαριστούμε για την υποστήριξη ❤️
          </p>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DonationModal;
