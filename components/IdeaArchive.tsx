
import React from 'react';
import { ChristmasIdea } from '../types';
import { X, BookOpen, ChevronRight, Heart } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface IdeaArchiveProps {
  history: ChristmasIdea[];
  favoriteIdeas: ChristmasIdea[];
  isOpen: boolean;
  onClose: () => void;
  onSelectIdea: (idea: ChristmasIdea) => void;
  onToggleFavoriteIdea: (idea: ChristmasIdea) => void;
}

const IdeaArchive: React.FC<IdeaArchiveProps> = ({ 
  history, 
  favoriteIdeas,
  isOpen, 
  onClose, 
  onSelectIdea,
  onToggleFavoriteIdea 
}) => {
  const isFavorite = (title: string) => favoriteIdeas.some(i => i.title === title);

  const handleToggle = (e: React.MouseEvent, idea: ChristmasIdea) => {
    e.stopPropagation();
    soundManager.playClick();
    onToggleFavoriteIdea(idea);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-xs md:max-w-md bg-indigo-950/90 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-red-400" />
              <h2 className="text-2xl font-festive text-white">Το Αρχείο μου</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60"><X size={24} /></button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-6">
                <div className="text-6xl mb-4">🎁</div>
                <p>Δεν έχεις ανακαλύψει ακόμα κάποια ιδέα!</p>
              </div>
            ) : (
              history.map((idea, index) => (
                <div
                  key={index}
                  onClick={() => onSelectIdea(idea)}
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 flex items-center gap-4 transition-all hover:scale-[1.02] group cursor-pointer"
                >
                  <span className="text-3xl drop-shadow-sm group-hover:animate-bounce">{idea.emoji}</span>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-bold truncate text-sm">{idea.title}</h3>
                    <p className="text-blue-200/60 text-[10px] truncate">{idea.description}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => handleToggle(e, idea)}
                    className={`p-2 rounded-full transition-colors ${isFavorite(idea.title) ? 'bg-red-500/20 text-red-500' : 'text-white/20 hover:text-white/40'}`}
                  >
                    <Heart size={18} className={isFavorite(idea.title) ? 'fill-current' : ''} />
                  </button>
                  <ChevronRight size={16} className="text-white/10" />
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-white/10 bg-white/5">
            <p className="text-center text-xs text-blue-200/40">Βρήκες {history.length} μαγικές ιδέες! ✨</p>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </>
  );
};

export default IdeaArchive;
