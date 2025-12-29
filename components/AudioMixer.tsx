
import React from 'react';
import { Flame, Zap, Headphones, Music, Volume2, VolumeX, Settings2 } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface AudioMixerProps {
  settings: {
    master: boolean;
    fire: boolean;
    effects: boolean;
    narrator: boolean;
  };
  onUpdate: (settings: any) => void;
  isOpen: boolean;
}

const AudioMixer: React.FC<AudioMixerProps> = ({ settings, onUpdate, isOpen }) => {
  if (!isOpen) return null;

  const toggle = (key: keyof typeof settings) => {
    soundManager.playClick();
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const channels = [
    { key: 'fire', label: 'Τζάκι', icon: <Flame size={18} />, color: 'text-orange-400' },
    { key: 'effects', label: 'Εφέ & Κόρνες', icon: <Zap size={18} />, color: 'text-blue-400' },
    { key: 'narrator', label: 'Αφήγηση AI', icon: <Headphones size={18} />, color: 'text-purple-400' },
  ];

  return (
    <div className="absolute top-20 right-0 w-64 bg-indigo-950/90 backdrop-blur-2xl rounded-[2rem] border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 animate-slide-up z-50">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <Settings2 size={20} className="text-indigo-300" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Audio Mixer</h3>
      </div>

      <div className="space-y-4">
        {/* Master Switch */}
        <button 
          onClick={() => toggle('master')}
          className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${settings.master ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/5 border-white/5'}`}
        >
          <div className="flex items-center gap-3">
            {settings.master ? <Volume2 size={18} className="text-green-400" /> : <VolumeX size={18} className="text-red-400" />}
            <span className="text-xs font-bold text-white">Γενικός Ήχος</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.master ? 'bg-green-500' : 'bg-white/20'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.master ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </button>

        <div className="h-px bg-white/5 my-2" />

        {/* Individual Channels */}
        {channels.map((ch) => (
          <button 
            key={ch.key}
            onClick={() => toggle(ch.key as any)}
            disabled={!settings.master}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${!settings.master ? 'opacity-30' : ''} ${settings[ch.key as keyof typeof settings] ? 'bg-white/10 border-white/10' : 'bg-transparent border-transparent'}`}
          >
            <div className="flex items-center gap-3">
              <div className={ch.color}>{ch.icon}</div>
              <span className="text-xs font-medium text-indigo-100">{ch.label}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${settings[ch.key as keyof typeof settings] && settings.master ? 'bg-indigo-400' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings[ch.key as keyof typeof settings] && settings.master ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-6 text-[9px] text-white/20 text-center uppercase tracking-widest font-black">
        Εξατομικευμένη Ατμόσφαιρα
      </p>
    </div>
  );
};

export default AudioMixer;
