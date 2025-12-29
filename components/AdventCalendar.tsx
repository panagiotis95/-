
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Lock, Sparkles, Star } from 'lucide-react';
import { generateAdventSurprise } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface AdventCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedAdventDay {
  day: number;
  content: string;
  emoji: string;
}

const AdventCalendar: React.FC<AdventCalendarProps> = ({ isOpen, onClose }) => {
  const [unlockedDays, setUnlockedDays] = useState<SavedAdventDay[]>([]);
  const [loadingDay, setLoadingDay] = useState<number | null>(null);
  const [selectedDayContent, setSelectedDayContent] = useState<SavedAdventDay | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('advent_calendar_v1');
    if (saved) {
      setUnlockedDays(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('advent_calendar_v1', JSON.stringify(unlockedDays));
  }, [unlockedDays]);

  if (!isOpen) return null;

  const today = new Date();
  const isDecember = today.getMonth() === 11;
  const currentDay = isDecember ? today.getDate() : 31; // For demo, let's allow all if not Dec

  const handleOpenDay = async (day: number) => {
    if (day > currentDay) return;
    
    const alreadyUnlocked = unlockedDays.find(d => d.day === day);
    if (alreadyUnlocked) {
      setSelectedDayContent(alreadyUnlocked);
      return;
    }

    setLoadingDay(day);
    soundManager.playClick();
    try {
      const surprise = await generateAdventSurprise(day);
      const newDay = { day, ...surprise };
      setUnlockedDays(prev => [...prev, newDay]);
      setSelectedDayContent(newDay);
      soundManager.playGiftOpen();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDay(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="bg-gradient-to-br from-indigo-950 via-[#0a0a2a] to-blue-950 w-full max-w-4xl max-h-[90vh] rounded-[3rem] border-2 border-white/10 shadow-[0_0_80px_rgba(30,58,138,0.5)] relative flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20">
              <CalendarIcon className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">Μαγικό Ημερολόγιο</h2>
              <p className="text-blue-300/40 text-[10px] uppercase tracking-[0.3em] font-black">Μια έκπληξη για κάθε μέρα</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => {
              const day = i + 1;
              const isUnlocked = unlockedDays.some(d => d.day === day);
              const isLocked = day > currentDay;
              const isLoading = loadingDay === day;

              return (
                <button
                  key={day}
                  onClick={() => handleOpenDay(day)}
                  disabled={isLocked || isLoading}
                  className={`relative aspect-square rounded-2xl border-2 transition-all group overflow-hidden
                    ${isUnlocked 
                      ? 'bg-white/10 border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.2)]' 
                      : isLocked 
                        ? 'bg-black/40 border-white/5 grayscale opacity-50 cursor-not-allowed' 
                        : 'bg-indigo-900/40 border-indigo-500/30 hover:scale-105 active:scale-95 hover:border-indigo-400'
                    }`}
                >
                  {/* Background number */}
                  <span className={`absolute inset-0 flex items-center justify-center text-4xl font-black transition-all
                    ${isUnlocked ? 'text-white/10' : 'text-white/40 group-hover:text-white'}`}>
                    {day}
                  </span>

                  {/* Content for unlocked */}
                  {isUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 animate-pop-in">
                      <span className="text-2xl mb-1">{unlockedDays.find(d => d.day === day)?.emoji}</span>
                      <span className="text-[10px] font-bold text-indigo-300 uppercase">Ημέρα {day}</span>
                    </div>
                  )}

                  {/* Lock icon */}
                  {isLocked && (
                    <div className="absolute top-2 right-2 text-white/20">
                      <Lock size={12} />
                    </div>
                  )}

                  {/* Loading spinner */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-indigo-900/80 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Star decor for unlocked */}
                  {isUnlocked && (
                    <div className="absolute -bottom-1 -right-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-center">
          <p className="text-xs text-blue-200/40 italic flex items-center gap-2">
            <Sparkles size={14} /> Ξεκλείδωσε μια νέα έκπληξη κάθε μέρα του Δεκεμβρίου!
          </p>
        </div>

        {/* Surprise Popup Overlay */}
        {selectedDayContent && (
          <div className="absolute inset-0 z-50 bg-indigo-950/95 backdrop-blur-md flex items-center justify-center p-8 animate-fade-in">
            <div className="max-w-md w-full text-center animate-slide-up">
              <div className="text-7xl mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                {selectedDayContent.emoji}
              </div>
              <h3 className="text-3xl font-festive text-white mb-4">Ημέρα {selectedDayContent.day}</h3>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
                <p className="text-xl text-indigo-100 leading-relaxed italic">
                  "{selectedDayContent.content}"
                </p>
              </div>
              <button 
                onClick={() => setSelectedDayContent(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                Ευχαριστώ! ✨
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
};

export default AdventCalendar;
