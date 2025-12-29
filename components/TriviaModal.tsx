
import React, { useState, useEffect } from 'react';
import { X, Trophy, Loader2, CheckCircle2, AlertCircle, Sparkles, BrainCircuit } from 'lucide-react';
import { generateTriviaQuestion } from '../services/geminiService';
import { TriviaQuestion } from '../types';
import { soundManager } from '../services/soundManager';

interface TriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (points: number) => void;
}

const TriviaModal: React.FC<TriviaModalProps> = ({ isOpen, onClose, onReward }) => {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchNewQuestion();
  }, [isOpen]);

  const fetchNewQuestion = async () => {
    setIsLoading(true);
    setSelectedIdx(null);
    setIsCorrect(null);
    try {
      const q = await generateTriviaQuestion();
      setQuestion(q);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleAnswer = (idx: number) => {
    if (selectedIdx !== null || !question) return;
    setSelectedIdx(idx);
    const correct = idx === question.correctAnswer;
    setIsCorrect(correct);
    soundManager.playClick();
    if (correct) {
      soundManager.playGiftOpen();
      onReward(50);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-indigo-950 border-2 border-indigo-500/30 w-full max-w-lg rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(79,70,229,0.3)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={24} /></button>
        
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-indigo-600 p-3 rounded-2xl"><BrainCircuit className="text-white" size={24} /></div>
           <h2 className="text-3xl font-festive text-white">Christmas Trivia</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="text-indigo-500 animate-spin" size={48} />
            <p className="text-indigo-200/40 text-xs font-black uppercase">Φορτώνω Γρίφο...</p>
          </div>
        ) : question ? (
          <div className="space-y-6 animate-slide-up">
            <p className="text-lg text-white font-bold leading-relaxed">{question.question}</p>
            <div className="grid gap-3">
              {question.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedIdx !== null}
                  className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                    selectedIdx === i 
                      ? (isCorrect ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-red-600/20 border-red-500 text-white') 
                      : (selectedIdx !== null && i === question.correctAnswer ? 'bg-emerald-600/10 border-emerald-500/50 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10')
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {isCorrect !== null && (
              <div className={`p-4 rounded-2xl border flex gap-3 animate-pop-in ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-red-500/10 border-red-500/20 text-red-200'}`}>
                {isCorrect ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <div className="text-xs italic leading-relaxed">
                  <span className="font-bold block mb-1">{isCorrect ? 'Σωστά! +50 Elf Credits' : 'Όχι ακριβώς...'}</span>
                  {question.explanation}
                </div>
              </div>
            )}

            {selectedIdx !== null && (
              <button onClick={fetchNewQuestion} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2">
                 <Sparkles size={18} /> Επόμενη Ερώτηση
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TriviaModal;
