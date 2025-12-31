import React, { useState } from 'react';
import { ArtWork, Pixel } from '../types';
import { X, Calendar, Trash2, Edit2, Check } from 'lucide-react';

interface HistoryViewProps {
  history: ArtWork[];
  onSelect: (art: ArtWork) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// Mini renderer for thumbnails
const MiniGrid: React.FC<{ pixels: Pixel[], color: string }> = ({ pixels, color }) => {
    return (
        <div className="w-full aspect-square relative overflow-hidden rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 transition-colors">
            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: color }}></div>
            {/* Abstract representation */}
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="grid grid-cols-5 gap-1 opacity-60">
                    {pixels.slice(0, 25).map((p, i) => (
                         <div key={i} className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: p.color }}></div>
                    ))}
                 </div>
            </div>
        </div>
    )
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onDelete, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50/95 dark:bg-neutral-950/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-300 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
          My Collection
        </h2>
        
        <div className="flex gap-3">
            {history.length > 0 && (
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                        isEditing 
                        ? 'bg-indigo-500 text-white shadow-md' 
                        : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-300 dark:hover:bg-neutral-700'
                    }`}
                >
                    {isEditing ? (
                        <><Check size={16} /> Done</>
                    ) : (
                        <><Edit2 size={16} /> Manage</>
                    )}
                </button>
            )}

            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-neutral-400 transition-colors"
            >
                <X size={32} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-10">
           {history.map((art) => (
             <div 
                key={art.id} 
                className={`break-inside-avoid relative group transition-transform duration-300 ${
                    isEditing ? 'hover:scale-100' : 'hover:scale-[1.02] cursor-pointer'
                }`}
                onClick={() => !isEditing && onSelect(art)}
             >
                {/* Delete Button (Only in Edit Mode) */}
                {isEditing && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(art.id);
                        }}
                        className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-90 transition-all animate-in zoom-in duration-200"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                )}

                {/* Card Content */}
                <div className={`glass-panel rounded-xl p-3 dark:bg-neutral-900/50 dark:border-neutral-800 ${isEditing ? '' : ''}`}>
                    <MiniGrid pixels={art.pixels} color={art.themeColor} />
                    <div className="mt-3">
                        <h3 className="font-semibold text-lg truncate text-slate-800 dark:text-neutral-200">{art.name}</h3>
                        <div className="flex items-center text-xs text-slate-500 dark:text-neutral-500 mt-1">
                            <Calendar size={12} className="mr-1" />
                            {new Date(art.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
             </div>
           ))}
        </div>
        
        {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-neutral-600">
                <p className="text-xl">No artworks created yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};