
import React, { useMemo, useCallback } from 'react';
import { soundManager } from '../services/soundManager';

const SantaSleigh: React.FC = () => {
  const handleAnimationPass = useCallback(() => {
    setTimeout(() => {
      soundManager.playWhoosh();
    }, 2000);
  }, []);

  return (
    <div className="absolute top-[10%] left-0 w-full pointer-events-none overflow-hidden h-64 z-20">
      <div 
        className="relative w-full h-full animate-santa-fly"
        onAnimationIteration={handleAnimationPass}
      >
        <div className="absolute left-0 flex flex-col items-center">
          <div className="text-6xl md:text-7xl drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] filter brightness-125">
            🛷🎅
          </div>
        </div>
      </div>

      <style>{`
        @keyframes santa-fly {
          0% { transform: translateX(-100%) translateY(20px); }
          50% { transform: translateX(50vw) translateY(-20px); }
          100% { transform: translateX(110vw) translateY(20px); }
        }
        .animate-santa-fly { animation: santa-fly 20s linear infinite; }
      `}</style>
    </div>
  );
};

export default SantaSleigh;
