
import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, Camera, Video, Sparkles, Loader2, Play, Download, Wand2, ShieldCheck } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { transformToElf, generateSantaVideo } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface NorthPoleCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NorthPoleCommandCenter: React.FC<NorthPoleCommandCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'mirror' | 'cinema'>('live');
  const [isCalling, setIsCalling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [city, setCity] = useState('');

  // Live API States
  const [nextStartTime, setNextStartTime] = useState(0);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  if (!isOpen) return null;

  const startSantaCall = async () => {
    setIsCalling(true);
    soundManager.playClick();
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    outputAudioContextRef.current = outputAudioContext;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = inputAudioContext.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            
            let binary = '';
            const bytes = new Uint8Array(int16.buffer);
            for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
            const base64 = btoa(binary);

            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            const binaryString = atob(audioBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = outputAudioContext.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

            const source = outputAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(outputAudioContext.destination);
            
            const startTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            source.start(startTime);
            setNextStartTime(startTime + buffer.duration);
            sourcesRef.current.add(source);
          }
        },
        onclose: () => setIsCalling(false),
        onerror: () => setIsCalling(false),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        systemInstruction: 'Είσαι ο Άη Βασίλης. Μίλα με ζεστασιά, χαρά και ενθουσιασμό. Χρησιμοποίησε το "Χο Χο Χο!". Απάντησε στα Ελληνικά.',
      },
    });
  };

  const handleMirrorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    soundManager.playClick();
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const transformed = await transformToElf(base64);
        setTransformedImage(transformed);
        soundManager.playGiftOpen();
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCinemaGenerate = async () => {
    if (!city.trim()) return;
    setIsProcessing(true);
    setGeneratedVideoUrl(null);
    soundManager.playClick();
    try {
      const videoUrl = await generateSantaVideo(city);
      setGeneratedVideoUrl(videoUrl);
      soundManager.playGiftOpen();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="bg-[#020617] w-full max-w-5xl rounded-[3rem] border-2 border-indigo-500/30 shadow-[0_0_150px_rgba(79,70,229,0.3)] relative overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">North Pole Command Center</h2>
              <p className="text-indigo-400/40 text-[10px] uppercase tracking-[0.3em] font-black">Quantum AI Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 border-b border-white/5">
          <button onClick={() => setActiveTab('live')} className={`flex-1 py-5 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'live' ? 'bg-indigo-600/30 text-white border-b-4 border-indigo-500' : 'text-white/30 hover:bg-white/5'}`}>
            <Mic size={16} /> Santa Live
          </button>
          <button onClick={() => setActiveTab('mirror')} className={`flex-1 py-5 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'mirror' ? 'bg-indigo-600/30 text-white border-b-4 border-indigo-500' : 'text-white/30 hover:bg-white/5'}`}>
            <Camera size={16} /> Magic Mirror
          </button>
          <button onClick={() => setActiveTab('cinema')} className={`flex-1 py-5 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'cinema' ? 'bg-indigo-600/30 text-white border-b-4 border-indigo-500' : 'text-white/30 hover:bg-white/5'}`}>
            <Video size={16} /> Cinema Gen
          </button>
        </div>

        <div className="flex-grow p-8 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center min-h-[500px]">
          
          {activeTab === 'live' && (
            <div className="text-center space-y-8 animate-fade-in max-w-md">
              <div className="relative inline-block">
                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${isCalling ? 'border-red-500 animate-pulse bg-red-500/10' : 'border-indigo-500/30 bg-white/5'}`}>
                   <span className="text-6xl">{isCalling ? '🎅' : '📞'}</span>
                </div>
                {isCalling && (
                  <div className="absolute -top-4 -right-4 bg-red-600 text-[8px] font-black px-2 py-1 rounded-full animate-bounce">LIVE</div>
                )}
              </div>
              <h3 className="text-2xl font-festive text-white">Μίλα ζωντανά με τον Άη Βασίλη</h3>
              <p className="text-indigo-200/60 text-sm italic">"Πες του τις επιθυμίες σου και άκουσε τις γιορτινές του συμβουλές!"</p>
              
              <button 
                onClick={isCalling ? () => window.location.reload() : startSantaCall}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${isCalling ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                {isCalling ? <MicOff size={20} /> : <Mic size={20} />}
                {isCalling ? 'Τερματισμός Κλήσης' : 'Έναρξη Κλήσης'}
              </button>
            </div>
          )}

          {activeTab === 'mirror' && (
            <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="w-64 h-80 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  {transformedImage ? (
                    <img src={transformedImage} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera size={48} className="text-indigo-400/40 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest px-6">Upload your photo to transform</p>
                    </>
                  )}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 size={40} className="text-indigo-500 animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl font-festive text-white text-left">Magic Mirror</h3>
                  <p className="text-indigo-200/60 text-xs italic text-left max-w-xs leading-relaxed">Μεταμορφώσου σε έναν από τους βοηθούς του Άη Βασίλη χρησιμοποιώντας την AI του Gemini!</p>
                  
                  <label className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-8 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
                    <Wand2 size={16} /> Επιλογή Φωτογραφίας
                    <input type="file" className="hidden" accept="image/*" onChange={handleMirrorUpload} />
                  </label>

                  {transformedImage && (
                    <button onClick={() => window.open(transformedImage)} className="text-indigo-300 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 justify-center">
                      <Download size={14} /> Λήψη Φωτογραφίας
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cinema' && (
            <div className="w-full max-w-3xl text-center space-y-8 animate-fade-in">
              <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden aspect-video relative flex flex-col items-center justify-center">
                 {generatedVideoUrl ? (
                   <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                 ) : (
                   <div className="p-12">
                      <Video size={80} className="text-indigo-400/20 mb-6 mx-auto" />
                      <h4 className="text-xl font-festive text-white/40">Το Cinematic Video σου θα εμφανιστεί εδώ</h4>
                   </div>
                 )}
                 {isProcessing && (
                   <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-6">
                      <Loader2 size={60} className="text-indigo-500 animate-spin" />
                      <div className="text-center">
                        <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Generating Video... (approx. 2min)</p>
                        <p className="text-indigo-300/40 text-[10px] italic mt-2">Το Veo 3.1 σχεδιάζει το ταξίδι του Άη Βασίλη</p>
                      </div>
                   </div>
                 )}
              </div>

              <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                <input 
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Γράψε την πόλη σου..."
                  className="flex-grow bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-indigo-500 transition-all"
                />
                <button 
                  onClick={handleCinemaGenerate}
                  disabled={isProcessing || !city.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black px-10 py-5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 text-[10px] uppercase tracking-widest"
                >
                  <Sparkles size={16} /> Δημιουργία Video
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 text-center">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black flex items-center justify-center gap-2">
            <Sparkles size={10} className="text-yellow-500" /> North Pole AI Infrastructure v3.5 <Sparkles size={10} className="text-yellow-500" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default NorthPoleCommandCenter;
