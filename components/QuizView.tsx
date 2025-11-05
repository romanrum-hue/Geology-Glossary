
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { GlossaryTerm, QuizQuestion } from '../types';

interface QuizViewProps {
  terms: GlossaryTerm[];
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const QuizView: React.FC<QuizViewProps> = ({ terms }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (terms.length > 0) {
      const generateQuestions = (): QuizQuestion[] => {
        // FIX: Explicitly type `term` and `t` to prevent them from being inferred as `unknown`.
        return shuffleArray(terms).map((term: GlossaryTerm) => {
          const wrongAnswers = shuffleArray(terms.filter((t: GlossaryTerm) => t.id !== term.id))
            .slice(0, 3)
            .map((t: GlossaryTerm) => t.translation);
          
          const options = shuffleArray([term.translation, ...wrongAnswers]);
          
          return {
            question: term.term,
            options,
            correctAnswer: term.translation
          };
        });
      };
      setQuestions(generateQuestions());
      setIsFinished(false);
      setCurrentQuestionIndex(0);
      setScore(0);
    }
  }, [terms]);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  }, [isAnswered, questions, currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleRestartQuiz = useCallback(() => {
     if (terms.length > 0) {
      const generateQuestions = (): QuizQuestion[] => {
        // FIX: Explicitly type `term` and `t` to prevent them from being inferred as `unknown`.
        return shuffleArray(terms).map((term: GlossaryTerm) => {
          const wrongAnswers = shuffleArray(terms.filter((t: GlossaryTerm) => t.id !== term.id))
            .slice(0, 3)
            .map((t: GlossaryTerm) => t.translation);
          
          const options = shuffleArray([term.translation, ...wrongAnswers]);
          
          return {
            question: term.term,
            options,
            correctAnswer: term.translation
          };
        });
      };
      setQuestions(generateQuestions());
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  }, [terms]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const progressPercentage = useMemo(() => (questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0), [currentQuestionIndex, questions.length]);

  if (questions.length === 0) {
    return <div className="text-center text-lg">Loading quiz...</div>;
  }
  
  if (isFinished) {
    const finalScorePercentage = (score / questions.length) * 100;
    let feedback = { message: "Отлично! Вы настоящий знаток геологии!", icon: "fa-trophy", color: "text-green-500" };
    if (finalScorePercentage < 50) {
      feedback = { message: "Неплохо, но стоит еще подучить. Попробуйте снова!", icon: "fa-book-reader", color: "text-red-500" };
    } else if (finalScorePercentage < 80) {
      feedback = { message: "Хороший результат! Вы на верном пути.", icon: "fa-thumbs-up", color: "text-yellow-500" };
    }

    return (
      <div className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-2xl">
        <i className={`fas ${feedback.icon} text-6xl ${feedback.color} mb-4`}></i>
        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-xl mb-4">{`Your final score is ${score} out of ${questions.length}`}</p>
        <p className="text-lg font-semibold mb-6">{feedback.message}</p>
        <button
          onClick={handleRestartQuiz}
          className="px-6 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors text-lg"
        >
          <i className="fas fa-redo-alt mr-2"></i>
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-2xl">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Score: {score}</p>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
          <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
      
      <div className="my-8">
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-2 text-center">What is the Russian translation for:</p>
        <h2 className="text-4xl font-bold text-center text-slate-800 dark:text-slate-100">{currentQuestion.question}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = option === currentQuestion.correctAnswer;
          let buttonClass = 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600';
          if (isAnswered) {
            if (isCorrect) {
              buttonClass = 'bg-green-500 text-white';
            } else if (selectedAnswer === option) {
              buttonClass = 'bg-red-500 text-white';
            } else {
              buttonClass = 'bg-slate-200 dark:bg-slate-600 text-slate-500 opacity-70';
            }
          }
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={isAnswered}
              className={`p-4 rounded-lg text-left text-lg font-medium transition-all duration-300 w-full ${buttonClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-6 text-center">
          <button
            onClick={handleNextQuestion}
            className="w-full md:w-auto px-8 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors text-lg"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;