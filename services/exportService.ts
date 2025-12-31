import { Pixel } from '../types';

// Layout Configuration for the Export Card
const EXPORT_CONFIG = {
    width: 1080,
    padding: 80, // Outer spacing around the canvas box
    textHeight: 200, // Space allocated for text at the bottom
    // The visual "Canvas Box" will take up the width minus padding
    get boxSize() { return this.width - (this.padding * 2); },
    get height() { return this.padding + this.boxSize + this.textHeight; }
};

// Export dimensions for the modal preview to use
export const EXPORT_DIMENSIONS = {
    width: EXPORT_CONFIG.width,
    height: EXPORT_CONFIG.height
};

export type BackgroundConfig = 
  | { type: 'solid'; color: string }
  | { type: 'gradient'; color: string }; // base color for gradient

// Helper for color manipulation
const adjustColor = (hex: string, amt: number) => {
    let usePound = false;
    if (hex[0] === "#") {
        hex = hex.slice(1);
        usePound = true;
    }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
};

// Helper to calculate contrast text color (Black or White)
const getContrastTextColor = (hexColor: string): string => {
    // If gradient, we assume the base color determines contrast, 
    // or we default to white for dark gradients/black for light.
    // Simple YIQ brightness check
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1e293b' : '#f5f5f5'; // Dark Slate vs White
};

// Helper to draw a rounded rectangle
const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const drawFrame = (
    ctx: CanvasRenderingContext2D, 
    pixels: Pixel[], 
    gridSize: number, 
    visibleCount: number,
    isDarkMode: boolean,
    name: string,
    bgConfig: BackgroundConfig
) => {
    const { width, height, padding, boxSize, textHeight } = EXPORT_CONFIG;

    // 1. Draw Background (Outer)
    if (bgConfig.type === 'gradient') {
        const themeColor = bgConfig.color;
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, themeColor);
        gradient.addColorStop(0.5, adjustColor(themeColor, 30));
        gradient.addColorStop(1, adjustColor(themeColor, -20));
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = bgConfig.color;
    }
    ctx.fillRect(0, 0, width, height);

    // Determine Inner Frame Style based on App Theme (isDarkMode), NOT background color
    const frameFillColor = isDarkMode ? '#2a2a2a' : '#ffffff';
    const frameBorderColor = isDarkMode ? '#2a2a2a' : '#ffffff'; // Consistent with canvas

    // 2. Draw "Canvas Box" (The White/Dark Container)
    const boxX = padding;
    const boxY = padding;
    const cornerRadius = 48; 

    // Shadow/Backlight Logic
    // Shadow direction/color still depends on if the outer background is dark or light for contrast
    const bgHex = bgConfig.type === 'gradient' ? bgConfig.color : bgConfig.color;
    const isOuterBgDark = getContrastTextColor(bgHex) === '#f5f5f5';

    if (isOuterBgDark) {
        // Dark background -> Glow effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.15)'; 
        ctx.shadowBlur = 120;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else {
        // Light background -> Drop Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 80;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 50;
    }

    // Box Fill
    roundRect(ctx, boxX, boxY, boxSize, boxSize, cornerRadius);
    ctx.fillStyle = frameFillColor; 
    ctx.fill();

    // Reset Shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Box Border (Stroke)
    ctx.lineWidth = 12;
    ctx.strokeStyle = frameBorderColor; 
    ctx.stroke();

    // 3. Grid Setup within the Box
    const internalPadding = 24;
    const gridDrawSize = boxSize - (internalPadding * 2);
    const startX = boxX + internalPadding;
    const startY = boxY + internalPadding;
    const cellSize = gridDrawSize / gridSize;

    const pixelMap = new Map<string, string>();
    pixels.forEach(p => pixelMap.set(`${p.x},${p.y}`, p.color));

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const screenY = startY + ((gridSize - 1 - y) * cellSize);
            const screenX = startX + (x * cellSize);

            const centerX = screenX + cellSize / 2;
            const centerY = screenY + cellSize / 2;
            const radius = (cellSize * 0.85) / 2;

            // Draw Peg (Empty Slot)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
            // Peg color adaptation based on frame style
            ctx.fillStyle = isDarkMode ? '#1a1a1a' : '#e2e8f0'; 
            ctx.fill();

            // Check if bead exists
            const color = pixelMap.get(`${x},${y}`);
            
            if (color) {
                // Bead Body
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                
                ctx.shadowColor = 'rgba(0,0,0,0.15)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fill();
                
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // Bead Hole
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.fill();

                // Specular Highlight
                ctx.beginPath();
                ctx.arc(centerX - radius*0.3, centerY - radius*0.3, radius * 0.25, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fill();
            }
        }
    }

    // 4. Render Name below the Box
    ctx.save();
    ctx.font = 'bold 72px "Inter", sans-serif';
    // Adaptive Text Color based on Outer Background
    ctx.fillStyle = getContrastTextColor(bgHex);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textCenterY = boxY + boxSize + (textHeight / 2);
    ctx.fillText(name || 'Pixel Art', width / 2, textCenterY);
    ctx.restore();
};

export const downloadPNG = (
    pixels: Pixel[], 
    gridSize: number, 
    name: string,
    isDarkMode: boolean,
    bgConfig: BackgroundConfig
) => {
    const { width, height } = EXPORT_CONFIG;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    drawFrame(ctx, pixels, gridSize, gridSize * gridSize, isDarkMode, name, bgConfig);

    const link = document.createElement('a');
    link.download = `${name || 'pixelflow'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};