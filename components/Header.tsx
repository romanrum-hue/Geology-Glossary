
import React from 'react';
import type { View } from '../types';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const commonButtonClasses = "px-4 py-2 rounded-md font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800";
  const activeButtonClasses = "bg-sky-600 text-white shadow-md";
  const inactiveButtonClasses = "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600";

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <i className="fas fa-mountain-sun text-4xl text-sky-600 mr-3"></i>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Geology Glossary</h1>
        </div>
        <nav className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setView('glossary')}
            className={`${commonButtonClasses} ${currentView === 'glossary' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            <i className="fas fa-book-open mr-2"></i>
            Glossary
          </button>
          <button
            onClick={() => setView('quiz')}
            className={`${commonButtonClasses} ${currentView === 'quiz' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            <i className="fas fa-question-circle mr-2"></i>
            Quiz
          </button>
          <button
            onClick={() => setView('texts')}
            className={`${commonButtonClasses} ${currentView === 'texts' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            <i className="fas fa-file-alt mr-2"></i>
            Texts
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
