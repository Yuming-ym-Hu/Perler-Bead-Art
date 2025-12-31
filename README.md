# Perler Bead Art

Perler Bead Art is an immersive digital creation tool. It features a fluid, organic interactive experience that instantly transforms your photos into exquisite pixel (perler bead) art masterpieces.

> **Note**: This project runs entirely client-side in the browser. It does **not** require a Google Gemini API key or any backend services. All image processing is handled securely on your local device.

## ✨ Core Features

1.  **Fluid Canvas (UI)**
    *   Immersive fluid backgrounds that change dynamically with the theme color.
    *   Support for Dark/Light Mode, adapting to different creative environments.
    *   Apple Music-inspired glassmorphism design.

2.  **Client-Side Intelligence**
    *   **Privacy First**: Uses HTML5 Canvas API to analyze images locally; photos are never uploaded to a server.
    *   **Instant Response**: Generates 50x50 or 100x100 pixel schemes in milliseconds.
    *   **Smart Coloring**: Automatically extracts the dominant color of the image as the interface theme.

3.  **Process Aesthetics (Snake Animation)**
    *   "Snake-like" growth animation simulating the manual bead placement process.
    *   Visual feast accompanied by simulated haptic feedback.

4.  **Gallery & Export**
    *   **History Collection**: Automatically saves your creation history, supporting waterfall flow review and full-screen viewing.
    *   **Share Art**: Generate high-definition images with exquisite borders, lighting effects, and custom backgrounds.
    *   **Export Pattern**: One-click download of the 1:1 pixel dot matrix map, convenient for printing and making physical perler bead art.

## 🛠️ Tech Stack

*   **Core**: React 19 + TypeScript
*   **Styling**: Tailwind CSS (Utility-first CSS framework)
*   **Graphics**: HTML5 Canvas API (Image processing & rendering)
*   **Icons**: Lucide React
*   **Performance**: `requestAnimationFrame` for smooth 60fps animations
*   **Storage**: LocalStorage (Persisting history data)

## 🚀 Quick Start

No complex environment configuration is needed, just Node.js.

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173` (or another available port).

### 3. Build for Production

```bash
npm run build
```

## 📖 User Guide

1.  **Enter Name**: Give your creation a name in the bottom input bar.
2.  **Select Size**: Click the pill button above the input bar to choose **50x50** (for quick creation) or **100x100** (for detailed display).
3.  **Upload Image**: Click the image upload button on the right to select a photo.
4.  **Watch Generation**: Watch as the pixels "grow" like life.
5.  **Save & Share**:
    *   **Save Image**: Export art images suitable for social media sharing.
    *   **Save Pattern**: Export the original dot matrix paper for production.
    *   **History**: Click the top right icon to view past works.

## 🤝 Contribution

Issues and Pull Requests are welcome to improve this project!

## 📄 License

MIT License
