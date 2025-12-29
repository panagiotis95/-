
import React, { useEffect, useState, useMemo } from 'react';
import { ChristmasIdea } from '../types';
import { soundManager } from '../services/soundManager';
import { Share2, Check, Tag, Sparkles, Heart, ShoppingCart, Copy } from 'lucide-react';

interface GiftProps {
  id: number;
  color: string;
  isOpen: boolean;
  name?: string;
  price?: string;
  isSpecialOffer?: boolean;
  onClick: () => void;
  idea?: ChristmasIdea;
  isLoading?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onBuyNow?: (e: React.MouseEvent) => void;
}

const Gift: React.FC<GiftProps> = ({ 
  isOpen, 
  color, 
  name, 
  price, 
  isSpecialOffer, 
  onClick, 
  idea, 
  isLoading, 
  isFavorite,
  onToggleFavorite,
  onBuyNow
}) => {
  const [copied, setCopied] = useState(false);
  const isShareSupported = useMemo(() => typeof navigator !== 'undefined' && !!navigator.share, []);

  // Play sound when gift opens
  useEffect(() => {
    if (isOpen) {
      soundManager.playGiftOpen();
    }
  }, [isOpen]);

  const handleClick = () => {
    if (!isOpen && !isLoading) {
      soundManager.playClick();
      onClick();
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    
    if (!idea) return;

    const shareData = {
      title: 'Μια Μαγική Χριστουγεννιάτικη Ιδέα!',
      text: `${idea.emoji} ${idea.title}: ${idea.description} #ChristmasMagic`,
      url: window.location.href,
    };

    if (isShareSupported && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    onToggleFavorite?.(e);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow?.(e);
  };

  return (
    <div className="relative group perspective-1000">
      {!isOpen ? (
        <div className="relative flex flex-col items-center">
          {/* Special Offer Tag */}
          {isSpecialOffer && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-950 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg z-20 animate-bounce flex items-center gap-1 border border-yellow-200 uppercase tracking-tighter">
              <Sparkles size={8} /> SPECIAL <Sparkles size={8} />
            </div>
          )}

          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`relative w-16 h-16 md:w-24 md:h-24 ${color} rounded-lg shadow-2xl transform transition-all duration-500 ease-out 
              ${!isLoading ? 'hover:scale-110 active:scale-95 hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(255,255,255,0.5),inset_0_0_15px_rgba(255,255,255,0.3)] hover:brightness-110' : 'animate-shake'} 
              flex items-center justify-center cursor-pointer overflow-hidden group-hover:ring-2 group-hover:ring-white/30`}
          >
            {/* Subtle Shine Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {/* Ribbon */}
            <div className="absolute w-full h-2 md:h-4 bg-white/30 top-1/2 -translate-y-1/2 shadow-sm" />
            <div className="absolute h-full w-2 md:w-4 bg-white/30 left-1/2 -translate-x-1/2 shadow-sm" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl group-hover:animate-bounce drop-shadow-md">🎀</div>
            
            {/* Price Tag Overlay */}
            {price && (
              <div className="absolute bottom-1 right-1 bg-white/90 text-indigo-950 text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                <Tag size={10} className="text-red-500" />
                {price}
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          
          {/* Gift Name */}
          {name && (
            <div className="mt-2 text-[10px] md:text-xs font-medium text-blue-100 opacity-60 group-hover:opacity-100 group-hover:text-white transition-all whitespace-nowrap drop-shadow-sm">
              {name}
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
          {/* Sparkle Burst Effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-4 bg-yellow-300 rounded-full animate-burst"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-30px)`,
                  animationDelay: '0.1s'
                }}
              />
            ))}
          </div>

          <div 
            onClick={onClick}
            className="relative w-full h-full bg-white/10 border border-white/20 rounded-lg flex items-center justify-center animate-pop-open shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-shadow duration-300 cursor-pointer"
          >
            <span className="text-3xl md:text-5xl drop-shadow-md z-10 group-hover:scale-110 transition-transform duration-300">{idea?.emoji || '✨'}</span>
            
            {/* Actions Container */}
            <div className="absolute -top-2 -right-2 z-30 flex flex-col gap-2 scale-0 group-hover:scale-100 transition-transform duration-300">
              {/* Buy Now Button */}
              <div className="relative group/action">
                <button
                  onClick={handleBuyNow}
                  className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-90 border border-white/20"
                >
                  <ShoppingCart size={14} />
                </button>
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-green-900 text-white text-[9px] rounded shadow-lg opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                  Buy Now
                </div>
              </div>

              {/* Share/Copy Button */}
              <div className="relative group/action">
                <button
                  onClick={handleShare}
                  className={`p-1.5 rounded-full shadow-lg transition-all hover:rotate-12 active:scale-90 border border-white/20 ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {copied ? <Check size={14} /> : (isShareSupported ? <Share2 size={14} /> : <Copy size={14} />)}
                </button>
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-indigo-900 text-white text-[9px] rounded shadow-lg opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                  {copied ? 'Copied!' : (isShareSupported ? 'Share Idea' : 'Copy to Clipboard')}
                </div>
              </div>

              {/* Favorite Button */}
              <div className="relative group/action">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-1.5 rounded-full shadow-lg transition-all active:scale-90 border border-white/20 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'}`}
                >
                  <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
                </button>
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-red-900 text-white text-[9px] rounded shadow-lg opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </div>
              </div>
            </div>

            {/* Hover Tooltip for Title */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/95 text-indigo-900 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none flex items-center gap-1 border border-indigo-100">
              <span className="text-red-500">✨</span> {idea?.title}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pop-open {
          0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          75% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes burst {
          0% { transform: rotate(var(--tw-rotate)) translateY(0); opacity: 1; height: 0; }
          50% { opacity: 1; height: 15px; }
          100% { transform: rotate(var(--tw-rotate)) translateY(-50px); opacity: 0; height: 0; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-2deg); }
          75% { transform: translateX(4px) rotate(2deg); }
        }

        .animate-pop-open {
          animation: pop-open 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-burst {
          animation: burst 0.5s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default Gift;
