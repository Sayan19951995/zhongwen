'use client';

import { UserProgress } from '@/types';

const STORAGE_KEY = 'zhongwen_progress';

const defaultProgress: UserProgress = {
  name: '',
  selectedBlocks: [],
  stats: {
    totalWords: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    bestCombo: 0,
    sessionsCompleted: 0,
  },
};

export function getUserProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultProgress;

  try {
    return JSON.parse(stored);
  } catch {
    return defaultProgress;
  }
}

export function saveUserProgress(progress: Partial<UserProgress>): void {
  if (typeof window === 'undefined') return;

  const current = getUserProgress();
  const updated = { ...current, ...progress };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function saveName(name: string): void {
  saveUserProgress({ name });
}

export function getName(): string {
  return getUserProgress().name;
}

export function saveSelectedBlocks(blocks: number[]): void {
  saveUserProgress({ selectedBlocks: blocks });
}

export function getSelectedBlocks(): number[] {
  return getUserProgress().selectedBlocks;
}

export function updateStats(correct: boolean, combo: number): void {
  const progress = getUserProgress();
  const stats = {
    ...progress.stats,
    totalWords: progress.stats.totalWords + 1,
    correctAnswers: progress.stats.correctAnswers + (correct ? 1 : 0),
    wrongAnswers: progress.stats.wrongAnswers + (correct ? 0 : 1),
    bestCombo: Math.max(progress.stats.bestCombo, combo),
  };
  saveUserProgress({ stats });
}

export function completeSession(): void {
  const progress = getUserProgress();
  saveUserProgress({
    stats: {
      ...progress.stats,
      sessionsCompleted: progress.stats.sessionsCompleted + 1,
    },
  });
}
