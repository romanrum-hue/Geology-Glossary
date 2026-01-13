
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import GlossaryView from './components/GlossaryView';
import QuizView from './components/QuizView';
import TextsView from './components/TextsView';
import { glossaryData, readingTexts } from './constants';
import type { View } from './types';


const App: React.FC = () => {
  const [view, setView] = useState<View>('glossary');

  const handleSetView = useCallback((newView: View) => {
    setView(newView);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header currentView={view} setView={handleSetView} />
      <main className="container mx-auto px-4 py-8">
        {view === 'glossary' && <GlossaryView terms={glossaryData} />}
        {view === 'quiz' && <QuizView terms={glossaryData} />}
        {view === 'texts' && <TextsView texts={readingTexts} terms={glossaryData} />}
      </main>
      <footer className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
        <p>Geology Glossary App &copy; 2024</p>
      </footer>
    </div>
  );
};

export default App;
