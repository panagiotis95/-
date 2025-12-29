
import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const MagicWand: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      
      const newParticle: Particle = {
        id: Date.now(),
        x: e.clientX + (Math.random() * 20 - 10),
        y: e.clientY + (Math.random() * 20 - 10),
        size: Math.random() * 8 + 2,
        color: ['text-yellow-400', 'text-white', 'text-indigo-400', 'text-red-400'][Math.floor(Math.random() * 4)]
      };

      setParticles(prev => [...prev.slice(-20), newParticle]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000]">
      {particles.map(p => (
        <div 
          key={p.id}
          className={`absolute ${p.color} animate-sparkle-fade`}
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
        >
          <Sparkles size={p.size} />
        </div>
      ))}
      <div 
        className="absolute text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]"
        style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%) rotate(-45deg)' }}
      >
        <Wand2 size={32} />
      </div>

      <style>{`
        @keyframes sparkle-fade {
          0% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(0) translateY(-20px); opacity: 0; }
        }
        .animate-sparkle-fade { animation: sparkle-fade 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MagicWand;
