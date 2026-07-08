import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface PreviewProps {
  isProcessing: boolean;
  imageSrc: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function StudioPreview({ isProcessing, imageSrc, canvasRef }: PreviewProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSense = 0.001;
    let newScale = scale - e.deltaY * zoomSense;
    newScale = Math.max(0.1, Math.min(newScale, 10));
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    // Reset on new image
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageSrc]);

  return (
    <main 
      className="flex-1 bg-black relative flex flex-col items-center justify-center p-8 overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10"></div>
      
      {/* Controls Overlay */}
      {imageSrc && !isProcessing && (
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <button onClick={() => setScale(s => Math.max(0.1, s - 0.2))} className="bg-zinc-900 border border-zinc-700 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800"><ZoomOut className="w-4 h-4"/></button>
          <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="bg-zinc-900 border border-zinc-700 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800"><Move className="w-4 h-4"/></button>
          <button onClick={() => setScale(s => Math.min(10, s + 0.2))} className="bg-zinc-900 border border-zinc-700 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800"><ZoomIn className="w-4 h-4"/></button>
        </div>
      )}
      
      {isProcessing ? (
         <div className="z-20 text-orange-500 font-bold tracking-widest animate-pulse">PROCESSING_DATA...</div>
      ) : !imageSrc ? (
         <div className="z-20 text-zinc-600 font-bold tracking-widest flex flex-col items-center">
           <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
           AWAITING_SOURCE_IMAGE
           <p className="mt-2 text-xs">(Drag and drop image anywhere)</p>
         </div>
      ) : (
         <div 
           className="z-20 border-2 border-zinc-800 p-1 bg-zinc-950 shadow-2xl max-w-full max-h-full transition-transform duration-75"
           style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, cursor: isDragging ? 'grabbing' : 'grab' }}
         >
           <canvas 
             ref={canvasRef} 
             className="pixelated w-full h-full max-h-[70vh] object-contain block"
             style={{ imageRendering: 'pixelated' }}
           />
         </div>
      )}
    </main>
  );
}
