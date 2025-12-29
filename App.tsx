
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import Snowfall from './components/Snowfall';
import Aurora from './components/Aurora';
import Tree from './components/Tree';
import Gift from './components/Gift';
import SantaSleigh from './components/SantaSleigh';
import GiftTruck from './components/GiftTruck';
import IdeaArchive from './components/IdeaArchive';
import ChristmasGreetings from './components/ChristmasGreetings';
import ChristmasCarols from './components/ChristmasCarols';
import DonationModal from './components/DonationModal';
import HugsModal from './components/HugsModal';
import ShopModal from './components/ShopModal';
import AdventCalendar from './components/AdventCalendar';
import StoryLibrary from './components/StoryLibrary';
import SantasListModal from './components/SantasListModal';
import AIGiftAssistant from './components/AIGiftAssistant';
import CozyHouse from './components/CozyHouse';
import AudioMixer from './components/AudioMixer';
import ChristmasMap from './components/ChristmasMap';
import SantaRadarSection from './components/SantaRadarSection';
import ElfFactory from './components/ElfFactory';
import MiracleSpark from './components/MiracleSpark';
import SantaSpeaker from './components/SantaSpeaker';
import NorthPoleMountain from './components/NorthPoleMountain';
import MagicSolverModal from './components/MagicSolverModal';
import NorthPoleCommandCenter from './components/NorthPoleCommandCenter';
import MagicMirrorModal from './components/MagicMirrorModal';
import SocialShareModal from './components/SocialShareModal';
import FestiveShoppingModal from './components/FestiveShoppingModal';
import FestiveKitchenAndLogistics from './components/FestiveKitchenAndLogistics';
import FestiveGarden from './components/FestiveGarden';
import MagicWand from './components/MagicWand';
import TriviaModal from './components/TriviaModal';
import ElfNameModal from './components/ElfNameModal';
import WeatherWidget from './components/WeatherWidget';
import MemoryJarModal from './components/MemoryJarModal';
import TreeLabModal from './components/TreeLabModal';
import PostcardCreatorModal from './components/PostcardCreatorModal';
import { ChristmasIdea, GiftItem, ChristmasStory } from './types';
import { generateChristmasIdea, generateCozyStory } from './services/geminiService';
import { soundManager } from './services/soundManager';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, BookOpen, Volume2, VolumeX, Share2, Heart, Book, X, Calendar, Star, Scroll, Wand2, Settings2, Radar, Lightbulb, Terminal, Camera, ShoppingBasket, ChefHat, RefreshCcw, Coffee, Smile, ShoppingBag, LogIn, Loader2, Snowflake, Music2, Archive, ShieldCheck, Hammer, Layers, Globe, Languages, Cookie, Bell, Info, BrainCircuit, CloudSun, CloudSnow, History, TreePine, Image as ImageIcon, HeartHandshake } from 'lucide-react';

const INITIAL_GIFTS: GiftItem[] = [
  { id: 1, color: 'bg-red-600', isOpen: false, name: 'Κόκκινη Αγάπη', price: '$5' },
  { id: 2, color: 'bg-green-600', isOpen: false, name: 'Πράσινη Αγάπη', price: '$10' },
  { id: 3, color: 'bg-blue-600', isOpen: false, name: 'Μπλε Αγάπη', price: '$12', isSpecialOffer: true },
  { id: 4, color: 'bg-purple-600', isOpen: false, name: 'Μωβ Αγάπη', price: '$20' },
  { id: 5, color: 'bg-orange-500', isOpen: false, name: 'Πορτοκαλί Αγάπη', price: '$25' },
  { id: 6, color: 'bg-teal-500', isOpen: false, name: 'Γαλάζια Αγάπη', price: '$50' },
  { id: 7, color: 'bg-yellow-500', isOpen: false, name: 'Αγάπη της Πράξης', price: '$100' },
  { id: 8, color: 'bg-pink-500', isOpen: false, name: 'Αγάπη της Ιδέας', price: '$35' },
  { id: 9, color: 'bg-slate-400', isOpen: false, name: 'Αγάπη του Λόγου', price: '$15' },
];

