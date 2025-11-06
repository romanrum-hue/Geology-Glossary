import React, { useState, useCallback } from 'react';
import type { GlossaryTerm } from '../types';
import { generateAudio } from '../services/geminiService';

interface GlossaryCardProps {
  term: GlossaryTerm;
  flipMode: 'en-ru' | 'ru-en';
  knownCount: number;
  onMarkCorrect: (id: number) => void;
  onMarkIncorrect: (id: number) => void;
}

const GlossaryCard: React.FC<GlossaryCardProps> = ({ term, flipMode, knownCount, onMarkCorrect, onMarkIncorrect }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const playAudio = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from flipping when clicking the audio button
    setIsAudioLoading(true);
    setAudioError(null);
    try {
      const audioDataB64 = await generateAudio(term.term);
      if (audioDataB64) {
        const audioBytes = Uint8Array.from(atob(audioDataB64), c => c.charCodeAt(0));
        const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
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

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleMark = (isCorrect: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCorrect) {
      onMarkCorrect(term.id);
    } else {
      onMarkIncorrect(term.id);
    }
    setIsFlipped(false);
  };
  
  const imageUrl = `https://picsum.photos/seed/${term.term.replace(/\s/g, '')}/400/200`;

  const EnglishSideContent = (
    <div className="flex flex-col flex-grow">
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
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex-grow flex items-center">
            <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full">
            <i className="fas fa-quote-left mr-2 text-slate-400"></i>
            {term.example}
            </p>
        </div>
      </div>
    </div>
  );

  const RussianSideContent = (
    <div className="flex-grow flex justify-center items-center p-5">
      <h3 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-200">{term.translation}</h3>
    </div>
  );

  const frontContent = flipMode === 'en-ru' ? EnglishSideContent : RussianSideContent;
  const backContent = flipMode === 'ru-en' ? EnglishSideContent : RussianSideContent;

  return (
    <div className={`[perspective:1000px] min-h-[420px] transition-opacity duration-300 ${knownCount >= 3 ? 'opacity-60' : ''}`}>
      <div
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front Face */}
        <div
          className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
          onClick={handleFlip}
          aria-hidden={isFlipped}
          role="button"
          tabIndex={0}
        >
          {frontContent}
        </div>

        {/* Back Face */}
        <div
          className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col"
          aria-hidden={!isFlipped}
        >
          <div className="flex-grow flex flex-col">
            {backContent}
          </div>
          <div className="flex justify-stretch border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={(e) => handleMark(false, e)}
              className="w-1/2 py-3 text-lg font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Mark as incorrect"
            >
              <i className="fas fa-times mr-2"></i> I forgot
            </button>
            <button
              onClick={(e) => handleMark(true, e)}
              className="w-1/2 py-3 text-lg font-semibold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border-l border-slate-200 dark:border-slate-700"
              aria-label="Mark as correct"
            >
              <i className="fas fa-check mr-2"></i> I knew it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlossaryCard;