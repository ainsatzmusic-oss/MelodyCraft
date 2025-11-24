import React, { useState } from 'react';
import { Wand2, Sparkles, Music2, CheckCircle2, RotateCcw, Pencil } from 'lucide-react';
import { GenerationStatus } from '../App';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  onClear: () => void;
  status: GenerationStatus;
  isEditMode: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, onClear, status, isEditMode }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      await onGenerate(prompt);
      setPrompt(''); // Clear prompt after submission for better UX in edit loop
    }
  };

  const isGenerating = status !== 'idle';

  const getStatusText = () => {
    switch (status) {
      case 'composing': return isEditMode ? 'Refining melody...' : 'Composing melody...';
      case 'validating': return 'Polishing rhythm & style...';
      default: return isEditMode ? 'Update Music' : 'Generate Music';
    }
  };

  const getProgressWidth = () => {
    switch (status) {
      case 'composing': return 'w-1/2';
      case 'validating': return 'w-[90%]';
      default: return 'w-0';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 p-6 relative overflow-hidden
      ${isEditMode ? 'border-indigo-300 bg-indigo-50/50 shadow-indigo-100 ring-1 ring-indigo-100' : 'border-slate-200'}
    `}>
      {/* Background Progress Bar */}
      <div className={`absolute top-0 left-0 h-1 bg-indigo-500 transition-all duration-1000 ease-out ${isGenerating ? getProgressWidth() : 'w-0 opacity-0'}`} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <Pencil className="text-indigo-600 w-5 h-5" />
          ) : (
            <Sparkles className="text-amber-500 w-5 h-5" />
          )}
          <h2 className={`text-lg font-semibold ${isEditMode ? 'text-indigo-900' : 'text-slate-800'}`}>
            {isEditMode ? 'Refine & Edit' : 'Compose'}
          </h2>
        </div>
        
        {isEditMode && (
          <button
            onClick={onClear}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            title="Clear current song and start over"
          >
            <RotateCcw size={14} />
            New Song
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={isEditMode 
            ? "How should I change the song? (e.g., 'Make it faster', 'Change key to G minor', 'Add a flute solo')" 
            : "Describe the music you want to hear... (e.g., 'A melancholic piano piece in A minor')"
          }
          disabled={isGenerating}
          className={`w-full h-32 p-4 rounded-xl border focus:ring-2 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed
            ${isEditMode 
              ? 'bg-white border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300' 
              : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 text-slate-700 placeholder-slate-400'
            }
          `}
        />
        
        {/* Status Indicators */}
        {isGenerating && (
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-indigo-600 animate-pulse">
             <span className="flex items-center gap-1.5">
               {status === 'composing' && <Music2 size={14} className="animate-bounce" />}
               {status === 'validating' && <CheckCircle2 size={14} />}
               {status === 'composing' ? (isEditMode ? 'Step 1/2: Refining' : 'Step 1/2: Composition') : 'Step 2/2: Validation'}
             </span>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-lg transition-all
              ${!prompt.trim() || isGenerating 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:translate-y-[-1px] shadow-indigo-200'
              }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {getStatusText()}
              </>
            ) : (
              <>
                {isEditMode ? <Wand2 size={18} /> : <Wand2 size={18} />}
                {getStatusText()}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};