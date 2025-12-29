
import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Flower, Star, Heart, Music } from 'lucide-react';
import { soundManager } from '../services/soundManager';

const REINDEER_EMOJIS = ['🦌', '🦌', '🦌', '🦌'];

const FestiveGarden: React.FC = () => {
  // We restrict the vertical position (y) to be at the bottom (75% to 90%)
  const [reindeerPos, setReindeerPos] = useState(
    REINDEER_EMOJIS.map(() => ({
      x: 10 + Math.random() * 80,
      y: 75 + Math.random() * 15,
      flip: Math.random() > 0.5,
      scale: 0.9 + Math.random() * 0.3,
      isBlinking: false,
      lookAngle: 0
    }))
  );

  // Periodic movement and idle behaviors (blinking, looking around)
  useEffect(() => {
    const interval = setInterval(() => {
      setReindeerPos(prev => prev.map(p => {
        const shouldMove = Math.random() > 0.8;
        const shouldBlink = Math.random() > 0.7;
        const shouldLook = Math.random() > 0.6;
        
        let newX = p.x;
        if (shouldMove) {
          newX += p.flip ? -3 : 3;
          if (newX < 5) newX = 5;
          if (newX > 90) newX = 90;
        }

        return { 
          ...p, 
          x: newX,
          isBlinking: shouldBlink,
          lookAngle: shouldLook ? (Math.random() * 10 - 5) : p.lookAngle
        };
      }));

      // Reset blink after a short time
      setTimeout(() => {
        setReindeerPos(prev => prev.map(p => ({ ...p, isBlinking: false })));
      }, 150);

    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const crystalFlowers = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 80 + Math.random() * 18, 
      size: 12 + Math.random() * 15,
      color: ['text-blue-200', 'text-white', 'text-pink-200', 'text-cyan-100'][i % 4],
      delay: Math.random() * 5
    }));
  }, []);

  const handleReindeerClick = (idx: number) => {
    soundManager.playClick();
    soundManager.playGiftOpen();
    setReindeerPos(prev => prev.map((p, i) => i === idx ? { 
      ...p, 
      flip: !p.flip,
      scale: p.scale * 1.1 // Temporary excitement grow
    } : p));
    
    // Reset scale after animation
    setTimeout(() => {
      setReindeerPos(prev => prev.map((p, i) => i === idx ? { ...p, scale: p.scale / 1.1 } : p));
    }, 500);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Visual Ground / Snow Bank */}
      <div className="absolute bottom-0 w-full h-[25%] bg-gradient-to-t from-white/10 to-transparent blur-xl pointer-events-none" />
      
      {/* Interactive Zone */}
      <div className="absolute inset-0 pointer-events-auto">
        
        {/* Ground Flowers */}
        {crystalFlowers.map(f => (
          <div 
            key={f.id}
            className={`absolute ${f.color} transition-all duration-1000 hover:scale-150 cursor-pointer animate-sway group`}
            style={{ 
              left: `${f.x}%`, 
              top: `${f.y}%`, 
              animationDelay: `${f.delay}s` 
            }}
            onClick={(e) => { e.stopPropagation(); soundManager.playClick(); }}
          >
            <Flower size={f.size} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className="absolute -top-4 -left-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles size={10} className="text-white animate-pulse" />
            </div>
          </div>
        ))}

        {/* Reindeers on the ground */}
        {reindeerPos.map((p, i) => (
          <div 
            key={i}
            onClick={() => handleReindeerClick(i)}
            className="absolute transition-all duration-[3000ms] ease-in-out cursor-pointer group"
            style={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`,
              transform: `scale(${p.scale}) ${p.flip ? 'scaleX(-1)' : ''} rotate(${p.lookAngle}deg)`,
              zIndex: Math.floor(p.y)
            }}
          >
            <div className={`text-7xl md:text-8xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transition-transform group-hover:animate-bounce-subtle animate-reindeer-breathe relative`}>
              {REINDEER_EMOJIS[i]}
              
              {/* Fake Blink Effect (A small white/transparent dot that vanishes) */}
              <div className={`absolute top-[35%] right-[25%] w-1.5 h-1 bg-black/40 rounded-full transition-opacity duration-75 ${p.isBlinking ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            
            {/* Interaction Feedback */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-active:opacity-100 transition-all pointer-events-none scale-0 group-active:scale-150">
              <Heart size={32} className="text-red-400 fill-current animate-ping" />
            </div>

            {/* Label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
              <div className="bg-indigo-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap border border-white/20 flex items-center gap-2 shadow-2xl">
                <Music size={10} className="text-yellow-400 animate-pulse" />
                Jolly Reindeer
              </div>
            </div>
          </div>
        ))}

        {/* Ambient Ground Fog */}
        <div className="absolute bottom-0 w-full h-32 opacity-20 pointer-events-none">
           {[...Array(5)].map((_, i) => (
             <div 
              key={i} 
              className="absolute bg-white/30 rounded-full blur-[60px] animate-drift"
              style={{
                width: '300px',
                height: '100px',
                left: `${i * 25}%`,
                bottom: '-20px',
                animationDuration: `${12 + i * 3}s`
              }}
             />
           ))}
        </div>
      </div>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-sway { animation: sway 4s ease-in-out infinite; }
        
        @keyframes drift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(60px); }
        }
        .animate-drift { animation: drift linear infinite; }

        @keyframes reindeer-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.03); }
        }
        .animate-reindeer-breathe { animation: reindeer-breathe 4s ease-in-out infinite; }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default FestiveGarden;
