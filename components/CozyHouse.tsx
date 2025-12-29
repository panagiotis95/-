
import React, { useState, useEffect } from 'react';
import { Coffee, Flame, Wind, Sparkles, Home, LogIn } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface CozyHouseProps {
  isGlobalAudioEnabled?: boolean;
  onClick?: () => void;
}

const CozyHouse: React.FC<CozyHouseProps> = ({ isGlobalAudioEnabled = false, onClick }) => {
  const [isFireActive, setIsFireActive] = useState(true);
  const [steamVisible, setSteamVisible] = useState(true);

  // Sync sound with fire state AND global audio state
  useEffect(() => {
    if (isFireActive && isGlobalAudioEnabled) {
      soundManager.startFireSound();
    } else {
      soundManager.stopFireSound();
    }
  }, [isFireActive, isGlobalAudioEnabled]);

  const handleFireClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    setIsFireActive(!isFireActive);
  };

  const handleHouseClick = () => {
    soundManager.playClick();
    soundManager.playGiftOpen();
    onClick?.();
  };

  return (
    <div 
      className="relative w-80 h-72 md:w-96 md:h-80 bg-[#3e2723] rounded-t-[3rem] border-x-[12px] border-t-[12px] border-[#2d1b17] shadow-2xl overflow-hidden group/house cursor-pointer"
      onClick={handleHouseClick}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />

      {/* The Window */}
      <div className="absolute top-8 right-8 w-32 h-24 md:w-40 md:h-28 bg-[#0f172a] border-4 border-[#2d1b17] rounded-xl overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-blue-900/20" />
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full animate-snow-fast"
              style={{
                left: `${Math.random() * 100}%`,
                width: '3px',
                height: '3px',
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-[#2d1b17]" />
        <div className="absolute left-1/2 top-0 w-1 h-full bg-[#2d1b17]" />
      </div>

      {/* Fireplace */}
      <div 
        onClick={handleFireClick}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-36 bg-[#1a0a0a] rounded-t-3xl border-t-8 border-x-8 border-[#5d4037] cursor-pointer group/fire"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/brick-wall.png')]" />
        <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-24 bg-orange-600/20 blur-3xl transition-opacity duration-1000 ${isFireActive ? 'opacity-100' : 'opacity-0'}`} />

        {isFireActive && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end justify-center gap-1">
            <div className="w-4 h-12 bg-orange-600 rounded-full animate-flicker-1 blur-[2px]" />
            <div className="w-6 h-16 bg-red-600 rounded-full animate-flicker-2 blur-[1px]" />
            <div className="w-4 h-14 bg-yellow-500 rounded-full animate-flicker-3 blur-[2px]" />
            <Flame className="absolute bottom-2 text-orange-400 animate-pulse" size={32} />
          </div>
        )}
        
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-12 h-4 bg-[#3e2723] rounded-full rotate-12" />
          <div className="w-12 h-4 bg-[#2d1b17] rounded-full -rotate-12" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex items-end gap-2">
        <div className="relative group/person">
          <span className="text-5xl drop-shadow-lg">🧔‍♂️</span>
          <div 
            onClick={(e) => { e.stopPropagation(); setSteamVisible(!steamVisible); }}
            className="absolute -top-6 -right-2 cursor-pointer"
          >
            <div className="relative">
              <span className="text-2xl">☕</span>
              {steamVisible && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-0.5">
                  <div className="w-1 h-3 bg-white/40 rounded-full animate-steam" style={{ animationDelay: '0s' }} />
                  <div className="w-1 h-5 bg-white/20 rounded-full animate-steam" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-3 bg-white/40 rounded-full animate-steam" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative group/person">
          <span className="text-5xl drop-shadow-lg">👩‍🦰</span>
          <div className="absolute -top-6 -left-2">
            <span className="text-2xl">☕</span>
          </div>
        </div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-4 bg-red-900 shadow-inner" />

      {/* "Open" Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/house:opacity-100 transition-all scale-75 group-hover/house:scale-100 flex flex-col items-center gap-2 pointer-events-none">
        <LogIn className="text-white animate-pulse" size={48} />
        <span className="bg-black/60 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">Μπες Μέσα</span>
      </div>

      <style>{`
        @keyframes snow-fast {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(110px); }
        }
        @keyframes steam {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
        }
        @keyframes flicker-1 {
          0%, 100% { height: 30px; opacity: 0.8; }
          50% { height: 45px; opacity: 1; }
        }
        @keyframes flicker-2 {
          0%, 100% { height: 50px; opacity: 1; }
          50% { height: 35px; opacity: 0.7; }
        }
        @keyframes flicker-3 {
          0%, 100% { height: 25px; opacity: 0.6; }
          50% { height: 40px; opacity: 0.9; }
        }
        .animate-snow-fast { animation: snow-fast linear infinite; }
        .animate-steam { animation: steam 2s ease-out infinite; }
        .animate-flicker-1 { animation: flicker-1 0.3s ease-in-out infinite; }
        .animate-flicker-2 { animation: flicker-2 0.4s ease-in-out infinite; }
        .animate-flicker-3 { animation: flicker-3 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default CozyHouse;
