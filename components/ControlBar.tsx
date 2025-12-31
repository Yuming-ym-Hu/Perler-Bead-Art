import React from 'react';
import { Image, RotateCcw } from 'lucide-react';

interface ControlBarProps {
  onReset: () => void;
  onExportClick: () => void;
  visible: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({ onReset, onExportClick, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-50 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <button 
        onClick={onExportClick}
        className="glass-panel px-6 py-3 rounded-full flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all active:scale-95 font-medium"
      >
        <Image size={18} />
        <span>Save Image</span>
      </button>

       <button 
        onClick={onReset}
        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-3 rounded-full flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all active:scale-95 border border-white/60 dark:border-slate-700 shadow-lg"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
};