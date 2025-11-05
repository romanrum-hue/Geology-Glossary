
import React, { useState, useCallback } from 'react';
import type { GlossaryTerm } from '../types';
import { generateAudio } from '../services/geminiService';

interface GlossaryCardProps {
  term: GlossaryTerm;
}

const GlossaryCard: React.FC<GlossaryCardProps> = ({ term }) => {
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const playAudio = useCallback(async () => {
    setIsAudioLoading(true);
    setAudioError(null);
    try {
      const audioDataB64 = await generateAudio(term.term);
      if (audioDataB64) {
        const audioBytes = Uint8Array.from(atob(audioDataB64), c => c.charCodeAt(0));
        // FIX: Cast window to `any` to allow access to vendor-prefixed `webkitAudioContext`.
        const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        // Custom decoding for raw PCM data
        const frameCount = audioBytes.length / 2; // 16-bit PCM
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
      setAudioError("Could not play audio.");
    } finally {
      setIsAudioLoading(false);
    }
  }, [term.term]);

  const imageUrl = `https://picsum.photos/seed/${term.term.replace(/\s/g, '')}/400/200`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <img src={imageUrl} alt={term.term} className="w-full h-40 object-cover" />
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-sky-700 dark:text-sky-400">{term.term}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-2">{term.transcription}</p>
          </div>
          <button
            onClick={playAudio}
            disabled={isAudioLoading}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={`Pronounce ${term.term}`}
          >
            {isAudioLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-volume-up"></i>
            )}
          </button>
        </div>
        {audioError && <p className="text-red-500 text-xs mt-1">{audioError}</p>}
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-2">{term.translation}</p>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex-grow flex items-center">
            <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
            <i className="fas fa-quote-left mr-2 text-slate-400"></i>
            {term.example}
            </p>
        </div>
      </div>
    </div>
  );
};

export default GlossaryCard;