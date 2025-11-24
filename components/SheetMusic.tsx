import React, { useEffect, useRef } from 'react';
import { Printer, Maximize2 } from 'lucide-react';
import abcjs from 'abcjs';

interface SheetMusicProps {
  abcContent: string;
  onRender: (visualObj: any) => void;
}

export const SheetMusic: React.FC<SheetMusicProps> = ({ abcContent, onRender }) => {
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paperRef.current && abcContent) {
      try {
        // Render the ABC notation to the DOM element
        const visualObj = abcjs.renderAbc(paperRef.current, abcContent, {
          responsive: "resize",
          add_classes: true,
          paddingtop: 0,
          paddingbottom: 30,
          paddingright: 20,
          paddingleft: 20,
          staffwidth: 800, // Base width, responsive will scale it
        });
        
        // Pass the visual object back to parent for audio syncing
        if (visualObj && visualObj.length > 0) {
          onRender(visualObj);
        }
      } catch (error) {
        console.error("Error rendering ABC:", error);
      }
    }
  }, [abcContent, onRender]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <h3 className="font-semibold text-slate-800">Sheet Music</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" 
            title="Print"
          >
             <Printer size={18} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Expand">
             <Maximize2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-50 overflow-auto relative custom-scrollbar">
        {/* Added pb-40 to ensure the bottom of the sheet music is visible above the fixed player controls */}
        <div className="min-h-full w-full flex justify-center p-8 pb-40">
            <div 
              id="paper" 
              ref={paperRef} 
              className="w-full max-w-4xl bg-white shadow-md min-h-[500px] p-4 rounded-sm"
            />
        </div>
      </div>
    </div>
  );
};