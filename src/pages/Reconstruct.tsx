import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Download, Code, Cpu } from 'lucide-react';

export default function Reconstruct() {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');
  const [dim, setDim] = useState({ w: 50, h: 50 });
  const [scale, setScale] = useState(10);
  const [gridColors, setGridColors] = useState<string[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setInputText(`// [LOADING FILE INTO MEMORY...]\n// ${file.name}`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const text = event.target.result as string;
        // Prevent DOM crash by not putting massive text in the textarea
        if (text.length > 200000) {
           setInputText(`// [LOADED MASSIVE FILE SUCCESSFULLY]\n// File: ${file.name}\n// Size: ${(text.length / 1024 / 1024).toFixed(2)} MB\n// Processing data...`);
        } else {
           setInputText(text);
        }
        processData(text);
      }
    };
    reader.readAsText(file);
  };

  const drawGrid = (colors: string[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const h = colors.length;
    const w = h > 0 ? colors[0].length : 0;
    setDim({ w, h });
    
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        let hex = colors[r][c];
        if (hex.startsWith('0x') || hex.startsWith('0X')) hex = '#' + hex.substring(2);
        ctx.fillStyle = hex;
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  };

  useEffect(() => {
    if (gridColors.length > 0) {
       drawGrid(gridColors);
    }
  }, [gridColors, scale]);

  const processData = (rawText: string) => {
    setError('');
    try {
      const text = rawText.trim();
      if (!text || text.startsWith('// [LOADED')) return;
      
      let parsedColors: string[][] = [];

      // Detect if it's likely JSON or Array syntax
      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      const isJsonObj = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) && !text.includes('uint32_t');
      const isJsonArr = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace) && !text.includes('uint32_t');
      
      if (isJsonObj || isJsonArr) {
         try {
            // Try to extract the JSON/Array part
            const startChar = isJsonObj ? '{' : '[';
            const endChar = isJsonObj ? '}' : ']';
            const startIdx = text.indexOf(startChar);
            const endIdx = text.lastIndexOf(endChar);
            
            if (startIdx !== -1 && endIdx !== -1) {
               let jsonStr = text.substring(startIdx, endIdx + 1);
               // Replace Python/JS/TS formats
               jsonStr = jsonStr.replace(/'/g, '"').replace(/0x([0-9A-Fa-f]{6})/g, '"#$1"');
               // Clean trailing commas in arrays (JS allows it, JSON doesn't)
               jsonStr = jsonStr.replace(/,\s*]/g, ']');
               
               const data = JSON.parse(jsonStr);
               if (isJsonObj) {
                  if (data.colors) {
                     // Check if it's the legacy flat [r,g,b] array
                     if (Array.isArray(data.colors) && data.colors.length > 0 && Array.isArray(data.colors[0]) && typeof data.colors[0][0] === 'number') {
                        let cols = data.cols || data.width || data.Cols || data.Width || 0;
                        let rows = data.rows || data.height || data.Rows || data.Height || 0;
                        
                        // Fallback math if dimensions are somehow missing
                        if (cols === 0 || rows === 0) {
                           cols = Math.floor(Math.sqrt(data.colors.length));
                           rows = Math.floor(data.colors.length / cols);
                        }
                        
                        if (cols > 0 && rows > 0) {
                           parsedColors = [];
                           for (let r = 0; r < rows; r++) {
                              const rowArr = [];
                              for (let c = 0; c < cols; c++) {
                                 const colorItem = data.colors[r * cols + c];
                                 if (colorItem && Array.isArray(colorItem) && colorItem.length >= 3) {
                                   const red = colorItem[0];
                                   const green = colorItem[1];
                                   const blue = colorItem[2];
                                   const hex = "#" + (1 << 24 | red << 16 | green << 8 | blue).toString(16).slice(1).toUpperCase();
                                   rowArr.push(hex);
                                 } else {
                                   rowArr.push("#000000");
                                 }
                              }
                              parsedColors.push(rowArr);
                           }
                        }
                     } else {
                        // Standard 2D hex array
                        parsedColors = data.colors;
                     }
                  } else if (data.cells) {
                     // Convert cells array to 2D colors array
                     const w = data.width || 0;
                     const h = data.height || 0;
                     if (w > 0 && h > 0) {
                        parsedColors = Array.from({ length: h }, () => Array(w).fill('#000000'));
                        data.cells.forEach((c: any) => {
                           if (c.row < h && c.col < w && c.color) {
                              parsedColors[c.row][c.col] = c.color;
                           }
                        });
                     }
                  }
               } else {
                  // It's a 2D array
                  parsedColors = data;
               }
            }
         } catch (e) {
            // Fallback to text parsing if JSON fails
         }
      }
      
      // If still empty, try CSV / TXT / C++ parsing
      if (parsedColors.length === 0) {
        const lines = text.split('\n')
          .map(l => l.trim().replace(/[{}]/g, '')) // Strip C++ braces
          .filter(l => l && 
                       !l.startsWith('//') && 
                       !l.startsWith('const ') && 
                       !l.startsWith('export ') && 
                       !l.startsWith('image =') && 
                       !l.startsWith('];') && 
                       !l.startsWith(';') &&
                       !l.startsWith(']'));
        
        parsedColors = lines.map(line => {
          return line.split(',').filter(c => c.trim()).map(c => {
             let hex = c.trim().replace(/['"]/g, '');
             if (hex.startsWith('0x') || hex.startsWith('0X')) return '#' + hex.substring(2);
             if (!hex.startsWith('#')) return '#' + hex;
             return hex;
          });
        }).filter(row => row.length > 0);
      }

      if (parsedColors.length > 0 && parsedColors[0].length > 0) {
        setGridColors(parsedColors);
      } else {
        setError('ERR_PARSE_FAIL: Unrecognized payload format. (Check array structure)');
      }
    } catch (e: any) {
      setError('ERR_FATAL: ' + e.message);
    }
  };

  // Debounced input parsing
  useEffect(() => {
    if (inputText.startsWith('// [LOAD')) return; // Ignore placeholder text
    const timeout = setTimeout(() => processData(inputText), 500);
    return () => clearTimeout(timeout);
  }, [inputText]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Left Sidebar: Input */}
      <aside className="w-1/2 border-r-2 border-zinc-700 bg-zinc-900 shrink-0 flex flex-col p-4 shadow-[4px_0_0_0_rgba(0,0,0,0.8)] z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <Code className="w-4 h-4" /> PASTE_PAYLOAD
          </h2>
          <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json,.csv,.txt,.js,.ts,.py,.cpp,.c" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-zinc-800 hover:bg-orange-500 hover:text-black border-2 border-zinc-700 text-zinc-300 text-[10px] font-bold px-3 py-1 tracking-widest transition-colors flex items-center gap-2"
            >
              <UploadCloud className="w-3 h-3" /> LOAD_FILE
            </button>
          </div>
        </div>
        <textarea 
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="PASTE JSON, CSV, OR CODE ARRAY HERE..."
          className="flex-1 bg-zinc-950 border-2 border-zinc-800 text-green-400 font-mono text-xs p-4 focus:outline-none focus:border-orange-500 resize-none"
        />
        {error && <div className="mt-4 p-2 bg-red-900 border border-red-500 text-red-200 text-xs font-mono">{error}</div>}
      </aside>

      {/* Right Area: Preview */}
      <main className="flex-1 bg-black relative flex flex-col">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10"></div>
        
        <header className="bg-zinc-900 border-b-2 border-zinc-800 p-4 flex items-center justify-between z-20">
           <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-4 h-4" /> RENDER_ENGINE
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-[10px] text-zinc-500 tracking-widest">
               GRID: <span className="text-green-400">{dim.w}x{dim.h}</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 tracking-widest">SCALE:</span>
                <input type="range" min="1" max="50" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-24 accent-orange-500" />
             </div>
             <button 
               onClick={() => {
                 const canvas = canvasRef.current;
                 if (!canvas) return;
                 const a = document.createElement('a');
                 a.href = canvas.toDataURL('image/png');
                 a.download = `reconstructed_${dim.w}x${dim.h}.png`;
                 a.click();
               }}
               className="bg-orange-500 hover:bg-orange-400 text-black text-[10px] font-black px-4 py-2 flex items-center gap-2 border-b-2 border-orange-700 active:translate-y-[2px] active:border-0"
             >
               <Download className="w-3 h-3" /> EXPORT_PNG
             </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative">
           <div className="z-20 border-2 border-zinc-800 p-1 bg-zinc-950 shadow-2xl">
             <canvas ref={canvasRef} className="block pixelated" style={{ imageRendering: 'pixelated' }} />
           </div>
        </div>
      </main>
      
    </div>
  );
}
