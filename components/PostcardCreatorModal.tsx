
import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Sparkles, Loader2, Wand2, Download, ShieldCheck, Info, Camera } from 'lucide-react';
import { generatePostcard } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface PostcardCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostcardCreatorModal: React.FC<PostcardCreatorModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    if (isOpen) checkKey();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    soundManager.playClick();
    try {
      const imageUrl = await generatePostcard(prompt);
      setResult(imageUrl);
      soundManager.playGiftOpen();
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[270] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="bg-[#020617] w-full max-w-4xl rounded-[4rem] border-2 border-indigo-500/30 shadow-[0_0_150px_rgba(79,70,229,0.3)] relative overflow-hidden flex flex-col animate-slide-up">
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl">
              <Camera className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">AI Postcard Studio</h2>
              <p className="text-indigo-400/40 text-[10px] uppercase tracking-[0.3em] font-black">Powered by Gemini 3 Pro Image</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 flex-grow overflow-y-auto custom-scrollbar flex flex-col">
          {!hasKey ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border-2 border-indigo-500/30">
                  <ShieldCheck size={48} className="text-indigo-400" />
               </div>
               <div className="max-w-md space-y-4">
                  <h3 className="text-2xl font-festive text-white">Απαιτείται API Key (Paid)</h3>
                  <p className="text-indigo-100/60 text-sm leading-relaxed">
                    Για τη δημιουργία εικόνων υψηλής ποιότητας (4K), πρέπει να επιλέξεις ένα δικό σου API Key από ένα πληρωμένο GCP project.
                  </p>
                  <div className="flex items-center gap-2 justify-center text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 py-2 rounded-xl">
                    <Info size={12} /> <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">Billing Documentation</a>
                  </div>
               </div>
               <button 
                onClick={handleSelectKey}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-5 rounded-[2rem] shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest"
               >
                 Επιλογή API Key
               </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 h-full">
              <div className="space-y-10">
                 <div className="text-left">
                    <h3 className="text-3xl font-festive text-white mb-2">Σχεδίασε την κάρτα σου</h3>
                    <p className="text-indigo-300/40 text-[10px] font-black uppercase tracking-widest">Describe your vision</p>
                 </div>
                 <form onSubmit={handleGenerate} className="space-y-8">
                    <textarea 
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="π.χ. Ένα χιονισμένο χωριό τη νύχτα με έναν φωτεινό τάρανδο στον ουρανό..."
                      className="w-full h-48 bg-black/60 border-2 border-white/5 rounded-[2.5rem] p-8 text-lg text-indigo-100 outline-none focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                    />
                    <button 
                      disabled={isLoading || !prompt.trim()}
                      className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black rounded-[2.5rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                      Generate Cinematic Card
                    </button>
                 </form>
              </div>

              <div className="flex flex-col gap-6">
                 <div className="flex-grow bg-black/40 border-2 border-indigo-500/20 rounded-[3rem] overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center group">
                    {result ? (
                      <>
                        <img src={result} className="w-full h-full object-cover animate-pop-in" />
                        <button 
                          onClick={() => {
                             const link = document.createElement('a');
                             link.href = result;
                             link.download = 'christmas-postcard.png';
                             link.click();
                          }}
                          className="absolute bottom-6 right-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-indigo-600"
                        >
                          <Download size={24} />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-12 opacity-10">
                         <ImageIcon size={120} className="mx-auto mb-6" />
                         <p className="font-festive text-3xl">Η δημιουργία σου θα εμφανιστεί εδώ</p>
                      </div>
                    )}
                    {isLoading && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-6 z-10">
                         <Loader2 size={64} className="text-indigo-500 animate-spin" />
                         <div className="text-center">
                            <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Imaging Magic...</p>
                            <p className="text-indigo-300/40 text-[10px] italic mt-2">Gemini is painting your vision</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes pop-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
};

export default PostcardCreatorModal;
