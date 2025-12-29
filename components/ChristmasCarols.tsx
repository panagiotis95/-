
import React, { useState, useEffect } from 'react';
import { Music, Pause, Play, Quote } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface ChristmasCarolsProps {
  isGlobalAudioEnabled?: boolean;
}

const CAROLS = [
  {
    title: "Καλήν Εσπέραν",
    lyrics: "Καλήν εσπέραν άρχοντες, αν είναι ορισμός σας, Χριστού τη θεία γέννηση να μπω στ' αρχοντικό σας..."
  },
  {
    title: "Τρίγωνα Κάλαντα",
    lyrics: "Τρίγωνα κάλαντα, σκόρπισαν παντού, κάθε σπίτι μια φωλιά του μικρού Χριστού..."
  },
  {
    title: "Άγια Νύχτα",
    lyrics: "Άγια Νύχτα, σε προσμένουν με χαρά οι χριστιανοί και με πίστη ανυμνούνε το Σωτήρα οι ουρανοί..."
  },
  {
    title: "Πάει ο Παλιός ο Χρόνος",
    lyrics: "Πάει ο παλιός ο χρόνος, ας γιορτάσουμε παιδιά και του κόσμου ο λυτρωτής, χαιρετά την εργασία..."
  },
  {
    title: "Ω Έλατο",
    lyrics: "Ω έλατο, ω έλατο, τι ωραία τα κλαδιά σου, το καλοκαίρι πράσινα, το χειμώνα χιονισμένα..."
  }
];

const ChristmasCarols: React.FC<ChristmasCarolsProps> = ({ isGlobalAudioEnabled = false }) => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Auto-pause if global audio is disabled
  useEffect(() => {
    if (!isGlobalAudioEnabled) {
      setIsPlaying(false);
    }
  }, [isGlobalAudioEnabled]);

  useEffect(() => {
    if (!isPlaying || !isGlobalAudioEnabled) return;

    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % CAROLS.length);
        setIsExiting(false);
      }, 800);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPlaying, isGlobalAudioEnabled]);

  const togglePlay = () => {
    soundManager.playClick();
    if (!isGlobalAudioEnabled && !isPlaying) {
      // If global audio is off, we can't play carols alone here
      // This is managed by the parent's master switch
      return;
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative group max-w-sm mx-auto px-6 py-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl transition-all hover:bg-white/10">
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-indigo-200/60 uppercase text-[10px] font-black tracking-widest">
          <Music size={14} className={(isPlaying && isGlobalAudioEnabled) ? 'animate-pulse text-indigo-400' : ''} />
          Μελωδίες
        </div>
        <button 
          onClick={togglePlay}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          title={isPlaying ? 'Παύση' : 'Αναπαραγωγή'}
        >
          {(isPlaying && isGlobalAudioEnabled) ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>

      <div className="relative h-20 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className={`transition-all duration-700 transform
          ${isExiting ? 'opacity-0 scale-95 -translate-y-4' : 'opacity-100 scale-100 translate-y-0'}
        `}>
          <Quote size={12} className="text-red-400/40 mb-1 mx-auto" />
          <h4 className="text-[10px] font-black text-red-300 uppercase tracking-tighter mb-1">
            {CAROLS[index].title}
          </h4>
          <p className="text-sm md:text-base font-festive text-white/90 leading-tight italic px-2">
            {CAROLS[index].lyrics}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 bg-red-500/30 transition-all duration-[8000ms] linear" 
           style={{ width: (isPlaying && isGlobalAudioEnabled) ? '100%' : '0%', opacity: isExiting ? 0 : 1 }} 
      />
    </div>
  );
};

export default ChristmasCarols;
