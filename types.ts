
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

export type View = 'glossary' | 'quiz';
