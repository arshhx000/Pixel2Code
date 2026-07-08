import React from 'react';
import { Code, Copy, Download } from 'lucide-react';

interface ExportProps {
  exportFormat: string;
  setExportFormat: (f: string) => void;
  exportData: string;
  cols: number;
  rows: number;
}

export function StudioExport({ exportFormat, setExportFormat, exportData, cols, rows }: ExportProps) {
  return (
    <aside className="w-[450px] border-l-2 border-zinc-700 bg-zinc-900 shrink-0 flex flex-col overflow-hidden shadow-[-4px_0_0_0_rgba(0,0,0,0.8)] z-10">
      <div className="p-4 border-b-2 border-zinc-800 flex items-center justify-between">
         <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
          <Code className="w-4 h-4" /> CODE_COMPILE
        </h2>
        <select 
           value={exportFormat} onChange={e => setExportFormat(e.target.value)}
           className="bg-zinc-950 border border-zinc-700 text-green-400 text-xs py-1 px-2 focus:outline-none"
        >
          <option>JSON (Legacy RGB)</option>
          <option>JSON (Grid)</option>
          <option>JSON (Coords)</option>
          <option>JSON (Raw Pixels)</option>
          <option>CSV</option>
          <option>TXT</option>
          <option>JS/TS</option>
          <option>Python</option>
          <option>C/C++</option>
          <option>C/C++ (RGB565)</option>
          <option>C/C++ (Monochrome)</option>
        </select>
      </div>
      
      <div className="flex-1 bg-zinc-950 p-4 overflow-auto">
         <pre className="text-[10px] font-mono text-zinc-300 whitespace-pre-wrap select-all">
           {exportData.length > 50000 
              ? exportData.substring(0, 50000) + '\n\n// TRUNCATED FOR PREVIEW PERFORMANCE.\n// HIT DOWNLOAD TO GET FULL PAYLOAD.' 
              : (exportData || '// NO_DATA')}
         </pre>
      </div>

      <div className="p-4 border-t-2 border-zinc-800 grid grid-cols-2 gap-4">
         <button 
           onClick={() => navigator.clipboard.writeText(exportData)}
           className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 text-xs font-bold py-3 text-zinc-300 tracking-widest transition-colors"
         >
           <Copy className="w-4 h-4" /> COPY_TEXT
         </button>
         <button 
           onClick={() => {
             const b = new Blob([exportData], {type: 'text/plain'});
             const u = URL.createObjectURL(b);
             const a = document.createElement('a');
             
             let ext = 'json';
             if (exportFormat === 'CSV') ext = 'csv';
             else if (exportFormat === 'TXT') ext = 'txt';
             else if (exportFormat === 'JS/TS') ext = 'js';
             else if (exportFormat === 'Python') ext = 'py';
             else if (exportFormat.startsWith('C/C++')) ext = 'h';
             
             a.href = u; a.download = `pixel_data_${cols}x${rows}.${ext}`;
             a.click();
           }}
           className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 border-b-4 border-orange-700 text-black text-xs font-black py-3 tracking-widest transition-colors"
         >
           <Download className="w-4 h-4" /> DOWNLOAD
         </button>
      </div>
    </aside>
  );
}
