export interface Pixel {
  x: number; // 0 to gridSize-1
  y: number; // 0 to gridSize-1, where 0 is bottom
  color: string; // Hex code
  id: string; // Unique ID for key
}

export interface ArtWork {
  id: string;
  name: string;
  createdAt: number;
  pixels: Pixel[];
  themeColor: string; // Dominant color for background
  gridSize: number; // 50 or 100
}

export enum AppState {
  IDLE = 'IDLE',         // Waiting for input
  PROCESSING = 'PROCESSING', // AI is thinking
  ANIMATING = 'ANIMATING',   // Snake animation
  COMPLETE = 'COMPLETE',     // Show result
  HISTORY = 'HISTORY'        // Viewing history
}

export interface SnakeStep {
  x: number;
  y: number;
}
