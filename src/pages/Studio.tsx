import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateExport, CellData } from '../exporters';
import { StudioSidebar } from '../components/StudioSidebar';
import { StudioPreview } from '../components/StudioPreview';
import { StudioExport } from '../components/StudioExport';

export default function Studio() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState('');
  const [imgDim, setImgDim] = useState({ w: 0, h: 0 });
  
  // Grid Settings
  const [cols, setCols] = useState(50);
  const [rows, setRows] = useState(50);
  const [algorithm, setAlgorithm] = useState<'Average' | 'Dominant' | 'Median'>('Average');
  
  // Export Settings
  const [exportFormat, setExportFormat] = useState('JSON (Grid)');
  
  // Data State
  const [isProcessing, setIsProcessing] = useState(false);
  const [colors, setColors] = useState<CellData[]>([]);
  const [exportData, setExportData] = useState('');
  
  // Stats
  const [processTime, setProcessTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImgRef = useRef<HTMLImageElement>(null);
  
  // Web Worker Ref
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../algorithms/worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      const { colors } = e.data;
      setColors(colors);
      // Process time is approximated from state update time, but for real we could pass timestamps
      setIsProcessing(false);
    };
    
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setOriginalFilename(file.name.replace(/\.[^/.]+$/, ""));
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setImageSrc(src);
        const img = new Image();
        img.onload = () => {
          setImgDim({ w: img.width, h: img.height });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = useCallback(() => {
    if (!imageSrc || !originalImgRef.current || !workerRef.current) return;
    setIsProcessing(true);
    
    const start = performance.now();
    const img = originalImgRef.current;
    
    const nWidth = img.naturalWidth;
    const nHeight = img.naturalHeight;
    
    const canvas = document.createElement('canvas');
    canvas.width = nWidth;
    canvas.height = nHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.drawImage(img, 0, 0, nWidth, nHeight);
    const data = ctx.getImageData(0, 0, nWidth, nHeight).data;
    
    const exportRawPixels = exportFormat === 'JSON (Raw Pixels)';
    
    workerRef.current.postMessage({
      data,
      width: nWidth,
      height: nHeight,
      cols,
      rows,
      algorithm,
      exportRawPixels
    });
    
    // We update process time here just for sending, actual completion is when worker returns
    setProcessTime(performance.now() - start);
  }, [imageSrc, cols, rows, algorithm, exportFormat]);

  // Auto-process when settings change
  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
  }, [processImage, imageSrc]);

  // Update Code Preview when settings change
  useEffect(() => {
    if (colors.length > 0) {
      setExportData(generateExport(exportFormat, cols, rows, colors, imgDim.w, imgDim.h, algorithm));
      drawPreview(colors);
    }
  }, [colors, exportFormat]);

  const drawPreview = (colorData: CellData[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Match the original image dimensions to prevent squishing
    canvas.width = imgDim.w;
    canvas.height = imgDim.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pieceWidth = imgDim.w / cols;
    const pieceHeight = imgDim.h / rows;
    
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (i >= colorData.length) break;
        const rv = colorData[i].color[0];
        const gv = colorData[i].color[1];
        const bv = colorData[i].color[2];
        i++;
        ctx.fillStyle = `rgb(${rv}, ${gv}, ${bv})`;
        ctx.fillRect(c * pieceWidth, r * pieceHeight, pieceWidth, pieceHeight);
      }
    }
  };
  
  // Drag and Drop Handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  return (
    <div 
      className="flex flex-col h-[calc(100vh-64px)] overflow-hidden"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-1 overflow-hidden">
        
        <StudioSidebar 
          imageSrc={imageSrc}
          onImageUpload={handleImageFile}
          cols={cols}
          setCols={setCols}
          rows={rows}
          setRows={setRows}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          colors={colors}
          processTime={processTime}
          imgDim={imgDim}
          exportData={exportData}
          originalImgRef={originalImgRef}
        />

        <StudioPreview 
          isProcessing={isProcessing}
          imageSrc={imageSrc}
          canvasRef={canvasRef}
        />

        <StudioExport 
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          exportData={exportData}
          cols={cols}
          rows={rows}
        />

      </div>
    </div>
  );
}
