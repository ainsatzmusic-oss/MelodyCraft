import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import abcjs from 'abcjs';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { AbcEditor } from './components/AbcEditor';
import { SheetMusic } from './components/SheetMusic';
import { PlayerControls } from './components/PlayerControls';
import { MOCK_ABC_CONTENT } from './constants';

export type GenerationStatus = 'idle' | 'composing' | 'validating';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [abcContent, setAbcContent] = useState(MOCK_ABC_CONTENT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // ABCJS Audio State
  const visualObjRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Callback when SheetMusic finishes rendering
  const handleAbcRender = useCallback((visualObj: any) => {
    // abcjs returns an array of tunes, we usually want the first one
    visualObjRef.current = visualObj;
    
    // If we were playing, stop playback when content changes to avoid mismatch
    if (synthRef.current) {
      synthRef.current.stop();
      setIsPlaying(false);
    }
  }, []);

  // Audio Control Handlers
  const handlePlayPause = async () => {
    try {
      // Initialize Audio Context on user gesture if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (isPlaying) {
        if (synthRef.current) {
          synthRef.current.stop();
        }
        setIsPlaying(false);
        return;
      }

      // START PLAYBACK
      // Always create a new synth instance to ensure clean state
      const synth = new abcjs.synth.CreateSynth();
      synthRef.current = synth;

      if (visualObjRef.current && visualObjRef.current[0]) {
        // Initialize the synth with the audio context and the visual object
        await synth.init({ 
          audioContext: audioContextRef.current, 
          visualObj: visualObjRef.current[0],
          // CRITICAL FIX: abcjs requires an 'options' object to be present in the init params
          // to prevent "Cannot read properties of undefined (reading 'swing')" error.
          options: {} 
        });
        
        await synth.prime();
        
        // synth.start() usually returns a Promise that resolves when playback finishes.
        // However, in some cases it might return undefined, so we guard against it.
        const startPromise = synth.start();
        
        if (startPromise && typeof startPromise.then === 'function') {
          startPromise.then(() => {
            // Only reset if this synth is still the active one (user hasn't restarted/stopped)
            if (synthRef.current === synth) {
              setIsPlaying(false);
            }
          });
        }
        
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.stop();
    }
    setIsPlaying(false);
  };

  const handleClear = () => {
    handleStop();
    setAbcContent(MOCK_ABC_CONTENT);
    setIsEditMode(false);
  };

  const handleGenerate = async (prompt: string) => {
    // Stop any current playback
    handleStop();
    
    setStatus('composing');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-pro-preview';
      let generatedAbc = "";

      if (isEditMode) {
        // Edit Mode: Modify existing ABC
        const response = await ai.models.generateContent({
          model: model,
          contents: `Act as an expert music composer. Modify the following ABC notation based on this request: "${prompt}".
          
          CURRENT ABC CODE:
          ${abcContent}
          
          STRICT REQUIREMENTS:
          1. Update the music to match the user's request (e.g., change key, tempo, melody, instruments, dynamics).
          2. Ensure valid ABC notation starting with "X:1".
          3. Maintain or update "%%MIDI program" assignments for instruments.
          4. Return ONLY the ABC code string. No markdown.`,
        });
        generatedAbc = response.text?.replace(/```abc/g, '').replace(/```/g, '').trim() || "";
      } else {
        // Create Mode: Generate from scratch
        const response = await ai.models.generateContent({
          model: model,
          contents: `Compose a musical piece in ABC notation based on this description: "${prompt}".
          
          STRICT REQUIREMENTS:
          1. Assign a MIDI instrument to EVERY voice using "%%MIDI program [number]" (e.g., "%%MIDI program 0" for Piano).
          2. Do NOT allow any empty lines within the ABC code block.
          3. The output must be valid ABC notation starting with "X:1".
          4. Include a tempo indication (e.g., Q: 1/4=120).
          5. Return ONLY the ABC code string. Do not include markdown formatting (like \`\`\`abc).`,
        });
        generatedAbc = response.text?.replace(/```abc/g, '').replace(/```/g, '').trim() || "";
      }

      if (!generatedAbc) {
        throw new Error("Failed to generate ABC content.");
      }

      // Step 2: Validate and Fix Rhythm and Beaming (Common for both modes)
      setStatus('validating');
      const validationResponse = await ai.models.generateContent({
        model: model,
        contents: `Review the following ABC music notation for rhythmic accuracy and standard beaming.
        
        TASK:
        1. Check every measure to ensure the total beat count exactly matches the time signature (M:).
        2. If a measure has incorrect beats (too few or too many), FIX it by adjusting note values or adding rests.
        3. Check if the note beaming is standard and orderly. Fix any awkward or incorrect beaming patterns to ensure professional readability.
        4. If the code is valid, return it exactly as is.
        5. Ensure no empty lines exist in the final output.
        
        INPUT ABC:
        ${generatedAbc}
        
        OUTPUT:
        Return ONLY the validated ABC notation. No explanations. No markdown.`,
      });

      const finalAbc = validationResponse.text?.replace(/```abc/g, '').replace(/```/g, '').trim() || generatedAbc;
      
      setAbcContent(finalAbc);
      setIsEditMode(true);

    } catch (error) {
      console.error("Error generating music:", error);
      // In a real production app, we would handle error states here
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-32">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Controls & Code */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section>
                <PromptInput 
                    onGenerate={handleGenerate}
                    onClear={handleClear}
                    status={status} 
                    isEditMode={isEditMode}
                />
            </section>
            
            <section className="flex-1 min-h-[300px]">
                <AbcEditor abcContent={abcContent} />
            </section>
          </div>

          {/* Right Column: Sheet Music Display */}
          <div className="lg:col-span-8 min-h-[500px]">
            <SheetMusic abcContent={abcContent} onRender={handleAbcRender} />
          </div>
          
        </div>
      </main>

      <PlayerControls 
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        disabled={status !== 'idle' || !abcContent}
      />
    </div>
  );
};

export default App;