import React, { useRef } from 'react';
import { UploadCloud, LayoutGrid, BarChart2 } from 'lucide-react';
import { CellData } from '../exporters';

interface SidebarProps {
  imageSrc: string | null;
  onImageUpload: (file: File) => void;
  cols: number;
  setCols: (n: number) => void;
  rows: number;
  setRows: (n: number) => void;
  algorithm: string;
  setAlgorithm: (alg: any) => void;
  colors: CellData[];
  processTime: number;
  imgDim: { w: number; h: number };
  exportData: string;
  originalImgRef: React.RefObject<HTMLImageElement>;
}

export function StudioSidebar({
  imageSrc, onImageUpload, cols, setCols, rows, setRows, 
  algorithm, setAlgorithm, colors, processTime, imgDim, 
  exportData, originalImgRef
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
  };

  return (
    <aside className="w-80 border-r-2 border-zinc-700 bg-zinc-900 shrink-0 flex flex-col overflow-y-auto shadow-[4px_0_0_0_rgba(0,0,0,0.8)] z-10">
      <div className="p-4 border-b-2 border-zinc-800">
        <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
          <UploadCloud className="w-4 h-4" /> IMAGE_SOURCE
        </h2>
        <div className="mt-4">
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleUpload} accept="image/*" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-zinc-800 border-2 border-zinc-700 hover:border-orange-500 hover:text-orange-500 py-3 text-xs font-bold tracking-widest transition-colors"
          >
            {imageSrc ? 'REPLACE_FILE' : 'SELECT_FILE'}
          </button>
        </div>
        {imageSrc && (
          <img 
            ref={originalImgRef}
            src={imageSrc} 
            className="w-full h-32 object-cover mt-4 border-2 border-zinc-800 opacity-50 pointer-events-none"
            alt="original"
          />
        )}
      </div>

      <div className="p-4 border-b-2 border-zinc-800 space-y-4">
        <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" /> MATRIX_CONFIG
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 p-2">
            <label className="text-[10px] text-zinc-500 tracking-widest">COLS_X</label>
            <input 
              type="number" min="1" max="1024" value={cols} 
              onChange={e => setCols(Number(e.target.value) || 1)}
              className="w-full bg-transparent text-green-400 text-lg focus:outline-none"
            />
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-2">
            <label className="text-[10px] text-zinc-500 tracking-widest">ROWS_Y</label>
            <input 
              type="number" min="1" max="1024" value={rows} 
              onChange={e => setRows(Number(e.target.value) || 1)}
              className="w-full bg-transparent text-green-400 text-lg focus:outline-none"
            />
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-2">
          <label className="text-[10px] text-zinc-500 tracking-widest">SAMPLING_ALG</label>
          <select 
            value={algorithm} onChange={e => setAlgorithm(e.target.value)}
            className="w-full bg-transparent text-green-400 text-sm focus:outline-none mt-1"
          >
            <option value="Average">AVG_COLOR</option>
            <option value="Dominant">DOMINANT_COLOR</option>
            <option value="Median">MEDIAN_COLOR</option>
          </select>
        </div>
      </div>
      
      <div className="p-4 border-b-2 border-zinc-800 space-y-4">
         <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
          <BarChart2 className="w-4 h-4" /> DEV_TELEMETRY
        </h2>
        <div className="space-y-2 text-[10px] tracking-widest text-zinc-400">
           <div className="flex justify-between bg-zinc-950 p-1 border border-zinc-800">
             <span>NODES:</span><span className="text-orange-500">{colors.length}</span>
           </div>
           <div className="flex justify-between bg-zinc-950 p-1 border border-zinc-800">
             <span>PROC_TIME:</span><span className="text-orange-500">{processTime.toFixed(1)} MS</span>
           </div>
           <div className="flex justify-between bg-zinc-950 p-1 border border-zinc-800">
             <span>ORIG_DIM:</span><span className="text-orange-500">{imgDim.w}x{imgDim.h}</span>
           </div>
           <div className="flex justify-between bg-zinc-950 p-1 border border-zinc-800">
             <span>CODE_SIZE:</span><span className="text-orange-500">{(exportData.length / 1024).toFixed(1)} KB</span>
           </div>
        </div>
      </div>
    </aside>
  );
}
