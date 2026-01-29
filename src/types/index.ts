export interface Word {
  id: number;
  character: string;
  pinyin: string;
  translation: string;
}

export interface Block {
  id: number;
  name: string;
  chineseName: string;
  words: Word[];
}

export interface WordsData {
  blocks: Block[];
  extras: {
    weekdays: Omit<Word, 'id'>[];
    months: Omit<Word, 'id'>[];
  };
}

export interface UserProgress {
  name: string;
  selectedBlocks: number[];
  stats: {
    totalWords: number;
    correctAnswers: number;
    wrongAnswers: number;
    bestCombo: number;
    sessionsCompleted: number;
  };
}

export type TrainingMode = 'matching' | 'flashcards' | 'quiz' | 'typing';

export interface MatchingPair {
  word: Word;
  isMatched: boolean;
}

export interface GameState {
  currentIndex: number;
  score: number;
  combo: number;
  timeLeft: number;
  isComplete: boolean;
}
