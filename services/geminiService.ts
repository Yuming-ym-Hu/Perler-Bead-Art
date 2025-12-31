import { Pixel } from "../types";

/**
 * Generates pixel art data from an uploaded image string (Base64).
 * Uses client-side Canvas processing.
 */
export const generatePixelArt = async (
  imageBase64: string,
  size: number = 50
): Promise<{ pixels: Pixel[], themeColor: string }> => {
  // Directly process the image using Canvas
  return processImageWithCanvas(imageBase64, size);
};

const processImageWithCanvas = (base64Data: string, size: number): Promise<{ pixels: Pixel[], themeColor: string }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Aspect Fit Logic (Contain)
            // Long side = size, Short side = scaled proportionally. Centered.
            const aspect = img.width / img.height;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (aspect >= 1) {
                // Landscape: Width is maxed, Height scales
                drawWidth = size;
                drawHeight = size / aspect;
                offsetX = 0;
                offsetY = (size - drawHeight) / 2;
            } else {
                // Portrait: Height is maxed, Width scales
                drawHeight = size;
                drawWidth = size * aspect;
                offsetY = 0;
                offsetX = (size - drawWidth) / 2;
            }

            // Clear canvas (ensure transparency)
            ctx.clearRect(0, 0, size, size);

            // Draw and resize image
            // Disable smoothing for crisp pixelation
            ctx.imageSmoothingEnabled = false; 
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;
            const pixels: Pixel[] = [];
            const colorCounts: Record<string, number> = {};

            // Iterate through grid
            // Canvas data is Top-to-Bottom (y=0 is top), Left-to-Right
            // Our app treats y=0 as BOTTOM. We need to flip Y.
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const index = (y * size + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    const a = data[index + 3];

                    // Only ignore transparent pixels.
                    // Empty space from Aspect Fit will have a=0, so this handles "leaving it empty".
                    if (a > 50) {
                        const hex = rgbToHex(r, g, b);
                        
                        // Count for theme color
                        colorCounts[hex] = (colorCounts[hex] || 0) + 1;

                        pixels.push({
                            x: x,
                            y: (size - 1) - y, // Flip Y so 0 is bottom
                            color: hex,
                            id: `px-${x}-${(size - 1) - y}-${Date.now()}`
                        });
                    }
                }
            }

            // Find dominant color
            let themeColor = '#4f46e5';
            let maxCount = 0;
            for (const [color, count] of Object.entries(colorCounts)) {
                // Ignore black/white for theme calculation if possible to keep the UI colorful
                if (count > maxCount && color !== '#000000' && color !== '#ffffff') {
                    maxCount = count;
                    themeColor = color;
                }
            }

            resolve({ pixels, themeColor });
        };

        img.onerror = (err) => reject(new Error("Failed to load image for processing"));
        
        // Ensure prefix if missing, but respect existing prefix (e.g. image/png)
        const src = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`;
        img.src = src;
    });
};

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
