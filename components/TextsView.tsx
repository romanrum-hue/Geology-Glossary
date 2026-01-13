
import React, { useState, useMemo } from 'react';
import type { ReadingText, GlossaryTerm } from '../types';
import GlossaryTermTooltip from './GlossaryTermTooltip';

interface TextsViewProps {
  texts: ReadingText[];
  terms: GlossaryTerm[];
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const TextsView: React.FC<TextsViewProps> = ({ texts, terms }) => {
  const [selectedTextId, setSelectedTextId] = useState<number>(texts[0]?.id ?? 1);

  const selectedText = useMemo(() => {
    return texts.find(t => t.id === selectedTextId);
  }, [texts, selectedTextId]);
  
  const allTermsRegex = useMemo(() => {
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.length);
    const pattern = `\\b(${sortedTerms.map(t => escapeRegExp(t.term)).join('|')})\\b`;
    return new RegExp(pattern, 'gi');
  }, [terms]);

  const processedContent = useMemo(() => {
    if (!selectedText) return null;

    const lines = selectedText.content.split('\n').filter(line => line.trim() !== '');

    return lines.map((line, lineIndex) => {
      const parts = line.split(allTermsRegex);
      const content = parts.map((part, partIndex) => {
        if (!part) return null;
        const matchedTerm = terms.find(t => t.term.toLowerCase() === part.toLowerCase());
        if (matchedTerm) {
          return <GlossaryTermTooltip key={`${lineIndex}-${partIndex}`} term={matchedTerm} />;
        }
        return <React.Fragment key={`${lineIndex}-${partIndex}`}>{part}</React.Fragment>;
      });
      return <p key={lineIndex} className="mb-3 leading-relaxed text-lg">{content}</p>;
    });

  }, [selectedText, terms, allTermsRegex]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-1/3 lg:w-1/4">
        <h2 className="text-xl font-bold mb-4 border-b-2 border-sky-500 pb-2">Reading Texts</h2>
        <nav className="flex flex-col space-y-2">
          {texts.map(text => (
            <button
              key={text.id}
              onClick={() => setSelectedTextId(text.id)}
              className={`text-left p-3 rounded-md transition-colors duration-200 w-full ${selectedTextId === text.id ? 'bg-sky-600 text-white font-semibold shadow' : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {text.title}
            </button>
          ))}
        </nav>
      </aside>
      <section className="md:w-2/3 lg:w-3/4 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        {selectedText ? (
          <div>
            <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{selectedText.title}</h3>
              <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mt-1">{selectedText.type}</p>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {processedContent}
            </div>
          </div>
        ) : (
          <p>Please select a text to read.</p>
        )}
      </section>
    </div>
  );
};

export default TextsView;
