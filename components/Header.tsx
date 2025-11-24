import React from 'react';
import { Music, MessageSquarePlus } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Music size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            MelodyCraft
          </span>
        </div>
        
        <a
          href="https://forms.gle/PtroKjvt9gzu7i9cA"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 rounded-lg transition-all"
        >
          <MessageSquarePlus size={18} />
          <span>Give Feedback</span>
        </a>
      </div>
    </header>
  );
};