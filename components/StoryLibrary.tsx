
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Book, Sparkles, BookOpen, Coffee, Heart, Stars, ArrowRight, Loader2, Search, Volume2, Square, Headphones } from 'lucide-react';
import { ChristmasStory } from '../types';
import { generateCozyStory, generateSpeech } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface StoryLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: 'magic', label: 'Μαγεία & Ξωτικά', emoji: '✨' },
  { id: 'family', label: 'Οικογένεια & Αγάπη', emoji: '🏠' },
  { id: 'animals', label: 'Ζώα του Δάσους', emoji: '🦊' },
  { id: 'classic', label: 'Κλασικά Χριστούγεννα', emoji: '🎄' },
  { id: 'starry', label: 'Αστρική Νύχτα', emoji: '🌌' }
];

const StoryLibrary: React.FC<StoryLibraryProps> = ({ isOpen, onClose }) => {
  const [stories, setStories] = useState<ChristmasStory[]>([]);
  const [activeStory, setActiveStory] = useState<ChristmasStory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('christmas_stories_archive');
    if (saved) {
      setStories(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('christmas_stories_archive', JSON.stringify(stories));
  }, [stories]);

  const filteredStories = useMemo(() => {
    if (!searchTerm.trim()) return stories;
    const term = searchTerm.toLowerCase();
    return stories.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.content.toLowerCase().includes(term)
    );
  }, [stories, searchTerm]);

  if (!isOpen) return null;

  const handleGenerateStory = async () => {
    if (isLoading) return;
    stopSpeech();
    setIsLoading(true);
    soundManager.playClick();
    try {
      const story = await generateCozyStory(selectedTheme.label);
      setStories(prev => [story, ...prev]);
      setActiveStory(story);
      soundManager.playGiftOpen();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStory = (story: ChristmasStory) => {
    stopSpeech();
    setActiveStory(story);
    soundManager.playGiftOpen();
  };

  const stopSpeech = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsSpeaking(false);
    setIsSpeechLoading(false);
  };

  const handleReadAloud = async () => {
    if (!activeStory) return;
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    // Checking specifically for narrator channel
    if (!soundManager.isChannelEnabled('narrator')) {
      alert("Ενεργοποιήστε την 'Αφήγηση AI' από το Audio Mixer για να ακούσετε!");
      return;
    }

    setIsSpeechLoading(true);
    soundManager.playClick();

    try {
      const textToRead = `${activeStory.title}. ${activeStory.content}. ${activeStory.moral}`;
      const base64Audio = await generateSpeech(textToRead);
      
      if (!base64Audio) throw new Error("No audio data received");

      const audioData = soundManager.decodeBase64(base64Audio);
      const audioBuffer = await soundManager.decodePCMToBuffer(audioData, 24000, 1);
      
      const ctx = soundManager.getContext();
      if (!ctx) return;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        audioSourceRef.current = null;
      };

      audioSourceRef.current = source;
      source.start();
      setIsSpeaking(true);
    } catch (error) {
      console.error("Speech generation failed:", error);
    } finally {
      setIsSpeechLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className="bg-[#1e1b4b] w-full max-w-6xl h-[90vh] rounded-[3rem] border-2 border-indigo-400/20 shadow-[0_0_100px_rgba(79,70,229,0.2)] relative flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-amber-600 p-3 rounded-2xl shadow-lg">
              <Book className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">Η Μαγική Βιβλιοθήκη</h2>
              <p className="text-amber-200/50 text-[10px] uppercase tracking-[0.3em] font-black">Ιστορίες που ζεσταίνουν την καρδιά</p>
            </div>
          </div>
          <button onClick={() => { stopSpeech(); onClose(); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow flex overflow-hidden">
          {/* Bookshelf / Sidebar */}
          <div className="w-80 border-r border-white/5 bg-black/20 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Stars size={14} /> Διάλεξε Θέμα
              </h3>
              <div className="grid gap-2">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => { setSelectedTheme(theme); soundManager.playClick(); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-bold text-left ${
                      selectedTheme.id === theme.id 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-white/5 border-white/5 text-indigo-200/60 hover:bg-white/10'
                    }`}
                  >
                    <span>{theme.emoji}</span>
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateStory}
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              Νέα Ιστορία
            </button>

            <div className="mt-4 flex flex-col gap-4">
              <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Αρχείο ({stories.length})
              </h3>

              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300/40 group-focus-within:text-amber-400 transition-colors" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Αναζήτηση ιστορίας..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder:text-indigo-200/20 outline-none focus:border-amber-500/50 focus:bg-black/60 transition-all"
                />
              </div>

              <div className="grid gap-3">
                {stories.length === 0 ? (
                  <p className="text-[10px] text-indigo-200/30 italic text-center py-8">
                    Η βιβλιοθήκη είναι άδεια...
                  </p>
                ) : filteredStories.length === 0 ? (
                  <p className="text-[10px] text-indigo-200/30 italic text-center py-8">
                    Δεν βρέθηκαν αποτελέσματα για "{searchTerm}"
                  </p>
                ) : (
                  filteredStories.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectStory(s)}
                      className={`text-left p-3 rounded-xl border text-xs font-bold transition-all truncate ${
                        activeStory?.title === s.title 
                          ? 'bg-white/15 border-white/20 text-white' 
                          : 'bg-white/5 border-white/5 text-indigo-100/40 hover:bg-white/10'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Reader Area */}
          <div className="flex-grow relative bg-[#fdf6e3] p-8 md:p-16 overflow-y-auto custom-scrollbar-light">
            {activeStory ? (
              <div className="max-w-2xl mx-auto animate-fade-in text-[#4e342e] font-serif relative">
                {/* Read Aloud Button */}
                <div className="absolute -top-4 -right-4 md:right-0">
                  <button
                    onClick={handleReadAloud}
                    disabled={isSpeechLoading}
                    className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-2 flex items-center gap-2 group/read ${
                      isSpeaking 
                        ? 'bg-red-600 border-red-400 text-white animate-pulse' 
                        : isSpeechLoading
                          ? 'bg-amber-600/50 border-amber-400 text-white'
                          : 'bg-amber-600 border-amber-400 text-white hover:bg-amber-500'
                    }`}
                  >
                    {isSpeechLoading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : isSpeaking ? (
                      <>
                        <Square size={24} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Stop Reading</span>
                      </>
                    ) : (
                      <>
                        <Headphones size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Read Aloud</span>
                      </>
                    )}
                    
                    {/* Visualizer bars when speaking */}
                    {isSpeaking && (
                      <div className="flex items-end gap-0.5 h-4 ml-1">
                        <div className="w-1 bg-white rounded-full animate-visualizer-1" />
                        <div className="w-1 bg-white rounded-full animate-visualizer-2" />
                        <div className="w-1 bg-white rounded-full animate-visualizer-3" />
                      </div>
                    )}
                  </button>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="bg-[#8d6e63]/10 p-4 rounded-full relative">
                    <BookOpen size={48} className={`text-[#8d6e63] ${isSpeaking ? 'animate-bounce' : ''}`} />
                    {isSpeaking && (
                      <div className="absolute -top-2 -right-2">
                        <Volume2 className="text-red-500 animate-ping" size={24} />
                      </div>
                    )}
                  </div>
                </div>

                <h1 className={`text-4xl md:text-5xl font-festive text-center mb-10 text-[#2d1b17] transition-all ${isSpeaking ? 'scale-105' : ''}`}>
                  {activeStory.title}
                </h1>
                
                <div className={`text-lg md:text-xl leading-relaxed mb-12 italic whitespace-pre-wrap px-4 border-l-4 transition-colors ${isSpeaking ? 'border-red-500 text-black' : 'border-[#8d6e63]/20 text-[#5d4037]/90'}`}>
                  {activeStory.content}
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-px mb-8 transition-colors ${isSpeaking ? 'bg-red-500' : 'bg-[#8d6e63]/30'}`} />
                  <p className={`text-2xl font-festive text-center transition-all ${isSpeaking ? 'text-red-600 scale-110' : 'text-[#8d6e63]'}`}>
                    "{activeStory.moral}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-indigo-950/20 italic">
                <div className="bg-indigo-950/5 p-12 rounded-full mb-8">
                  <Book size={120} />
                </div>
                <p className="text-2xl font-festive text-center max-w-sm">
                  Διάλεξε μια ιστορία από το αρχείο ή δημιούργησε μια νέα για να ξεκινήσεις...
                </p>
              </div>
            )}

            {/* Loading Overlay within Reader */}
            {isLoading && (
              <div className="absolute inset-0 bg-indigo-950/10 backdrop-blur-[2px] flex items-center justify-center z-10 animate-fade-in">
                <div className="bg-[#1e1b4b] p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 border border-white/10">
                  <div className="relative">
                    <Loader2 size={48} className="text-amber-500 animate-spin" />
                    <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-bounce" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black uppercase tracking-widest text-xs mb-2">Γράφοντας τη μαγεία...</p>
                    <p className="text-indigo-200/50 text-[10px] italic">Η AI βιβλιοθηκάριος ετοιμάζει την ιστορία σου</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-200/40 uppercase tracking-widest">
              <Coffee size={14} /> Ζεστή Σοκολάτα: Ετοιμη
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-red-400/40 uppercase tracking-widest">
              <Heart size={14} /> Αγάπη: Απεριόριστη
            </div>
            {isSpeaking && (
              <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                <Headphones size={14} /> Τώρα Ακούτε την AI
              </div>
            )}
          </div>
          <p className="text-[10px] text-indigo-300/30 italic">© 2025 Μαγική Βιβλιοθήκη</p>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        
        .custom-scrollbar-light::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-light::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(78, 52, 46, 0.2); border-radius: 10px; }

        @keyframes visualizer {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-visualizer-1 { animation: visualizer 0.6s ease-in-out infinite; }
        .animate-visualizer-2 { animation: visualizer 0.8s ease-in-out infinite 0.1s; }
        .animate-visualizer-3 { animation: visualizer 0.7s ease-in-out infinite 0.2s; }
      `}</style>
    </div>
  );
};

export default StoryLibrary;
