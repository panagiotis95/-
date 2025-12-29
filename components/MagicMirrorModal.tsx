
import React, { useState, useRef } from 'react';
import { X, Camera, Wand2, Download, Loader2, Sparkles, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { transformToElf } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface MagicMirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MagicMirrorModal: React.FC<MagicMirrorModalProps> = ({ isOpen, onClose }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
      setResultImage(null);
      soundManager.playClick();
    };
    reader.readAsDataURL(file);
  };

  const handleTransform = async () => {
    if (!sourceImage || isProcessing) return;

    setIsProcessing(true);
    soundManager.playClick();
    
    try {
      // Extract base64 part
      const base64 = sourceImage.split(',')[1];
      const transformed = await transformToElf(base64);
      setResultImage(transformed);
      soundManager.playGiftOpen();
    } catch (error) {
      console.error("Transformation failed:", error);
      alert("Η μαγεία απέτυχε προσωρινά. Δοκίμασε άλλη φωτογραφία!");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setSourceImage(null);
    setResultImage(null);
    setIsProcessing(false);
    soundManager.playClick();
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className="bg-gradient-to-b from-indigo-900 via-blue-900 to-indigo-950 w-full max-w-4xl rounded-[4rem] border-4 border-yellow-500/30 shadow-[0_0_150px_rgba(234,179,8,0.3)] relative overflow-hidden flex flex-col animate-slide-up">
        
        {/* Decorative Mirror Frame Glow */}
        <div className="absolute inset-0 border-[16px] border-yellow-500/10 pointer-events-none rounded-[4rem]" />
        
        {/* Header */}
        <div className="p-8 flex items-center justify-between relative z-10 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-3 rounded-full shadow-lg">
              <Camera className="text-black" size={28} />
            </div>
            <div>
              <h2 className="text-4xl font-festive text-white">Magic Mirror</h2>
              <p className="text-yellow-400/40 text-[10px] uppercase tracking-[0.4em] font-black">Elf Character Creator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50 hover:rotate-90">
            <X size={28} />
          </button>
        </div>

        <div className="flex-grow p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col items-center">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-3xl">
            
            {/* Input Side */}
            <div className="flex flex-col items-center gap-6">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`relative w-full aspect-[3/4] bg-black/40 rounded-[3rem] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer ${sourceImage ? 'border-yellow-500/50' : 'border-white/10 hover:border-white/30'}`}
              >
                {sourceImage ? (
                  <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
                ) : (
                  <>
                    <ImageIcon size={64} className="text-white/10 group-hover:text-white/20 mb-4 transition-transform group-hover:scale-110" />
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center px-8 leading-relaxed">
                      Ανέβασε μια καθαρή φωτογραφία προσώπου
                    </p>
                  </>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-full h-2 bg-yellow-400 shadow-[0_0_20px_#facc15] animate-scan-line absolute top-0 z-20" />
                    <Loader2 size={48} className="text-yellow-400 animate-spin mb-4" />
                    <span className="text-yellow-400 font-black text-[10px] uppercase tracking-widest">Σκανάρισμα...</span>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>

              {!resultImage && (
                <button 
                  onClick={handleTransform}
                  disabled={!sourceImage || isProcessing}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-20 text-black font-black py-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  <Wand2 size={20} /> Μεταμόρφωση σε Ξωτικό
                </button>
              )}
            </div>

            {/* Result Side */}
            <div className="flex flex-col items-center gap-6">
              <div className={`relative w-full aspect-[3/4] bg-indigo-950/40 rounded-[3rem] border-4 border-yellow-500/20 flex flex-col items-center justify-center overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]`}>
                {resultImage ? (
                  <div className="relative w-full h-full animate-pop-in">
                    <img src={resultImage} className="w-full h-full object-cover" alt="Result" />
                    <div className="absolute inset-0 pointer-events-none">
                       <Sparkles className="absolute top-4 left-4 text-yellow-400 animate-pulse" size={24} />
                       <Sparkles className="absolute bottom-4 right-4 text-yellow-400 animate-pulse" size={24} style={{animationDelay: '0.5s'}} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 opacity-20">
                    <Sparkles size={80} className="text-white mx-auto mb-4" />
                    <p className="font-festive text-2xl text-white">Η μαγεία θα εμφανιστεί εδώ</p>
                  </div>
                )}
              </div>

              {resultImage && (
                <div className="w-full flex gap-4">
                  <button 
                    onClick={reset}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-[2rem] border border-white/10 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                  >
                    <RefreshCcw size={16} /> Νέα Φωτογραφία
                  </button>
                  <button 
                    onClick={() => {
                       const link = document.createElement('a');
                       link.href = resultImage;
                       link.download = 'my-elf-avatar.png';
                       link.click();
                       soundManager.playClick();
                    }}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    <Download size={16} /> Λήψη Φωτογραφίας
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="mt-12 text-center max-w-lg">
             <p className="text-blue-200/40 text-[10px] leading-relaxed italic uppercase tracking-wider">
               "Η AI αναλύει τα χαρακτηριστικά σου και σε τοποθετεί στην ομάδα του Άη Βασίλη. Μην ξεχάσεις να μοιραστείς το αποτέλεσμα!"
             </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-6 bg-black/40 border-t border-white/5 text-center">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black flex items-center justify-center gap-2">
             North Pole AI Image Processing v4.0 <Sparkles size={10} className="text-yellow-500" />
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan 2s ease-in-out infinite;
        }
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
};

export default MagicMirrorModal;
