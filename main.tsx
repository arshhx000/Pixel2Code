import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import Studio from './src/pages/Studio';
import Reconstruct from './src/pages/Reconstruct';

function MainApp() {
  const [activeTab, setActiveTab] = useState('studio');

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-mono text-zinc-300 uppercase selection:bg-orange-500 selection:text-black">
      {/* Top hardware rail */}
      <nav className="bg-zinc-900 border-b-2 border-zinc-800 p-2 shrink-0 z-50 flex items-center justify-between shadow-[0_4px_0_0_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse ml-2"></div>
          <div>
            <span className="font-black text-white tracking-widest block leading-tight">PIXEL DATA STUDIO</span>
            <span className="text-[10px] text-orange-500 tracking-widest block">TE-1 SYS_ARCH</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => setActiveTab('studio')}
            className={`px-6 py-2 font-bold text-xs tracking-widest border-2 transition-all ${activeTab === 'studio' ? 'bg-orange-500 border-orange-500 text-black shadow-[2px_2px_0_0_#000]' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
          >
            [1] EXTRACTOR
          </button>
          <button 
            onClick={() => setActiveTab('reconstruct')}
            className={`px-6 py-2 font-bold text-xs tracking-widest border-2 transition-all ${activeTab === 'reconstruct' ? 'bg-orange-500 border-orange-500 text-black shadow-[2px_2px_0_0_#000]' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
          >
            [2] RECONSTRUCT
          </button>
        </div>
      </nav>
      
      {/* Tape marks / decorative */}
      <div className="w-full h-1 bg-zinc-800 flex justify-between px-4 z-40 relative">
        <div className="w-8 h-full bg-zinc-600"></div>
        <div className="w-8 h-full bg-zinc-600"></div>
      </div>

      <div className="flex-1 relative">
        <div className={`absolute inset-0 ${activeTab === 'studio' ? 'block' : 'hidden'}`}>
          <Studio />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'reconstruct' ? 'block' : 'hidden'}`}>
          <Reconstruct />
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<MainApp />);
