
import React, { useState, useMemo } from 'react';
import GlossaryCard from './GlossaryCard';
import type { GlossaryTerm } from '../types';

interface GlossaryViewProps {
  terms: GlossaryTerm[];
}

const GlossaryView: React.FC<GlossaryViewProps> = ({ terms }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTerms.map(term => (
          <GlossaryCard key={term.id} term={term} />
        ))}
      </div>
    </div>
  );
};

export default GlossaryView;
