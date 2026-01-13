
import React, { useState, useCallback } from 'react';
import type { GlossaryTerm } from '../types';
import { generateAudio } from '../services/geminiService';

interface GlossaryTermTooltipProps {
  term: GlossaryTerm;
}

const GlossaryTermTooltip: React.FC<GlossaryTermTooltipProps> = ({ term }) => {
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const playAudio = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAudioLoading(true);
    setAudioError(null);
    try {
      const audioDataB64 = await generateAudio(term.term);
      if (audioDataB64) {
        const audioBytes = Uint8Array.from(atob(audioDataB64), c => c.charCodeAt(0));
        const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const frameCount = audioBytes.length / 2;
        const audioBuffer = audioContext.createBuffer(1, frameCount, 24000);
        const channelData = audioBuffer.getChannelData(0);
        const dataView = new DataView(audioBytes.buffer);

        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      } else {
        throw new Error("Failed to generate audio.");
      }
    } catch (error) {
      console.error(error);
      setAudioError("Error");
    } finally {
      setIsAudioLoading(false);
    }
  }, [term.term]);


  return (
    <span className="relative group inline-block">
      <span className="font-bold text-sky-600 dark:text-sky-400 cursor-pointer border-b-2 border-dotted border-sky-600/50 dark:border-sky-400/50">
        {term.term}
      </span>
      <div className="absolute bottom-full mb-3 w-72 p-4 bg-slate-900 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 -translate-x-1/2 left-1/2" style={{ transform: 'translateX(-50%)' }}>
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-lg text-sky-300">{term.translation}</h4>
                <p className="text-sm italic text-slate-300">{term.transcription}</p>
            </div>
            <button
                onClick={playAudio}
                disabled={isAudioLoading}
                className="p-2 -mt-1 -mr-1 rounded-full text-slate-300 hover:bg-slate-700 transition-colors pointer-events-auto"
                aria-label={`Pronounce ${term.term}`}
            >
                 {isAudioLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                ) : (
                    <i className={`fas ${audioError ? 'fa-exclamation-circle text-red-400' : 'fa-volume-up'}`}></i>
                )}
            </button>
        </div>
        <div className="absolute w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900 -bottom-2 left-1/2 -translate-x-1/2"></div>
      </div>
    </span>
  );
};

export default GlossaryTermTooltip;
