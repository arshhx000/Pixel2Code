export type PixelGrid = [number, number, number][]; // Flat array of RGB

export type CellData = {
  row: number;
  col: number;
  color: [number, number, number];
  rawPixels: [number, number, number][];
};

function toHex(r: number, g: number, b: number): string {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

function toHex0x(r: number, g: number, b: number): string {
  return "0x" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

function toRGB565(r: number, g: number, b: number): string {
  const rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
  return "0x" + rgb565.toString(16).padStart(4, '0').toUpperCase();
}

function toMonochrome(r: number, g: number, b: number): string {
  // Simple luminance threshold
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 127 ? "1" : "0";
}

export function exportJSON(width: number, height: number, cells: CellData[]): string {
  const grid = [];
  for (let r = 0; r < height; r++) {
    const rowCells = cells.filter(c => c.row === r).map(c => toHex(c.color[0], c.color[1], c.color[2]));
    grid.push(rowCells);
  }
  return JSON.stringify({ width, height, colors: grid }, null, 2);
}

export function exportJSONCoords(width: number, height: number, cells: CellData[]): string {
  const out = cells.map(c => ({
    row: c.row,
    col: c.col,
    color: toHex(c.color[0], c.color[1], c.color[2])
  }));
  return JSON.stringify({ width, height, cells: out }, null, 2);
}

export function exportJSONFull(width: number, height: number, cells: CellData[]): string {
  const out = cells.map(c => ({
    row: c.row,
    col: c.col,
    color: toHex(c.color[0], c.color[1], c.color[2]),
    pixels: c.rawPixels.map(p => toHex(p[0], p[1], p[2]))
  }));
  return JSON.stringify({ width, height, cells: out }, null, 2);
}

export function exportJSONLegacy(width: number, height: number, cells: CellData[], originalWidth: number, originalHeight: number, algorithm: string): string {
  const colors = cells.map(c => c.color); // Flat array of [r,g,b]
  const out = {
    originalFilename: "pixel_data_studio_export",
    rows: height,
    cols: width,
    originalWidth,
    originalHeight,
    tileWidth: originalWidth / width,
    tileHeight: originalHeight / height,
    algorithm,
    colors
  };
  return JSON.stringify(out);
}

export function exportCSV(width: number, height: number, cells: CellData[]): string {
  let out = "";
  for (let r = 0; r < height; r++) {
    const rowCells = cells.filter(c => c.row === r).map(c => toHex(c.color[0], c.color[1], c.color[2]).substring(1));
    out += rowCells.join(",") + "\n";
  }
  return out;
}

export function exportTXT(cells: CellData[]): string {
  return cells.map(c => toHex(c.color[0], c.color[1], c.color[2])).join("\n");
}

export function exportCPP(width: number, height: number, cells: CellData[]): string {
  let out = `const uint32_t image[${height}][${width}] = {\n`;
  for (let r = 0; r < height; r++) {
    const rowCells = cells.filter(c => c.row === r).map(c => toHex0x(c.color[0], c.color[1], c.color[2]));
    out += `  { ${rowCells.join(", ")} },\n`;
  }
  out += `};`;
  return out;
}

export function exportCPPRGB565(width: number, height: number, cells: CellData[]): string {
  let out = `const uint16_t image[${height}][${width}] = {\n`;
  for (let r = 0; r < height; r++) {
    const rowCells = cells.filter(c => c.row === r).map(c => toRGB565(c.color[0], c.color[1], c.color[2]));
    out += `  { ${rowCells.join(", ")} },\n`;
  }
  out += `};`;
  return out;
}

export function exportCPPMonochrome(width: number, height: number, cells: CellData[]): string {
  let out = `const uint8_t image[${height}][${width}] = {\n`;
  for (let r = 0; r < height; r++) {
    const rowCells = cells.filter(c => c.row === r).map(c => toMonochrome(c.color[0], c.color[1], c.color[2]));
    out += `  { ${rowCells.join(", ")} },\n`;
  }
  out += `};`;
  return out;
}

export function exportPython(width: number, height: number, cells: CellData[]): string {
  let out = `image = [\n`;
  for (let r = 0; r < height; r++) {
    const rowCells = cells.filter(c => c.row === r).map(c => toHex0x(c.color[0], c.color[1], c.color[2]));
    out += `  [${rowCells.join(", ")}],\n`;
  }
  out += `]`;
  return out;
}

export function exportJS(width: number, height: number, cells: CellData[]): string {
  let out = `export const image = [\n`;
  for (let r = 0; r < height; r++) {
    const rowCells = cells.filter(c => c.row === r).map(c => `"${toHex(c.color[0], c.color[1], c.color[2])}"`);
    out += `  [${rowCells.join(", ")}],\n`;
  }
  out += `];`;
  return out;
}

export function generateExport(format: string, width: number, height: number, cells: CellData[], originalW = 0, originalH = 0, algo = ''): string {
  switch (format) {
    case 'JSON (Legacy RGB)': return exportJSONLegacy(width, height, cells, originalW, originalH, algo);
    case 'JSON (Grid)': return exportJSON(width, height, cells);
    case 'JSON (Coords)': return exportJSONCoords(width, height, cells);
    case 'JSON (Raw Pixels)': return exportJSONFull(width, height, cells);
    case 'CSV': return exportCSV(width, height, cells);
    case 'TXT': return exportTXT(cells);
    case 'C/C++': return exportCPP(width, height, cells);
    case 'C/C++ (RGB565)': return exportCPPRGB565(width, height, cells);
    case 'C/C++ (Monochrome)': return exportCPPMonochrome(width, height, cells);
    case 'Python': return exportPython(width, height, cells);
    case 'JS/TS': return exportJS(width, height, cells);
    default: return exportJSON(width, height, cells);
  }
}
