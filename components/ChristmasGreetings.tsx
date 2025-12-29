
import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { soundManager } from '../services/soundManager';

const GREETINGS = [
  "Καλά Χριστούγεννα!",
  "Χρόνια Πολλά & Ευτυχισμένα!",
  "Υγεία, Αγάπη και Χαρά!",
  "Μαγικές Γιορτές σε όλους!",
  "Η μαγεία των Χριστουγέννων είναι εδώ!",
  "Ευτυχισμένο το 2025!",
  "Ζεστασιά στις καρδιές σας!",
  "Ας λάμψει το φως των Χριστουγέννων!"
];

const ChristmasGreetings: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % GREETINGS.length);
        setIsExiting(false);
        setCopied(false); // Reset copied state when greeting changes
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    const text = GREETINGS[index];
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="h-12 flex items-center justify-center overflow-hidden mb-4 group/greetings">
      <div 
        className={`flex items-center gap-3 transition-all duration-500 transform
          ${isExiting ? 'opacity-0 -translate-y-4 scale-90' : 'opacity-100 translate-y-0 scale-100'}
        `}
      >
        <span className="text-2xl md:text-3xl font-festive text-red-200 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]">
          {GREETINGS[index]}
        </span>
        
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 
            ${copied ? 'bg-green-500/40 border-green-400/50 text-white' : 'bg-white/5 hover:bg-white/20 text-white/50 hover:text-white opacity-0 group-hover/greetings:opacity-100'}
            ${isExiting ? 'pointer-events-none' : ''}
          `}
          title="Αντιγραφή Ευχής"
        >
          {copied ? <Check size={14} className="animate-scale-in" /> : <Copy size={14} />}
        </button>
      </div>
      
      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ChristmasGreetings;
