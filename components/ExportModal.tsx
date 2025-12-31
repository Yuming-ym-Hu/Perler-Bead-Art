import React, { useEffect, useRef, useState } from 'react';
import { Pixel } from '../types';
import { drawFrame, downloadPNG, BackgroundConfig, EXPORT_DIMENSIONS } from '../services/exportService';
import { X, Check, Download } from 'lucide-react';

interface ExportModalProps {
  pixels: Pixel[];
  gridSize: number;
  name: string;
  isDarkMode: boolean;
  themeColor: string;
  onClose: () => void;
}

// Artistic, textured color palette
const PRESET_COLORS = [
  { label: 'Obsidian', value: '#171717' },     // Deep warm black
  { label: 'Graphite', value: '#333333' },     // Classic dark grey
  { label: 'Alabaster', value: '#FAFAF9' },    // Warm off-white
  { label: 'Stone', value: '#A8A29E' },        // Warm Grey
  { label: 'Sand', value: '#E7E5E4' },         // Light Taupe
  { label: 'Matcha', value: '#57534e' },       // Dark Stone
  { label: 'Sage', value: '#5F6F65' },         // Muted Green
  { label: 'Teal', value: '#134E4A' },         // Deep Teal
  { label: 'Emerald', value: '#059669' },      // New: Rich Green
  { label: 'Clay', value: '#9A3412' },         // Terracotta
  { label: 'Amber', value: '#d97706' },        // New: Warm Amber
  { label: 'Rust', value: '#7F1D1D' },         // Deep Red
  { label: 'Ochre', value: '#B45309' },        // Artistic Yellow/Gold
  { label: 'Denim', value: '#1e3a8a' },        // Classic Blue
  { label: 'Midnight', value: '#1E1B4B' },     // Deep Blue
  { label: 'Plum', value: '#581C87' },         // Deep Purple
  { label: 'Rose Dust', value: '#9f1239' },    // Deep Rose
];

export const ExportModal: React.FC<ExportModalProps> = ({
  pixels,
  gridSize,
  name,
  isDarkMode,
  themeColor,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize with current mode default
  // Default to a solid color that matches the theme mode initially for consistency
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(
    isDarkMode 
        ? { type: 'solid', color: '#171717' }
        : { type: 'gradient', color: themeColor }
  );

  // Generate Preview
  useEffect(() => {
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            // The drawing function is designed for 1080px width (EXPORT_DIMENSIONS.width).
            // We scale context to fit the preview canvas width.
            const PREVIEW_WIDTH = 400; 
            const scale = PREVIEW_WIDTH / EXPORT_DIMENSIONS.width;
            
            // Set canvas resolution to match exact aspect ratio of the export
            canvasRef.current.width = PREVIEW_WIDTH;
            canvasRef.current.height = EXPORT_DIMENSIONS.height * scale;
            
            ctx.scale(scale, scale);
            
            drawFrame(
                ctx, 
                pixels, 
                gridSize, 
                gridSize * gridSize, 
                isDarkMode, 
                name, 
                bgConfig
            );
        }
    }
  }, [pixels, gridSize, name, isDarkMode, bgConfig]);

  const handleDownload = () => {
    downloadPNG(pixels, gridSize, name, isDarkMode, bgConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-neutral-800">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-neutral-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-neutral-100">Export Artwork</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
            
            {/* Preview Canvas */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-neutral-800">
                 <canvas ref={canvasRef} className="block max-w-full h-auto max-h-[45vh]" />
            </div>

            {/* Color Selection */}
            <div className="w-full">
                <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 mb-3 text-center">Select Background</p>
                <div className="flex flex-wrap gap-3 justify-center">
                    
                    {/* Theme Gradient Option */}
                    <button
                        onClick={() => setBgConfig({ type: 'gradient', color: themeColor })}
                        className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 relative shadow-sm ${
                            bgConfig.type === 'gradient' ? 'border-indigo-500 scale-110 ring-2 ring-indigo-500/20' : 'border-white/10'
                        }`}
                        title="Theme Gradient"
                        style={{
                            background: `linear-gradient(135deg, ${themeColor}, #ffffff)`
                        }}
                    >
                         {bgConfig.type === 'gradient' && <Check size={16} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />}
                    </button>

                    {/* Solid Color Options */}
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => setBgConfig({ type: 'solid', color: c.value })}
                            className={`w-10 h-10 rounded-full border transition-transform hover:scale-110 relative shadow-sm ${
                                bgConfig.type === 'solid' && bgConfig.color === c.value ? 'border-indigo-500 scale-110 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-neutral-700'
                            }`}
                            title={c.label}
                            style={{ backgroundColor: c.value }}
                        >
                            {bgConfig.type === 'solid' && bgConfig.color === c.value && (
                                <Check 
                                    size={16} 
                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md ${
                                        ['#ffffff', '#FAFAF9', '#9ca3af', '#E7E5E4', '#A8A29E'].includes(c.value) ? 'text-slate-800' : 'text-white'
                                    }`} 
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleDownload}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <Download size={20} />
                Download Image
            </button>

        </div>
      </div>
    </div>
  );
};