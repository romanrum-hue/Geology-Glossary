
export interface GlossaryTerm {
  id: number;
  term: string;
  translation: string;
  transcription: string;
  example: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ReadingText {
  id: number;
  title: string;
  type: 'Dialogue' | 'Scientific Article' | 'Journal Entry';
  content: string;
}

export type View = 'glossary' | 'quiz' | 'texts';
