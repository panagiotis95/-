
import React, { useState } from 'react';
import { X, Share2, Facebook, Twitter, MessageCircle, Copy, Check, Sparkles, Loader2, Link2, Globe, Heart, Award } from 'lucide-react';
import { generateSocialPost } from '../services/geminiService';
import { soundManager } from '../services/soundManager';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  festiveSpirit: number;
  giftsCount: number;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({ isOpen, onClose, festiveSpirit, giftsCount }) => {
  const [aiPost, setAiPost] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGeneratePost = async () => {
    setIsLoading(true);
    soundManager.playClick();
    try {
      const post = await generateSocialPost(festiveSpirit, giftsCount);
      setAiPost(post);
      soundManager.playGiftOpen();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiPost || window.location.href);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className="bg-gradient-to-br from-[#0a0a2e] to-[#1e1b4b] w-full max-w-2xl rounded-[3rem] border-2 border-indigo-500/30 shadow-[0_0_100px_rgba(79,70,229,0.3)] relative overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl">
              <Share2 className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-festive text-white">Social Hub</h2>
              <p className="text-indigo-400/40 text-[10px] uppercase tracking-[0.3em] font-black">Μοιράσου τη Μαγεία</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Nice List Certificate Preview */}
          <div className="bg-white/5 border border-yellow-500/20 rounded-[2.5rem] p-6 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative flex flex-col items-center text-center">
              <Award className="text-yellow-400 mb-4 animate-bounce-subtle" size={48} />
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Επίσημο Nice List Status</h3>
              <div className="flex gap-8 mt-4">
                <div>
                  <p className="text-indigo-300/40 text-[8px] uppercase font-black">Festive Spirit</p>
                  <p className="text-2xl font-black text-white">{festiveSpirit}%</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-indigo-300/40 text-[8px] uppercase font-black">Gifts Found</p>
                  <p className="text-2xl font-black text-white">{giftsCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Post Generator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-400" /> AI Post Generator
              </h3>
              <button 
                onClick={handleGeneratePost}
                disabled={isLoading}
                className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors flex items-center gap-1 uppercase"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                Δημιουργία Post
              </button>
            </div>

            <div className="relative">
              <div className="w-full min-h-[120px] bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-sm text-indigo-100 italic leading-relaxed">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Loader2 className="text-indigo-500 animate-spin mb-2" size={24} />
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Γράφοντας τη μαγεία...</p>
                  </div>
                ) : (
                  aiPost || "Πάτησε 'Δημιουργία Post' για να γράψει η AI κάτι μοναδικό για σένα!"
                )}
              </div>
              {aiPost && (
                <button 
                  onClick={handleCopy}
                  className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all border border-white/10"
                >
                  {copied ? <Check className="text-emerald-400" size={16} /> : <Copy className="text-white/60" size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Sharing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             <ShareBtn icon={<MessageCircle size={20} />} label="WhatsApp" color="bg-emerald-600" href={`https://wa.me/?text=${encodeURIComponent(aiPost || "Δες τη μαγεία!")} ${shareUrl}`} />
             <ShareBtn icon={<Facebook size={20} />} label="Facebook" color="bg-blue-600" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} />
             <ShareBtn icon={<Twitter size={20} />} label="X / Twitter" color="bg-black" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(aiPost || "")}&url=${shareUrl}`} />
             <button 
              onClick={handleCopy}
              className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group"
             >
               <div className="w-12 h-12 rounded-full bg-indigo-600/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                 {copied ? <Check size={20} className="text-emerald-400" /> : <Link2 size={20} />}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{copied ? 'Copied!' : 'Copy Link'}</span>
             </button>
          </div>

        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 text-center">
           <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black flex items-center justify-center gap-2">
             <Heart size={10} className="text-red-500" /> Spread the Love <Heart size={10} className="text-red-500" />
           </p>
        </div>
      </div>
    </div>
  );
};

const ShareBtn = ({ icon, label, color, href }: { icon: any, label: string, color: string, href: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    onClick={() => soundManager.playClick()}
    className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group"
  >
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{label}</span>
  </a>
);

export default SocialShareModal;
