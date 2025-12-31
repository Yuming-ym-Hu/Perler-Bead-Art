import React, { useRef } from 'react';
import { ImagePlus, Sparkles, Grid3X3, Grid2X2 } from 'lucide-react';

interface InputBarProps {
  name: string;
  setName: (n: string) => void;
  onUpload: (file: File) => void;
  disabled: boolean;
  gridSize: number;
  setGridSize: (s: number) => void;
}

export const InputBar: React.FC<InputBarProps> = ({ name, setName, onUpload, disabled, gridSize, setGridSize }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleAction = () => {
      if (!name.trim()) {
          alert("Please give it a name first!");
          return;
      }
      fileInputRef.current?.click();
  };

  if (disabled) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] z-50 flex flex-col items-center gap-4">
      
      {/* Mode Selector - Apple Glass Style */}
      <div className="relative flex p-1 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-500 border border-white/20 dark:border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.1)]">
          {/* Glass Background Layer */}
          <div className="absolute inset-0 rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-xl z-0"></div>
          
          <button 
             onClick={() => setGridSize(50)}
             className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                 gridSize === 50 
                 ? 'text-black dark:text-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]' 
                 : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
             }`}
          >
             {/* Active State Highlight (Glassy Pill) */}
             {gridSize === 50 && (
                 <div className="absolute inset-0 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/5 -z-10"></div>
             )}
             <Grid2X2 size={15} className={gridSize === 50 ? "opacity-100" : "opacity-70"} />
             <span>50x50 (15s)</span>
          </button>

          <button 
             onClick={() => setGridSize(100)}
             className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                 gridSize === 100 
                 ? 'text-black dark:text-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]' 
                 : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
             }`}
          >
             {/* Active State Highlight (Glassy Pill) */}
             {gridSize === 100 && (
                 <div className="absolute inset-0 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/5 -z-10"></div>
             )}
             <Grid3X3 size={15} className={gridSize === 100 ? "opacity-100" : "opacity-70"} />
             <span>100x100 (60s)</span>
          </button>
      </div>

      <div className="glass-panel w-full rounded-3xl p-2 flex items-center transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/80">
        <div className="pl-4 pr-2 text-indigo-500 dark:text-indigo-400 animate-pulse">
            <Sparkles size={20} />
        </div>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="✨ Give your creation a name..."
          className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 h-12 text-lg font-medium"
          onKeyDown={(e) => {
              if (e.key === 'Enter') handleAction();
          }}
        />
        
        <button 
          onClick={handleAction}
          className="text-white p-3 rounded-full transition-all flex items-center justify-center shadow-lg active:scale-95 bg-slate-800 hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          title="Upload Image"
        >
          <ImagePlus size={24} />
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};