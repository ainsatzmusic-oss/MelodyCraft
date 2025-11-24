import React from 'react';
import { Code, Copy, Check } from 'lucide-react';

interface AbcEditorProps {
  abcContent: string;
}

export const AbcEditor: React.FC<AbcEditorProps> = ({ abcContent }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(abcContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-700">
          <Code size={18} />
          <h3 className="font-semibold text-sm">ABC Notation</h3>
        </div>
        <button 
          onClick={handleCopy}
          className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="flex-1 relative bg-[#1e1e1e]">
        <textarea
          readOnly
          value={abcContent}
          className="w-full h-full p-4 bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none custom-scrollbar leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
};