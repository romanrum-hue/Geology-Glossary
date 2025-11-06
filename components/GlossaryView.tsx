import React, { useState, useMemo, useCallback } from 'react';
import GlossaryCard from './GlossaryCard';
import type { GlossaryTerm } from '../types';

interface GlossaryViewProps {
  terms: GlossaryTerm[];
}

const GlossaryView: React.FC<GlossaryViewProps> = ({ terms }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [flipMode, setFlipMode] = useState<'en-ru' | 'ru-en'>('en-ru');
  const [termProgress, setTermProgress] = useState<Record<number, number>>({});

  const handleMarkCorrect = useCallback((termId: number) => {
    setTermProgress(prev => ({
      ...prev,
      [termId]: (prev[termId] || 0) + 1,
    }));
  }, []);

  const handleMarkIncorrect = useCallback((termId: number) => {
    setTermProgress(prev => ({
      ...prev,
      [termId]: 0,
    }));
  }, []);

  const filteredTerms = useMemo(() => {
    return terms.filter(term =>
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [terms, searchTerm]);

  return (
    <div>
      <div className="mb-8 sticky top-20 z-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow shadow-sm"
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        </div>
      </div>

      <div className="mb-8 flex justify-center items-center p-1 bg-slate-200 dark:bg-slate-700 rounded-lg max-w-sm mx-auto shadow-inner">
        <button
            onClick={() => setFlipMode('en-ru')}
            className={`w-1/2 px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${flipMode === 'en-ru' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow' : 'text-slate-500 dark:text-slate-300'}`}
            aria-pressed={flipMode === 'en-ru'}
        >
            English → Russian
        </button>
        <button
            onClick={() => setFlipMode('ru-en')}
            className={`w-1/2 px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${flipMode === 'ru-en' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow' : 'text-slate-500 dark:text-slate-300'}`}
            aria-pressed={flipMode === 'ru-en'}
        >
            Russian → English
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTerms.map(term => (
          <GlossaryCard 
            key={term.id} 
            term={term} 
            flipMode={flipMode}
            knownCount={termProgress[term.id] || 0}
            onMarkCorrect={handleMarkCorrect}
            onMarkIncorrect={handleMarkIncorrect}
          />
        ))}
      </div>
    </div>
  );
};

export default GlossaryView;