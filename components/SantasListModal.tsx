
import React, { useState } from 'react';
import { X, Scroll, Star, Trash2, Gift as GiftIcon, ShoppingCart, ExternalLink, Sparkles, Heart } from 'lucide-react';
import { GiftItem, ChristmasIdea } from '../types';
import { soundManager } from '../services/soundManager';

interface SantasListModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: GiftItem[];
  favoriteIdeas: ChristmasIdea[];
  onRemoveFavorite: (id: number) => void;
  onRemoveIdea: (title: string) => void;
  onBuyNow: (e: React.MouseEvent) => void;
}

const SantasListModal: React.FC<SantasListModalProps> = ({ 
  isOpen, 
  onClose, 
  favorites, 
  favoriteIdeas,
  onRemoveFavorite,
  onRemoveIdea,
  onBuyNow 
}) => {
  const [activeTab, setActiveTab] = useState<'gifts' | 'ideas'>('gifts');

  if (!isOpen) return null;

  const handleRemoveGift = (id: number) => {
    soundManager.playClick();
    onRemoveFavorite(id);
  };

  const handleRemoveIdea = (title: string) => {
    soundManager.playClick();
    onRemoveIdea(title);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#fdf6e3] text-[#4e342e] w-full max-w-lg h-[80vh] rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden animate-slide-up border-[12px] border-[#d7ccc8]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
        
        {/* Header */}
        <div className="p-6 border-b border-[#d7ccc8] bg-[#f5ead1]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-700 p-3 rounded-2xl shadow-lg">
                <Scroll className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-festive text-[#2d1b17]">Η Λίστα του Άη Βασίλη</h2>
                <p className="text-[#8d6e63] text-[8px] uppercase tracking-[0.2em] font-black">Προετοιμασία για τη Μαγική Νύχτα</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#8d6e63]/10 rounded-full transition-colors text-[#8d6e63]">
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#e8dec5] p-1 rounded-xl border border-[#d7ccc8]/50">
            <button 
              onClick={() => { setActiveTab('gifts'); soundManager.playClick(); }}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'gifts' ? 'bg-[#2d1b17] text-[#fdf6e3] shadow-md' : 'text-[#8d6e63] hover:bg-[#8d6e63]/5'}`}
            >
              <GiftIcon size={14} /> ΔΩΡΑ ({favorites.length})
            </button>
            <button 
              onClick={() => { setActiveTab('ideas'); soundManager.playClick(); }}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'ideas' ? 'bg-[#2d1b17] text-[#fdf6e3] shadow-md' : 'text-[#8d6e63] hover:bg-[#8d6e63]/5'}`}
            >
              <Sparkles size={14} /> ΙΔΕΕΣ ({favoriteIdeas.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar-parchment">
          {activeTab === 'gifts' ? (
            favorites.length === 0 ? (
              <EmptyState icon="🎁" message="Δεν υπάρχουν δώρα στη λίστα ακόμα." />
            ) : (
              <div className="space-y-4">
                {favorites.map((gift) => (
                  <div key={gift.id} className="bg-white/40 border-2 border-dashed border-[#d7ccc8] rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/60">
                    <div className={`w-12 h-12 ${gift.color} rounded-lg flex items-center justify-center shadow-md shrink-0`}>
                       <GiftIcon size={20} className="text-white/40" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-sm truncate">{gift.name}</h3>
                      <span className="text-xs font-black text-red-700">{gift.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={onBuyNow} className="p-2 bg-green-700 text-white rounded-xl shadow-md"><ShoppingCart size={16} /></button>
                      <button onClick={() => handleRemoveGift(gift.id)} className="p-2 bg-red-100 text-red-700 rounded-xl"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            favoriteIdeas.length === 0 ? (
              <EmptyState icon="✨" message="Καμία μαγική ιδέα δεν έχει αποθηκευτεί." />
            ) : (
              <div className="space-y-4">
                {favoriteIdeas.map((idea, idx) => (
                  <div key={idx} className="bg-white/40 border-l-4 border-amber-600 rounded-2xl p-4 flex items-start gap-4 animate-fade-in">
                    <span className="text-3xl shrink-0">{idea.emoji}</span>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-sm text-[#2d1b17] mb-1">{idea.title}</h3>
                      <p className="text-[10px] text-[#8d6e63] italic leading-tight">{idea.description}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveIdea(idea.title)}
                      className="p-2 text-red-700/40 hover:text-red-700 hover:bg-red-100 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#f5ead1] border-t border-[#d7ccc8] flex flex-col items-center gap-4">
          {activeTab === 'gifts' && favorites.length > 0 && (
            <button 
              onClick={onBuyNow}
              className="w-full bg-[#2d1b17] hover:bg-[#4e342e] text-[#fdf6e3] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 group"
            >
              Αγορά Όλων των Δώρων <ExternalLink size={18} />
            </button>
          )}
          <p className="text-[10px] text-[#8d6e63]/40 font-bold uppercase tracking-widest flex items-center gap-2">
            <Star size={10} className="fill-current" /> Η μαγεία βρίσκεται στις πράξεις μας <Star size={10} className="fill-current" />
          </p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, message }: { icon: string, message: string }) => (
  <div className="h-64 flex flex-col items-center justify-center text-center px-8 opacity-40">
    <div className="text-6xl mb-4">{icon}</div>
    <p className="font-festive text-2xl">{message}</p>
  </div>
);

export default SantasListModal;
