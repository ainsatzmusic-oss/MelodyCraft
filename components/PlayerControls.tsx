import React from 'react';
import { Play, Pause, SkipBack } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  disabled: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ 
  isPlaying, 
  onPlayPause, 
  onStop,
  disabled,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/90 backdrop-blur-lg border border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-2xl p-4 z-40">
      <div className="flex items-center gap-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onStop}
            disabled={disabled}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button 
            onClick={onPlayPause}
            disabled={disabled}
            className={`w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95
              ${disabled ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700'}
            `}
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>
        </div>

        {/* Info / Status */}
        <div className="flex-1 flex flex-col justify-center gap-1 px-4">
            <div className="text-sm font-medium text-slate-700">
               {isPlaying ? "Now Playing..." : "Ready to Play"}
            </div>
            {/* Simplified progress indicator */}
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                {isPlaying && (
                    <div className="h-full bg-indigo-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-full origin-left" />
                )}
            </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
            0% { transform: scaleX(0); opacity: 0.5; }
            50% { opacity: 1; }
            100% { transform: scaleX(1); opacity: 0; }
        }
      `}} />
    </div>
  );
};