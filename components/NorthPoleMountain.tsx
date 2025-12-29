
import React, { useState } from 'react';
import { Home, Wind, Sparkles, Loader2, Search } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface NorthPoleMountainProps {
  onOpenDetails?: () => void;
}

const NorthPoleMountain: React.FC<NorthPoleMountainProps> = ({ onOpenDetails }) => {
  const handleHouseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    soundManager.playGiftOpen();
    onOpenDetails?.();
  };

  return (
    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] pointer-events-none select-none z-0">
      {/* The Mountain Shape */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-full">
        {/* Back Peaks */}
        <div className="absolute bottom-0 left-[10%] w-[40%] h-[70%] bg-indigo-900/40 clip-path-mountain skew-x-[-10deg] blur-sm" />
        <div className="absolute bottom-0 right-[10%] w-[40%] h-[80%] bg-indigo-900/30 clip-path-mountain skew-x-[15deg] blur-sm" />
        
        {/* Main Peak */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-full bg-gradient-to-b from-white via-blue-100 to-indigo-900 clip-path-mountain shadow-2xl relative">
          {/* Snow Cap Detail */}
          <div className="absolute top-0 left-0 w-full h-[30%] bg-white blur-[2px]" />
          
          {/* Santa's House */}
          <div 
            className="absolute top-[15%] left-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer group/mountainhouse"
            onClick={handleHouseClick}
          >
            <div className="relative">
              {/* Chimney Smoke */}
              <div className="absolute -top-12 right-2 flex flex-col items-center">
                <div className="w-4 h-4 bg-white/20 rounded-full animate-smoke-1" />
                <div className="w-6 h-6 bg-white/10 rounded-full animate-smoke-2" />
              </div>
              
              {/* The Cottage */}
              <div className="bg-[#5d4037] w-20 h-16 rounded-t-lg border-b-4 border-[#3e2723] shadow-2xl relative group-hover/mountainhouse:scale-110 transition-transform">
                 {/* Roof */}
                 <div className="absolute -top-6 -left-4 w-28 h-8 bg-white rounded-full shadow-md" />
                 {/* Windows */}
                 <div className="absolute top-4 left-3 w-4 h-4 bg-yellow-400 rounded-sm shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse" />
                 <div className="absolute top-4 right-3 w-4 h-4 bg-yellow-400 rounded-sm shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
                 {/* Door */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-[#3e2723] rounded-t-md" />
              </div>

              {/* Inspect Icon */}
              <div className="absolute -top-4 -right-4 bg-red-600 p-1.5 rounded-full text-white shadow-lg opacity-0 group-hover/mountainhouse:opacity-100 transition-all scale-50 group-hover/mountainhouse:scale-100">
                <Search size={14} />
              </div>
              
              {/* Interactive Label */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/mountainhouse:opacity-100 transition-all whitespace-nowrap">
                <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xl flex items-center gap-2">
                  <Home size={10} /> ΕΞΕΡΕΥΝΗΣΗ ΒΟΥΝΟΥ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .clip-path-mountain {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        @keyframes smoke-1 {
          0% { transform: translateY(0) scale(1); opacity: 0.5; }
          100% { transform: translateY(-40px) scale(2); opacity: 0; }
        }
        @keyframes smoke-2 {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-60px) scale(3); opacity: 0; }
        }
        .animate-smoke-1 { animation: smoke-1 3s ease-out infinite; }
        .animate-smoke-2 { animation: smoke-2 4s ease-out infinite 1.5s; }
      `}</style>
    </div>
  );
};

export default NorthPoleMountain;
