import { Block, Word } from '@/types';
import wordsData from '@/data/words.json';

export function getAllBlocks(): Block[] {
  return wordsData.blocks;
}

export function getBlockById(id: number): Block | undefined {
  return wordsData.blocks.find((block) => block.id === id);
}

export function getWordsByBlocks(blockIds: number[]): Word[] {
  if (blockIds.length === 0) {
    return wordsData.blocks.flatMap((block) => block.words);
  }
  return wordsData.blocks
    .filter((block) => blockIds.includes(block.id))
    .flatMap((block) => block.words);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomWords(words: Word[], count: number): Word[] {
  const shuffled = shuffleArray(words);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getWrongAnswers(
  correctWord: Word,
  allWords: Word[],
  count: number = 3
): Word[] {
  const wrongWords = allWords.filter((w) => w.id !== correctWord.id);
  return getRandomWords(wrongWords, count);
}

export function searchWords(query: string): Word[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  const allWords = wordsData.blocks.flatMap((block) => block.words);

  return allWords.filter(
    (word) =>
      word.character.includes(query) ||
      word.pinyin.toLowerCase().includes(lowerQuery) ||
      word.translation.toLowerCase().includes(lowerQuery)
  );
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
