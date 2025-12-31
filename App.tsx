import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, ArtWork, Pixel } from './types';
import { generatePixelArt } from './services/geminiService';
import { FluidBackground } from './components/FluidBackground';
import { PixelGrid } from './components/PixelGrid';
import { InputBar } from './components/InputBar';
import { ControlBar } from './components/ControlBar';
import { HistoryView } from './components/HistoryView';
import { ExportModal } from './components/ExportModal';
import { GalleryVerticalEnd, Loader2, Moon, Sun } from 'lucide-react';

// Utility to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Return full data URL to preserve mime type (e.g. image/png) for transparency
      resolve(reader.result?.toString() || '');
    };
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [name, setName] = useState('');
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [themeColor, setThemeColor] = useState('#4f46e5');
  const [visiblePixelsCount, setVisiblePixelsCount] = useState(0);
  const [history, setHistory] = useState<ArtWork[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [gridSize, setGridSize] = useState<number>(50); // Default to 50x50
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Animation Ref
  const animationReqRef = useRef<number>();
  
  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pixelFlowHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history
  const saveToHistory = useCallback((newArt: ArtWork) => {
    const updated = [newArt, ...history];
    setHistory(updated);
    localStorage.setItem('pixelFlowHistory', JSON.stringify(updated));
  }, [history]);

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('pixelFlowHistory', JSON.stringify(updated));
  };

  // Handler for Image Generation
  const processGeneration = async (input: string) => {
    try {
      setState(AppState.PROCESSING);
      setVisiblePixelsCount(0);
      
      const result = await generatePixelArt(input, gridSize);
      
      setPixels(result.pixels);
      setThemeColor(result.themeColor);
      
      // Prepare for animation
      setState(AppState.ANIMATING);
      
    } catch (error) {
      console.error(error);
      alert("Error: " + (error instanceof Error ? error.message : "Generation failed"));
      setState(AppState.IDLE);
    }
  };

  const handleUpload = async (file: File) => {
      const base64 = await fileToBase64(file);
      processGeneration(base64);
  };

  // Snake Animation Loop
  useEffect(() => {
    if (state === AppState.ANIMATING) {
      let start: number | null = null;
      const totalSteps = gridSize * gridSize; 
      
      // Determine duration based on grid size
      // 50x50 -> 15 seconds
      // 100x100 -> 60 seconds
      const duration = gridSize === 50 ? 15000 : 60000;

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        // Calculate linear progress
        const count = Math.min(Math.floor((progress / duration) * totalSteps), totalSteps);
        setVisiblePixelsCount(count);

        if (count < totalSteps) {
          animationReqRef.current = requestAnimationFrame(animate);
        } else {
          setState(AppState.COMPLETE);
          saveToHistory({
            id: Date.now().toString(),
            name: name,
            createdAt: Date.now(),
            pixels: pixels,
            themeColor: themeColor,
            gridSize: gridSize
          });
        }
      };
      
      animationReqRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationReqRef.current) cancelAnimationFrame(animationReqRef.current);
    };
  }, [state, pixels, name, themeColor, gridSize, saveToHistory]);

  const handleReset = () => {
    setState(AppState.IDLE);
    setName('');
    setPixels([]);
    setThemeColor('#4f46e5'); // Default indigo
    setVisiblePixelsCount(0);
    // Keep current gridSize preference
  };

  const handleHistorySelect = (art: ArtWork) => {
    setName(art.name);
    setPixels(art.pixels);
    setThemeColor(art.themeColor);
    
    // Set grid size from history so the grid renders correctly
    // Fallback to 50 if it was an old record without gridSize
    const artGridSize = art.gridSize || (art.pixels.some(p => p.x > 50 || p.y > 50) ? 100 : 50);
    setGridSize(artGridSize);
    
    setVisiblePixelsCount(artGridSize * artGridSize);
    setState(AppState.COMPLETE);
    setShowHistory(false);
  };

  return (
    <div className={`min-h-screen relative w-full overflow-hidden flex flex-col items-center justify-center transition-colors duration-500 ${isDarkMode ? 'dark bg-neutral-950' : 'bg-slate-50'}`}>
      
      {/* Background */}
      <FluidBackground 
        themeColor={themeColor} 
        intensity={state === AppState.PROCESSING ? 'high' : 'low'} 
      />

      {/* Header / Top Right Controls */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
        <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-white/60 dark:bg-neutral-800/60 hover:bg-white/80 dark:hover:bg-neutral-700/80 backdrop-blur-md p-3 rounded-full text-slate-700 dark:text-neutral-200 transition-all shadow-lg border border-white/60 dark:border-neutral-700"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          onClick={() => setShowHistory(true)}
          className="bg-white/60 dark:bg-neutral-800/60 hover:bg-white/80 dark:hover:bg-neutral-700/80 backdrop-blur-md p-3 rounded-full text-slate-700 dark:text-neutral-200 transition-all shadow-lg border border-white/60 dark:border-neutral-700"
          title="History"
        >
          <GalleryVerticalEnd size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4">
        
        {/* The Card */}
        <div className={`relative w-full flex flex-col items-center transition-all duration-1000 ${state === AppState.PROCESSING ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
           
           {/* Scan Effect Overlay during processing */}
           {state === AppState.PROCESSING && (
             <div className="absolute inset-0 z-30 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={64} className="animate-spin text-slate-800 dark:text-neutral-200" />
                    <p className="text-xl font-light tracking-widest animate-pulse text-slate-800 dark:text-neutral-200">
                        CREATING MASTERPIECE...
                    </p>
                </div>
             </div>
           )}

           <PixelGrid 
              pixels={pixels} 
              visibleCount={state === AppState.IDLE ? 0 : visiblePixelsCount}
              isBreathing={state === AppState.IDLE}
              gridSize={gridSize}
           />
           
           {/* Name display inside card area (visual) */}
           <div className="mt-6 text-center h-8">
              {state !== AppState.IDLE && (
                  <h1 className="text-2xl font-bold tracking-wide text-slate-800 dark:text-neutral-100 drop-shadow-sm animate-in fade-in duration-500">
                    {name}
                  </h1>
              )}
           </div>
        </div>

      </main>

      {/* Inputs & Controls */}
      <InputBar 
        name={name} 
        setName={setName} 
        onUpload={handleUpload} 
        disabled={state !== AppState.IDLE}
        gridSize={gridSize}
        setGridSize={setGridSize}
      />

      <ControlBar 
        visible={state === AppState.COMPLETE} 
        onReset={handleReset}
        onExportClick={() => setShowExportModal(true)}
      />

      {/* History Modal */}
      {showHistory && (
        <HistoryView 
            history={history} 
            onSelect={handleHistorySelect} 
            onDelete={handleDeleteHistory}
            onClose={() => setShowHistory(false)} 
        />
      )}

      {/* Export Preview Modal */}
      {showExportModal && (
        <ExportModal 
            pixels={pixels}
            gridSize={gridSize}
            name={name}
            isDarkMode={isDarkMode}
            themeColor={themeColor}
            onClose={() => setShowExportModal(false)}
        />
      )}

    </div>
  );
};

export default App;