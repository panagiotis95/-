
import React from 'react';

const Aurora: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] opacity-40">
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] bg-gradient-to-b from-emerald-500/20 via-cyan-500/10 to-transparent blur-[100px] animate-aurora-1" />
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[70%] bg-gradient-to-b from-purple-500/15 via-indigo-500/10 to-transparent blur-[120px] animate-aurora-2" />
      <div className="absolute top-[-30%] right-[-10%] w-[100%] h-[50%] bg-gradient-to-b from-teal-400/20 via-blue-500/5 to-transparent blur-[80px] animate-aurora-3" />
      
      {/* Distant Forest Silhouette */}
      <div className="absolute bottom-0 w-full h-[30%] opacity-20 flex items-end justify-between px-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[80px] border-l-transparent border-r-transparent border-b-[#020617]" 
            style={{ 
              transform: `scale(${0.5 + Math.random()})`,
              marginRight: `-${Math.random() * 20}px`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes aurora-1 {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(50px) rotate(2deg) scale(1.1); opacity: 0.7; }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1.1); }
          50% { transform: translateY(-30px) rotate(-1deg) scale(1.2); opacity: 0.6; }
        }
        @keyframes aurora-3 {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(100px) scale(1.1); opacity: 0.8; }
        }
        .animate-aurora-1 { animation: aurora-1 15s ease-in-out infinite; }
        .animate-aurora-2 { animation: aurora-2 20s ease-in-out infinite; }
        .animate-aurora-3 { animation: aurora-3 18s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Aurora;