const App: React.FC = () => {
  const [gifts, setGifts] = useState<GiftItem[]>(INITIAL_GIFTS);
  const [history, setHistory] = useState<ChristmasIdea[]>([]);
  const [favoriteIdeas, setFavoriteIdeas] = useState<ChristmasIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStoryLibrary, setShowStoryLibrary] = useState(false);
  const [showSantasList, setShowSantasList] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSolver, setShowSolver] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [showMagicMirror, setShowMagicMirror] = useState(false);
  const [showSocialHub, setShowSocialHub] = useState(false);
  const [showShopping, setShowShopping] = useState(false);
  const [showKitchen, setShowKitchen] = useState(false);
  const [showTrivia, setShowTrivia] = useState(false);
  const [showElfName, setShowElfName] = useState(false);
  const [showMemoryJar, setShowMemoryJar] = useState(false);
  const [showTreeLab, setShowTreeLab] = useState(false);
  const [showPostcardStudio, setShowPostcardStudio] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showHugs, setShowHugs] = useState(false);
  
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [wandActive, setWandActive] = useState(false);
  const [festiveSpirit, setFestiveSpirit] = useState(0);
  const [elfCredits, setElfCredits] = useState(100);
  const [treeMagicEffect, setTreeMagicEffect] = useState<string | null>(null);
  
  const [audioSettings, setAudioSettings] = useState({
    master: false, fire: true, effects: true, narrator: true
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedSpirit = localStorage.getItem('festive_spirit_v2');
    const savedCredits = localStorage.getItem('elf_credits_v2');
    if (savedSpirit) setFestiveSpirit(parseInt(savedSpirit));
    if (savedCredits) setElfCredits(parseInt(savedCredits));
  }, []);

  useEffect(() => {
    localStorage.setItem('festive_spirit_v2', festiveSpirit.toString());
    localStorage.setItem('elf_credits_v2', elfCredits.toString());
  }, [festiveSpirit, elfCredits]);

  useEffect(() => {
    soundManager.updateSettings(audioSettings);
    if (audioRef.current) {
      if (audioSettings.master) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [audioSettings]);

  const addSpirit = (amount: number) => setFestiveSpirit(prev => Math.min(100, prev + amount));
  const addCredits = (amount: number) => setElfCredits(prev => prev + amount);

  return (
    <div 
      className={`relative min-h-screen w-full text-white flex flex-col items-center justify-between p-4 md:p-8 overflow-y-auto overflow-x-hidden transition-all duration-1000 ${wandActive ? 'cursor-none' : 'cursor-default'}`}
    >
      {snowEnabled && <Snowfall />}
      <Aurora />
      <MagicWand isActive={wandActive} />
      <audio ref={audioRef} loop preload="auto">
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
      </audio>

      {/* TOP HUD */}
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-4 hidden lg:flex">
         <div className="w-48 group">
            <div className="flex justify-between items-center mb-1 px-1 text-[10px] font-black uppercase tracking-widest text-blue-200/60">
              <span>Festive Spirit</span>
              <span>{festiveSpirit}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-lg">
              <div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full transition-all duration-700 relative" style={{ width: `${festiveSpirit}%` }}>
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>
         </div>
         <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 w-max">
            <div className="bg-yellow-500/20 p-1.5 rounded-lg"><Star className="text-yellow-400 fill-current" size={14} /></div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-white">{elfCredits}</span>
               <span className="text-[6px] text-indigo-300 uppercase font-bold tracking-widest">Elf Credits</span>
            </div>
         </div>
         <WeatherWidget />
      </div>

      <header className="z-30 text-center animate-fade-in relative flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-festive text-red-100 drop-shadow-[0_4px_10px_rgba(255,255,255,0.3)] mb-2">Merry Christmas! 🎄</h1>
        <p className="text-lg md:text-xl font-light text-blue-100 opacity-80 max-w-lg mx-auto px-4 mb-4">Η μαγεία της AI συναντά τη ζεστασιά των γιορτών!</p>
        <div className="w-full max-w-sm"><ChristmasCarols isGlobalAudioEnabled={audioSettings.master} /></div>
      </header>

      {/* RESTORED SMART DOCK - ALL ICONS ARE HERE */}
      <div className="fixed top-8 right-8 z-[150] h-[85vh] flex flex-col items-center">
        <div className="bg-black/40 backdrop-blur-3xl border-2 border-white/10 rounded-[3rem] p-4 flex flex-col gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-y-auto overflow-x-hidden custom-dock-scrollbar max-h-full transition-all hover:bg-black/50 group/dock pb-10">
          
          {/* Category: System & Magic */}
          <div className="flex flex-col gap-3">
             <SidebarIcon onClick={() => { setShowMixer(!showMixer); soundManager.playClick(); }} Icon={audioSettings.master ? Volume2 : VolumeX} label="Audio Mixer" color={audioSettings.master ? 'indigo' : 'red'} pulse={audioSettings.master} />
             <SidebarIcon onClick={() => { setSnowEnabled(!snowEnabled); soundManager.playClick(); }} Icon={Snowflake} label="Toggle Snow" color={snowEnabled ? 'cyan' : 'slate'} spin={snowEnabled} />
             <SidebarIcon onClick={() => { setWandActive(!wandActive); soundManager.playClick(); }} Icon={Wand2} label="Magic Wand" color={wandActive ? 'yellow' : 'slate'} pulse={wandActive} />
          </div>

          <div className="h-px bg-white/10 w-8 mx-auto" />

          {/* Category: AI Creative Tools (THE NEW ONES!) */}
          <div className="flex flex-col gap-3">
             <SidebarIcon onClick={() => setShowTreeLab(true)} Icon={TreePine} label="Tree Magic Lab" color="emerald" pulse={!!treeMagicEffect} />
             <SidebarIcon onClick={() => setShowPostcardStudio(true)} Icon={ImageIcon} label="Postcard Studio" color="indigo" />
             <SidebarIcon onClick={() => setShowMemoryJar(true)} Icon={History} label="Memory Jar" color="blue" />
             <SidebarIcon onClick={() => setShowSolver(true)} Icon={Lightbulb} label="Magic Solver" color="yellow" />
          </div>

          <div className="h-px bg-white/10 w-8 mx-auto" />

          {/* Category: Archives & Content */}
          <div className="flex flex-col gap-3">
             <SidebarIcon onClick={() => setIsArchiveOpen(true)} Icon={Archive} label="Αρχείο Ιδεών" color="indigo" />
             <SidebarIcon onClick={() => setShowStoryLibrary(true)} Icon={Book} label="Βιβλιοθήκη" color="amber" />
             <SidebarIcon onClick={() => setShowSantasList(true)} Icon={Scroll} label="Λίστα Δώρων" color="red" />
             <SidebarIcon onClick={() => setShowCalendar(true)} Icon={Calendar} label="Ημερολόγιο" color="blue" />
          </div>

          <div className="h-px bg-white/10 w-8 mx-auto" />

          {/* Category: Logistics & Command */}
          <div className="flex flex-col gap-3">
             <SidebarIcon onClick={() => setShowKitchen(true)} Icon={ChefHat} label="Festive Kitchen" color="orange" />
             <SidebarIcon onClick={() => setShowShopping(true)} Icon={ShoppingBasket} label="Logistics" color="emerald" />
             <SidebarIcon onClick={() => setShowCommandCenter(true)} Icon={Terminal} label="Command Hub" color="slate" />
             <SidebarIcon onClick={() => setShowMagicMirror(true)} Icon={Camera} label="Magic Mirror" color="purple" />
          </div>

          <div className="h-px bg-white/10 w-8 mx-auto" />

          {/* Category: Social & Games */}
          <div className="flex flex-col gap-3">
             <SidebarIcon onClick={() => setShowTrivia(true)} Icon={BrainCircuit} label="AI Trivia" color="purple" />
             <SidebarIcon onClick={() => setShowElfName(true)} Icon={Smile} label="Elf Name" color="emerald" />
             <SidebarIcon onClick={() => setShowMap(true)} Icon={Globe} label="Παγκόσμιος Χάρτης" color="cyan" />
             <SidebarIcon onClick={() => setShowSocialHub(true)} Icon={Share2} label="Social Share" color="blue" />
          </div>

          <div className="h-px bg-white/10 w-8 mx-auto" />

          {/* Category: Support & Shop */}
          <div className="flex flex-col gap-3">
             <SidebarIcon onClick={() => setShowShop(true)} Icon={ShoppingBag} label="Boutique" color="red" />
             <SidebarIcon onClick={() => setShowDonation(true)} Icon={Heart} label="Support Magic" color="red" />
             <SidebarIcon onClick={() => setShowHugs(true)} Icon={HeartHandshake} label="Send Hugs" color="orange" />
          </div>

          <div className="h-px bg-white/10 w-8 mx-auto" />

          {/* MAIN AI BUTTON */}
          <button onClick={() => { setShowAIAssistant(true); soundManager.playClick(); }} className="group relative bg-gradient-to-tr from-indigo-600 to-purple-600 p-4 rounded-[1.5rem] text-white shadow-xl hover:scale-110 active:scale-95 animate-pulse shrink-0">
            <Sparkles size={28} />
          </button>
        </div>
      </div>

      <main className="relative flex-grow flex flex-col items-center justify-center w-full z-10 py-12">
        <NorthPoleMountain onOpenDetails={() => setShowCommandCenter(true)} />
        <SantaSleigh />
        <GiftTruck onOpen={(idea) => { setHistory(prev => [idea, ...prev]); }} />
        <FestiveGarden />
        
        <div className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          <div className="animate-fade-in">
            <CozyHouse isGlobalAudioEnabled={audioSettings.master && audioSettings.fire} onClick={() => {}} />
          </div>
          <div className="relative flex flex-col items-center">
            <Tree onClick={() => setShowTreeLab(true)} />
            {treeMagicEffect && (
              <div className="absolute -bottom-8 bg-emerald-600/30 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-400/20 animate-pulse">
                Active Magic: {treeMagicEffect}
              </div>
            )}
          </div>
        </div>

        <ElfFactory />
        <MiracleSpark />
        <SantaSpeaker onOpenDonation={() => setShowDonation(true)} />
        <SantaRadarSection onOpenFullMap={() => setShowMap(true)} />
      </main>

      <IdeaArchive history={history} favoriteIdeas={favoriteIdeas} isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} onSelectIdea={() => {}} onToggleFavoriteIdea={(idea) => setFavoriteIdeas(prev => [...prev, idea])} />

      {/* Modals */}
      <MemoryJarModal isOpen={showMemoryJar} onClose={() => setShowMemoryJar(false)} history={history} />
      <TreeLabModal isOpen={showTreeLab} onClose={() => setShowTreeLab(false)} onApplyMagic={setTreeMagicEffect} />
      <PostcardCreatorModal isOpen={showPostcardStudio} onClose={() => setShowPostcardStudio(false)} />
      <TriviaModal isOpen={showTrivia} onClose={() => setShowTrivia(false)} onReward={addCredits} />
      <ElfNameModal isOpen={showElfName} onClose={() => setShowElfName(false)} />
      <ChristmasMap isOpen={showMap} onClose={() => setShowMap(false)} />
      <AIGiftAssistant isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} onSaveIdea={(idea) => setFavoriteIdeas(prev => [...prev, idea])} />
      <MagicSolverModal isOpen={showSolver} onClose={() => setShowSolver(false)} />
      <NorthPoleCommandCenter isOpen={showCommandCenter} onClose={() => setShowCommandCenter(false)} />
      <MagicMirrorModal isOpen={showMagicMirror} onClose={() => setShowMagicMirror(false)} />
      <SocialShareModal isOpen={showSocialHub} onClose={() => setShowSocialHub(false)} festiveSpirit={festiveSpirit} giftsCount={history.length} />
      <FestiveShoppingModal isOpen={showShopping} onClose={() => setShowShopping(false)} />
      <FestiveKitchenAndLogistics isOpen={showKitchen} onClose={() => setShowKitchen(false)} />
      <AdventCalendar isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
      <StoryLibrary isOpen={showStoryLibrary} onClose={() => setShowStoryLibrary(false)} />
      <SantasListModal isOpen={showSantasList} onClose={() => setShowSantasList(false)} favorites={[]} favoriteIdeas={favoriteIdeas} onRemoveFavorite={() => {}} onRemoveIdea={() => {}} onBuyNow={() => {}} />
      <ShopModal isOpen={showShop} onClose={() => setShowShop(false)} />
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
      <HugsModal isOpen={showHugs} onClose={() => setShowHugs(false)} />
      
      <style>{`
        .custom-dock-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-dock-scrollbar { scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
};

const SidebarIcon = ({ onClick, Icon, label, color, pulse, spin }: { onClick: () => void, Icon: any, label: string, color: string, pulse?: boolean, spin?: boolean }) => {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-600/20 border-indigo-500/50 text-indigo-100 hover:bg-indigo-600 hover:text-white',
    amber: 'bg-amber-600/20 border-amber-500/50 text-amber-100 hover:bg-amber-600 hover:text-white',
    red: 'bg-red-600/20 border-red-500/50 text-red-100 hover:bg-red-600 hover:text-white',
    blue: 'bg-blue-600/20 border-blue-500/50 text-blue-100 hover:bg-blue-600 hover:text-white',
    yellow: 'bg-yellow-600/20 border-yellow-500/50 text-yellow-100 hover:bg-yellow-600 hover:text-white',
    orange: 'bg-orange-600/20 border-orange-500/50 text-orange-100 hover:bg-orange-600 hover:text-white',
    emerald: 'bg-emerald-600/20 border-emerald-500/50 text-emerald-100 hover:bg-emerald-600 hover:text-white',
    slate: 'bg-slate-600/20 border-slate-500/50 text-slate-100 hover:bg-slate-600 hover:text-white',
    purple: 'bg-purple-600/20 border-purple-500/50 text-purple-100 hover:bg-purple-600 hover:text-white',
    cyan: 'bg-cyan-600/20 border-cyan-500/50 text-cyan-100 hover:bg-cyan-600 hover:text-white',
  };

  return (
    <div className="relative group shrink-0">
       <button onClick={onClick} className={`p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 shadow-lg ${colorMap[color]} ${pulse ? 'animate-pulse' : ''}`}>
         <Icon size={22} className={spin ? 'animate-spin-slow' : ''} />
       </button>
       <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 rounded-lg text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 pointer-events-none whitespace-nowrap border border-white/10 z-[300]">
         {label}
       </div>
    </div>
  );
};

export default App;
