
import { MessageCircle, Smile, Loader2, Volume2, Sparkles, X, Radar, Thermometer, Coffee, Zap, Mail, Send, Newspaper, Heart, Trophy, Star, ChevronDown, Check } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { generateSantaJoke, generateSantaReaction, generateSpeech, scanUserStatus, generateLetterResponse, generateNorthPoleNews, generateSantaWorkshopThanks } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface SantaSpeakerProps {
  lastAction?: string;
  onOpenDonation?: () => void;
}

const MOODS = [
  { id: 'jolly', label: 'Χαρούμενος', emoji: '😊' },
  { id: 'tired', label: 'Κουρασμένος', emoji: '😴' },
  { id: 'hungry', label: 'Πεινασμένος', emoji: '🍪' },
  { id: 'excited', label: 'Ενθουσιασμένος', emoji: '🚀' }
];

const SANTA_MOOD_KEY = 'santa_preferred_mood_v1';

const SantaSpeaker: React.FC<SantaSpeakerProps> = ({ lastAction, onOpenDonation }) => {
  const [message, setMessage] = useState<string>('Χο Χο Χο! Καλώς ήρθες στο μαγικό μου κόσμο!');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [showMailbox, setShowMailbox] = useState(false);
  const [showMoodMenu, setShowMoodMenu] = useState(false);
  const [wish, setWish] = useState('');
  const [news, setNews] = useState<string[]>([]);
  const [newsIndex, setNewsIndex] = useState(0);
  const [mood, setMood] = useState('jolly');
  const [workshopSupport, setWorkshopSupport] = useState(45); // % Support Level
  const [stats, setStats] = useState({ cookies: 142, milk: 85, happiness: 100 });
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Load preferred mood from localStorage
  useEffect(() => {
    const savedMood = localStorage.getItem(SANTA_MOOD_KEY);
    if (savedMood && MOODS.find(m => m.id === savedMood)) {
      setMood(savedMood);
    }
  }, []);

  useEffect(() => {
    if (lastAction) {
      handleReaction(lastAction);
    }
  }, [lastAction]);

  useEffect(() => {
    const fetchNews = async () => {
      const newsItems = await generateNorthPoleNews();
      setNews(newsItems);
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length > 0) {
      const interval = setInterval(() => {
        setNewsIndex((prev) => (prev + 1) % news.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [news]);

  const handleReaction = async (action: string) => {
    setIsLoading(true);
    setShowBubble(true);
    try {
      const text = await generateSantaReaction(action);
      setMessage(text);
      speakText(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkshopDonation = async () => {
    setIsLoading(true);
    setShowBubble(true);
    soundManager.playClick();
    soundManager.playGiftOpen();
    try {
      const thanks = await generateSantaWorkshopThanks();
      setMessage(thanks);
      await speakText(thanks);
      setTimeout(() => {
        onOpenDonation?.();
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wish.trim() || isLoading) return;
    setIsLoading(true);
    soundManager.playClick();
    try {
      const response = await generateLetterResponse(wish);
      setMessage(response);
      speakText(response);
      setShowMailbox(false);
      setWish('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoke = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setShowBubble(true);
    soundManager.playClick();
    try {
      const currentMoodObj = MOODS.find(m => m.id === mood) || MOODS[0];
      const joke = await generateSantaJoke(currentMoodObj.label);
      setMessage(joke);
      speakText(joke);
      setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 5) }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const changeMood = (newMoodId: string) => {
    soundManager.playClick();
    setMood(newMoodId);
    localStorage.setItem(SANTA_MOOD_KEY, newMoodId);
    setShowMoodMenu(false);
    const moodObj = MOODS.find(m => m.id === newMoodId);
    if (moodObj) {
      setMessage(`Τώρα νιώθω ${moodObj.label}! ${moodObj.emoji}`);
      setShowBubble(true);
    }
  };

  const handleScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    soundManager.playClick();
    try {
      const verdict = await scanUserStatus();
      const verdictText = `Λοιπόν... το σκανάρισμα λέει: ${verdict.status}! ${verdict.reason} Για δώρο προτείνω: ${verdict.giftRecommendation}!`;
      setMessage(verdictText);
      speakText(verdictText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const speakText = async (text: string) => {
    if (!soundManager.isChannelEnabled('narrator')) return;
    stopSpeech();
    setIsSpeaking(true);
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        const audioData = soundManager.decodeBase64(base64);
        const audioBuffer = await soundManager.decodePCMToBuffer(audioData, 24000, 1);
        const ctx = soundManager.getContext();
        if (ctx) {
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.onended = () => setIsSpeaking(false);
          audioSourceRef.current = source;
          source.start();
          return new Promise((resolve) => {
            source.onended = resolve;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  const stopSpeech = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const currentMoodEmoji = MOODS.find(m => m.id === mood)?.emoji || '😊';

  return (
    <div className="fixed top-32 left-8 z-[100] flex flex-col items-start gap-4 pointer-events-none">
      <div className="relative pointer-events-auto">
        
        {/* North Pole News Ticker */}
        {news.length > 0 && (
          <div className="absolute -top-28 left-0 w-64 bg-indigo-900/80 backdrop-blur-md p-2 rounded-xl border border-indigo-400/30 shadow-xl animate-fade-in overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <Newspaper size={12} className="text-indigo-300 animate-pulse" />
              <span className="text-[8px] font-black text-indigo-200 uppercase tracking-widest">North Pole News</span>
            </div>
            <p className="text-[10px] text-white/90 italic animate-slide-left whitespace-nowrap">
              {news[newsIndex]}
            </p>
          </div>
        )}

        {/* Santa Stats HUD & Workshop Meter */}
        <div className="absolute -left-4 -bottom-48 bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-40 shadow-xl animate-fade-in flex flex-col gap-3">
          <div>
            <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-2">Santa Diagnostics</p>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Coffee size={10} className="text-orange-400" />
                <span className="text-[9px] font-bold text-white">{stats.cookies}</span>
              </div>
              <div className="flex justify-between items-center">
                <Zap size={10} className="text-yellow-400" />
                <span className="text-[9px] font-bold text-white">{stats.happiness}%</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${stats.happiness}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-[7px] font-black text-yellow-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Trophy size={8} /> Workshop Fund
            </p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000" 
                style={{ width: `${workshopSupport}%` }} 
              />
            </div>
            <p className="text-[8px] text-yellow-200/50 mt-1 font-bold">{workshopSupport}% Magic Level</p>
          </div>
        </div>

        {/* Mood Selector Menu (Floating) */}
        {showMoodMenu && (
          <div className="absolute left-0 -top-48 bg-indigo-950/90 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl animate-slide-up z-[30] w-48">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Επίλεξε Διάθεση</span>
              <X size={14} className="text-white/30 cursor-pointer hover:text-white" onClick={() => setShowMoodMenu(false)} />
            </div>
            <div className="grid gap-1">
              {MOODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => changeMood(m.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${mood === m.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-100/60 hover:bg-white/10'}`}
                >
                  <span className="flex items-center gap-2"><span>{m.emoji}</span> {m.label}</span>
                  {mood === m.id && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Speech Bubble / Mailbox */}
        {showBubble && (
          <div className="absolute left-24 -top-16 w-80 bg-white p-5 rounded-[2.5rem] rounded-bl-none shadow-2xl border-4 border-red-500 animate-pop-in z-20">
            <button 
              onClick={() => { setShowBubble(false); setShowMailbox(false); }}
              className="absolute top-3 right-3 text-red-200 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
            
            {showMailbox ? (
              <form onSubmit={handleSendLetter} className="flex flex-col gap-3">
                <p className="text-[#4e342e] text-[10px] font-black uppercase tracking-widest mb-1">Γράψε την ευχή σου:</p>
                <textarea 
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  placeholder="Αγαπητέ Άη Βασίλη..."
                  className="w-full h-20 bg-red-50 border-2 border-red-200 rounded-xl p-3 text-xs text-[#4e342e] outline-none focus:border-red-400 transition-all resize-none"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !wish.trim()}
                  className="bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                >
                  <Send size={14} /> Στείλε Γράμμα
                </button>
              </form>
            ) : (
              <p className="text-[#4e342e] text-sm font-bold leading-relaxed italic pr-4">
                {isLoading || isScanning ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> 
                    {isScanning ? 'Σκανάρω την καλοσύνη σου...' : 'Σκέφτομαι...'}
                  </span>
                ) : `"${message}"`}
              </p>
            )}

            {isSpeaking && !showMailbox && (
              <div className="flex gap-1 mt-3 justify-center">
                <div className="w-1.5 h-3 bg-red-500 rounded-full animate-visualizer-1" />
                <div className="w-1.5 h-6 bg-red-500 rounded-full animate-visualizer-2" />
                <div className="w-1.5 h-3 bg-red-500 rounded-full animate-visualizer-3" />
              </div>
            )}
          </div>
        )}

        {/* Santa Avatar & Controls */}
        <div className="flex flex-col items-center gap-3">
          <button 
            onClick={handleJoke}
            className={`relative group transition-all hover:scale-110 active:scale-95 ${isSpeaking ? 'animate-belly-laugh' : 'animate-float'}`}
          >
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all" />
            <div className="relative text-8xl md:text-9xl drop-shadow-[0_10px_25px_rgba(185,28,28,0.5)] select-none">
              🎅
            </div>
            {isScanning && (
              <div className="absolute inset-0 border-4 border-cyan-400 rounded-full animate-ping opacity-50" />
            )}
            {/* Golden Sparkles for Workshop Fund */}
            <div className="absolute -top-4 -right-4 animate-bounce">
              <Star className="text-yellow-400 fill-yellow-400" size={24} />
            </div>
          </button>

          {/* Interaction Menu */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl pointer-events-auto">
            <button 
              onClick={handleScan}
              disabled={isScanning || isLoading}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all hover:scale-110 active:scale-90 shadow-lg"
              title="Scanner Καλοσύνης"
            >
              <Radar size={18} className={isScanning ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => { setShowMailbox(!showMailbox); setShowBubble(true); soundManager.playClick(); }}
              disabled={isScanning || isLoading}
              className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-90 shadow-lg ${showMailbox ? 'bg-yellow-500 text-black' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              title="Στείλε Γράμμα"
            >
              <Mail size={18} />
            </button>
            
            {/* SPECIAL DONATE BUTTON: Workshop Fund */}
            <button 
              onClick={handleWorkshopDonation}
              disabled={isScanning || isLoading}
              className="p-2 bg-gradient-to-tr from-yellow-600 to-yellow-400 text-white rounded-xl transition-all hover:scale-125 active:scale-90 shadow-[0_0_15px_rgba(250,204,21,0.5)] group/donate relative"
              title="Υποστήριξε το Εργαστήριο"
            >
              <Heart size={18} className="fill-white group-hover/donate:animate-ping" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[7px] font-black px-2 py-0.5 rounded opacity-0 group-hover/donate:opacity-100 transition-opacity whitespace-nowrap border border-yellow-200">
                SUPPORT MAGIC
              </div>
            </button>

            {/* MOOD SWITCHER BUTTON */}
            <button 
              onClick={() => { setShowMoodMenu(!showMoodMenu); soundManager.playClick(); }}
              className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-90 shadow-lg flex items-center justify-center relative overflow-hidden bg-white/5 border border-white/10 text-white hover:bg-white/10`}
              title="Άλλαξε Διάθεση"
            >
              <div className="text-lg">{currentMoodEmoji}</div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-indigo-900">
                <ChevronDown size={8} className="text-indigo-900" />
              </div>
            </button>

            <button 
              onClick={handleJoke}
              disabled={isScanning || isLoading}
              className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all hover:scale-110 active:scale-90 shadow-lg"
              title="Πες μου αστείο"
            >
              <Smile size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.8) translate(-20px, 20px); opacity: 0; }
          100% { transform: scale(1) translate(0, 0); opacity: 1; }
        }
        @keyframes visualizer {
          0%, 100% { height: 6px; }
          50% { height: 18px; }
        }
        .animate-visualizer-1 { animation: visualizer 0.4s infinite; }
        .animate-visualizer-2 { animation: visualizer 0.4s infinite 0.1s; }
        .animate-visualizer-3 { animation: visualizer 0.4s infinite 0.2s; }
        
        @keyframes belly-laugh {
          0%, 100% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.1, 0.9) translateY(5px); }
          75% { transform: scale(0.9, 1.1) translateY(-10px); }
        }
        .animate-belly-laugh { animation: belly-laugh 0.3s infinite; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }

        @keyframes slide-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-slide-left {
          display: inline-block;
          animation: slide-left 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SantaSpeaker;
