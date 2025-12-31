import React, { useMemo } from 'react';
import { Pixel } from '../types';

interface PixelGridProps {
  pixels: Pixel[]; // The target completed pixels
  visibleCount: number; // How many snake steps have we taken
  isBreathing: boolean; // Idle state animation
  gridSize: number; // 50 or 100
}

export const PixelGrid: React.FC<PixelGridProps> = ({ pixels, visibleCount, isBreathing, gridSize }) => {
  
  // Memoize the grid lookup for performance
  const pixelMap = useMemo(() => {
    const map = new Map<string, string>();
    pixels.forEach(p => {
      map.set(`${p.x},${p.y}`, p.color);
    });
    return map;
  }, [pixels]);

  // Generate the snake path index map
  // Step 0 is at (0,0) [Bottom Left]
  const getStepForCell = (x: number, y: number): number => {
    // y is 0 at bottom.
    // Snake Logic:
    // Even Rows (0, 2, 4...): Left -> Right (0 to gridSize-1)
    // Odd Rows (1, 3, 5...): Right -> Left (gridSize-1 to 0)
    const row = y;
    const isEvenRow = row % 2 === 0;
    
    let positionInRow;
    if (isEvenRow) {
      positionInRow = x;
    } else {
      positionInRow = (gridSize - 1) - x;
    }
    
    return (row * gridSize) + positionInRow;
  };

  // Create grid cells
  const cells = [];
  for (let y = gridSize - 1; y >= 0; y--) { // Render DOM from Top to Bottom
    for (let x = 0; x < gridSize; x++) {
      const stepIndex = getStepForCell(x, y);
      const color = pixelMap.get(`${x},${y}`);
      
      const isVisible = stepIndex < visibleCount;
      const isHead = stepIndex === visibleCount - 1; // The "leading" pixel
      const isFilled = Boolean(color) && isVisible;
      
      // Base cell container
      const cellKey = `${x}-${y}`;

      // Peg (Empty State) Style
      // Always visible as the "board"
      const pegElement = (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[30%] h-[30%] rounded-full bg-slate-100 dark:bg-neutral-800 shadow-inner transition-colors duration-500"></div>
        </div>
      );

      // Bead (Filled State) Style
      let beadElement = null;
      if (isFilled && color) {
          // Bead visual style: Plastic look with a hole
          const beadStyle: React.CSSProperties = {
            backgroundColor: color,
            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.5), inset -1px -1px 2px rgba(0,0,0,0.2), 1px 1px 1px rgba(0,0,0,0.2)',
          };
          
          let beadClasses = "w-full h-full rounded-full relative transition-all duration-300 transform ";
          
          // Head effect
          if (isHead && !isBreathing && visibleCount < (gridSize * gridSize)) {
             beadClasses += "scale-125 z-10 shadow-lg brightness-110 ring-2 ring-white/80 ";
          } else {
             beadClasses += "scale-100 ";
          }

          beadElement = (
            <div className={beadClasses} style={beadStyle}>
                {/* The Hole */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-black/10 shadow-inner"></div>
            </div>
          );
      }

      cells.push(
        <div key={cellKey} className="relative aspect-square">
            {/* 1. The Pegboard Background (Always there) */}
            {pegElement}
            
            {/* 2. The Bead (Overlay) */}
            <div className="absolute inset-0 transition-opacity duration-300">
                {beadElement}
            </div>
        </div>
      );
    }
  }

  return (
    <div 
      className="
        relative gap-0 w-full max-w-[600px] aspect-square p-2 
        bg-white dark:bg-[#171717] 
        rounded-3xl 
        grid transition-all duration-500
        border-[6px] border-white dark:border-[#171717]
        shadow-[0_50px_100px_-12px_rgba(0,0,0,0.5)] 
        dark:shadow-[0_0_80px_-5px_rgba(255,255,255,0.4)]
      "
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      }}
    >
      {cells}
    </div>
  );
};