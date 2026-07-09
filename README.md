# Pixel Data Studio (TE-1 SYS_ARCH)

![Pixel Data Studio]

Pixel Data Studio is a high-performance, web-based utility designed for hardware hackers, embedded engineers (Arduino/Raspberry Pi), and retro game developers. It allows you to rapidly extract color matrices from images and export them into various data arrays (C/C++, JSON, CSV, Python) to drive LED matrices, OLEDs, and embedded displays.

---

## ✨ Features

* **Hardware-First Export Formats:** Export directly to C/C++ arrays, including full 24-bit RGB, **16-bit RGB565**, and **1-bit Monochrome** tailored for microcontroller memory constraints.
* **High-Performance Web Workers:** Image processing and quantization are offloaded to background threads. Generate massive 1024x1024 data grids without freezing the browser UI.
* **Advanced Color Sampling:** Choose between Average Color, Dominant Color, and Median Color extraction algorithms for each grid cell.
* **Interactive Canvas Preview:** Fluid zoom and pan controls let you inspect your reconstructed matrix node-by-node.
* **Seamless Workflow:** Global drag-and-drop file support and instant 1-click clipboard/file downloads.
* **Reconstruct Engine:** Paste external JSON/C++ arrays back into the tool to visualize data payloads without deploying to actual hardware.

---

## 🚀 Getting Started

### Prerequisites

You will need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pixel-data-studio.git
   cd pixel-data-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🛠 Usage

### 1. Extracting Data (Studio Mode)
1. **Load Image:** Drag and drop an image anywhere on the screen, or click `SELECT_FILE`.
2. **Configure Matrix:** Set your target `COLS_X` and `ROWS_Y` to match your physical hardware display.
3. **Select Algorithm:** Choose how the colors are sampled (Average, Dominant, or Median).
4. **Export:** Select your desired format from the `CODE_COMPILE` dropdown. Click `COPY_TEXT` to add it to your clipboard or `DOWNLOAD` to save the raw file.

### 2. Validating Data (Reconstruct Mode)
1. Switch to the `[2] RECONSTRUCT` tab.
2. Paste a generated C/C++ array or JSON payload into the input box, or upload a `.txt`/`.json` file.
3. The engine will parse the raw data and render the visual representation on the canvas. 

---

## 📦 Supported Export Formats

| Format | Description | Best For |
| :--- | :--- | :--- |
| **C/C++ (RGB565)** | `uint16_t` array containing 16-bit color values. | Arduino TFT displays, ESP32, Teensy. |
| **C/C++ (Monochrome)** | `uint8_t` array containing 1-bit values based on luminance. | SSD1306 OLEDs, E-ink displays. |
| **C/C++** | `uint32_t` array containing standard 24-bit Hex colors. | High-memory embedded systems, LED Strips (FastLED). |
| **JSON (Grid)** | Standard 2D JSON array containing Hex colors. | Web dashboards, Node.js backends. |
| **Python** | 2D list containing Hex colors. | Raspberry Pi, MicroPython, CircuitPython. |
| **CSV / TXT** | Flat separated values. | Data analysis, custom parsers. |

---

## 🏗 Architecture

The application is built using **React** and **Vite**, styled with **Tailwind CSS**. 

Recent architectural improvements include:
* **`src/algorithms/worker.ts`**: Handles heavy pixel calculations off the main thread.
* **Component Abstraction**: Modular design utilizing `StudioSidebar`, `StudioPreview`, and `StudioExport` for scalable UI maintenance.
* **Raw Canvas API**: Utilizes native HTML5 Canvas `getImageData` for lighting-fast pixel sampling.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to add a specific hardware export format or a new quantization algorithm, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
