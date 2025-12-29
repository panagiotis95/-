
import React, { useMemo, useState } from 'react';
import { soundManager } from '../services/soundManager';

interface TreeProps {
  onClick?: () => void;
}

const Tree: React.FC<TreeProps> = ({ onClick }) => {
  const lightColors = [
    'bg-red-500', 
    'bg-yellow-300', 
    'bg-blue-300', 
    'bg-pink-300', 
    'bg-green-300', 
    'bg-white'
  ];
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const lights = useMemo(() => {
    return Array.from({ length: 110 }).map((_, i) => {
      const topPercent = Math.random() * 0.90 + 0.05;
      const horizontalRange = topPercent * 0.85; 
      const leftPercent = 0.5 - (horizontalRange / 2) + (Math.random() * horizontalRange);
      
      const animationType = Math.random() > 0.7 ? 'ultra-sparkle' : (Math.random() > 0.4 ? 'sparkle-fast' : 'glow-slow');
      
      return {
        id: i,
        top: topPercent * 100,
        left: leftPercent * 100,
        color: lightColors[i % lightColors.length],
        delay: `${Math.random() * 5}s`,
        duration: animationType === 'ultra-sparkle' ? `${0.4 + Math.random() * 0.6}s` : `${1.5 + Math.random() * 2.5}s`,
        size: Math.random() > 0.9 ? 'w-3 h-3' : 'w-1.5 h-1.5',
        type: Math.random() > 0.8 ? 'star' : 'dot',
        animationType
      };
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleTreeClick = () => {
    soundManager.playClick();
    soundManager.playGiftOpen();
    onClick?.();
  };

  return (
    <div 
      className="relative w-64 h-[450px] md:w-96 md:h-[650px] mx-auto flex flex-col items-center group/tree cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleTreeClick}
    >
      {isHovering && (
        <div 
          className="absolute w-48 h-48 bg-yellow-400/20 rounded-full blur-[60px] pointer-events-none z-20 mix-blend-screen animate-pulse"
          style={{ 
            left: `${mousePos.x}%`, 
            top: `${mousePos.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      <div className="text-6xl md:text-8xl text-yellow-200 animate-star-glow drop-shadow-[0_0_40px_rgba(253,224,71,1)] z-30 select-none cursor-default">
        ⭐
      </div>
      
      <div className="relative w-full h-full -mt-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[70px] border-r-[70px] border-b-[120px] md:border-l-[120px] md:border-r-[120px] md:border-b-[200px] border-l-transparent border-r-transparent border-b-emerald-950 drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] z-0 group-hover/tree:border-b-emerald-900 transition-colors" />
        <div className="absolute top-[90px] md:top-[140px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[105px] border-r-[105px] border-b-[150px] md:border-l-[160px] md:border-r-[160px] md:border-b-[240px] border-l-transparent border-r-transparent border-b-emerald-900 drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)] z-0 group-hover/tree:border-b-emerald-800 transition-colors" />
        <div className="absolute top-[200px] md:top-[310px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[140px] border-r-[140px] border-b-[190px] md:border-l-[220px] md:border-r-[220px] md:border-b-[290px] border-l-transparent border-r-transparent border-b-emerald-800 drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)] z-0 group-hover/tree:border-b-emerald-700 transition-colors" />

        <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-16 h-28 md:w-28 md:h-32 bg-gradient-to-b from-[#3e2723] to-[#1a0f0d] rounded-b-2xl shadow-[inset_0_4px_15px_rgba(0,0,0,0.9)]" />

        <div className="absolute inset-0 z-10 pointer-events-none">
          {lights.map((light) => {
            const distance = Math.sqrt(
              Math.pow(mousePos.x - light.left, 2) + Math.pow(mousePos.y - light.top, 2)
            );
            const isNearMouse = isHovering && distance < 15;

            return (
              <div
                key={light.id}
                className={`absolute rounded-full ${light.color} transition-all duration-300
                  ${light.size} ${isNearMouse ? 'scale-[2.8] brightness-200 z-20 shadow-[0_0_35px_white]' : `animate-${light.animationType}`}
                  ${light.type === 'star' ? 'after:content-["✦"] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-[14px] after:text-white after:font-bold' : ''}`}
                style={{
                  top: `${light.top}%`,
                  left: `${light.left}%`,
                  animationDelay: light.delay,
                  animationDuration: light.duration,
                }}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes ultra-sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); filter: brightness(1); }
          50% { opacity: 1; transform: scale(1.8) rotate(180deg); filter: brightness(2.5); box-shadow: 0 0 25px white; }
        }

        @keyframes sparkle-fast {
          0%, 100% { opacity: 0.1; transform: scale(0.7); filter: brightness(0.6); }
          50% { opacity: 1; transform: scale(1.4); filter: brightness(1.8); box-shadow: 0 0 15px currentColor; }
        }

        @keyframes glow-slow {
          0%, 100% { opacity: 0.3; transform: scale(0.9); box-shadow: 0 0 8px currentColor; }
          50% { opacity: 0.8; transform: scale(1.2); box-shadow: 0 0 22px currentColor; }
        }
        
        @keyframes star-glow {
          0%, 100% { transform: scale(1) rotate(0deg); filter: brightness(1) drop-shadow(0 0 20px rgba(253,224,71,0.7)); }
          50% { transform: scale(1.1) rotate(8deg); filter: brightness(1.4) drop-shadow(0 0 45px rgba(253,224,71,1)); }
        }

        .animate-ultra-sparkle { animation: ultra-sparkle linear infinite; }
        .animate-sparkle-fast { animation: sparkle-fast ease-in-out infinite; }
        .animate-glow-slow { animation: glow-slow ease-in-out infinite; }
        .animate-star-glow { animation: star-glow 3.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Tree;
