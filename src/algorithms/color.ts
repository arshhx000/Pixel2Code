export function getAverageColor(data: Uint8ClampedArray, imgWidth: number, startX: number, startY: number, endX: number, endY: number): [number, number, number] {
  let r = 0, g = 0, b = 0, count = 0;
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const i = (y * imgWidth + x) * 4;
      if (data[i + 3] > 0) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }
  }
  if (count === 0) return [255, 255, 255];
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

export function getDominantColor(data: Uint8ClampedArray, imgWidth: number, startX: number, startY: number, endX: number, endY: number): [number, number, number] {
  const q = 16;
  const bins = new Int32Array(4096);
  let max = 0;
  let maxIdx = 0;
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const i = (y * imgWidth + x) * 4;
      if (data[i + 3] > 0) {
        const r = Math.floor(data[i] / q);
        const g = Math.floor(data[i + 1] / q);
        const b = Math.floor(data[i + 2] / q);
        const idx = (r << 8) | (g << 4) | b;
        bins[idx]++;
        if (bins[idx] > max) {
          max = bins[idx];
          maxIdx = idx;
        }
      }
    }
  }
  if (max === 0) return [255, 255, 255];
  const r = ((maxIdx >> 8) & 0xF) * q + (q / 2);
  const g = ((maxIdx >> 4) & 0xF) * q + (q / 2);
  const b = (maxIdx & 0xF) * q + (q / 2);
  return [Math.round(r), Math.round(g), Math.round(b)];
}

export function getMedianColor(data: Uint8ClampedArray, imgWidth: number, startX: number, startY: number, endX: number, endY: number): [number, number, number] {
  const rCounts = new Int32Array(256);
  const gCounts = new Int32Array(256);
  const bCounts = new Int32Array(256);
  let total = 0;
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const i = (y * imgWidth + x) * 4;
      if (data[i + 3] > 0) {
        rCounts[data[i]]++;
        gCounts[data[i + 1]]++;
        bCounts[data[i + 2]]++;
        total++;
      }
    }
  }
  if (total === 0) return [255, 255, 255];
  
  const mid = Math.floor(total / 2);
  const getMedian = (counts: Int32Array) => {
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += counts[i];
      if (sum > mid) return i;
    }
    return 255;
  };
  return [getMedian(rCounts), getMedian(gCounts), getMedian(bCounts)];
}
