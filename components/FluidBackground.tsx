import React, { useEffect, useState } from 'react';

interface FluidBackgroundProps {
  themeColor: string;
  intensity: 'low' | 'high';
}

export const FluidBackground: React.FC<FluidBackgroundProps> = ({ themeColor, intensity }) => {
  const [colors, setColors] = useState<string[]>(['#4f46e5', '#818cf8', '#2dd4bf']);

  useEffect(() => {
    // Generate harmonious colors based on the theme color
    // Simple logic: maintain theme, add a complement, add a variation
    if (themeColor && themeColor.startsWith('#')) {
      setColors([
        themeColor, 
        adjustColor(themeColor, 40), // lighter/shifted
        adjustColor(themeColor, -20) // darker
      ]);
    }
  }, [themeColor]);

  // Simple hex adjuster for variety
  const adjustColor = (hex: string, amt: number) => {
    let usePound = false;
    if (hex[0] === "#") {
        hex = hex.slice(1);
        usePound = true;
    }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if  (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if  (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  }

  const speedClass = intensity === 'high' ? 'duration-[2s]' : 'duration-[8s]';

  return (
    <div className="aurora-bg bg-slate-50 dark:bg-neutral-950 transition-colors duration-1000">
      <div 
        className={`aurora-blob w-[60vw] h-[60vw] top-[-10%] left-[-10%] ${speedClass} transition-all`}
        style={{ backgroundColor: colors[0], animationDelay: '0s' }}
      ></div>
      <div 
        className={`aurora-blob w-[50vw] h-[50vw] bottom-[-10%] right-[-10%] ${speedClass} transition-all`}
        style={{ backgroundColor: colors[1], animationDelay: '-5s' }}
      ></div>
      <div 
        className={`aurora-blob w-[40vw] h-[40vw] top-[30%] left-[30%] ${speedClass} transition-all`}
        style={{ backgroundColor: colors[2], animationDelay: '-10s' }}
      ></div>
      
      {/* Overlay to smooth things out - white for light mode, dark for dark mode */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-3xl transition-colors duration-1000"></div>
    </div>
  );
};
