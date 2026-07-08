import { getAverageColor, getDominantColor, getMedianColor } from './color';

self.onmessage = (e) => {
  const { data, width, height, cols, rows, algorithm, exportRawPixels } = e.data;
  
  const pieceWidth = width / cols;
  const pieceHeight = height / rows;
  const newColors: any[] = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const startX = Math.floor(c * pieceWidth);
      const startY = Math.floor(r * pieceHeight);
      const endX = Math.floor((c + 1) * pieceWidth);
      const endY = Math.floor((r + 1) * pieceHeight);
      
      let color: [number, number, number];
      if (algorithm === 'Dominant') color = getDominantColor(data, width, startX, startY, endX, endY);
      else if (algorithm === 'Median') color = getMedianColor(data, width, startX, startY, endX, endY);
      else color = getAverageColor(data, width, startX, startY, endX, endY);
      
      const rawPixels: [number, number, number][] = [];
      if (exportRawPixels) {
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * width + x) * 4;
            rawPixels.push([data[idx], data[idx+1], data[idx+2]]);
          }
        }
      }
      
      newColors.push({
        row: r,
        col: c,
        color,
        rawPixels
      });
    }
  }
  
  self.postMessage({ colors: newColors });
};
