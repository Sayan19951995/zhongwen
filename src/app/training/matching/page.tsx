'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getWordsByBlocks, shuffleArray, formatTime } from '@/lib/utils';
import { getSelectedBlocks, updateStats, completeSession } from '@/lib/storage';
import { Word } from '@/types';

const VISIBLE_PAIRS = 6;
const INITIAL_TIME = 120; // 2 minutes

interface CardItem {
  id: string;
  wordId: number;
  type: 'translation' | 'character';
  content: string;
  pinyin?: string;
}

export default function MatchingPage() {
  const router = useRouter();
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [usedWordIds, setUsedWordIds] = useState<Set<number>>(new Set());
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);
  const [totalMatched, setTotalMatched] = useState(0);

  // Create cards from words
  const createCardsFromWords = useCallback((words: Word[]): CardItem[] => {
    const translationCards: CardItem[] = words.map((word) => ({
      id: `t-${word.id}-${Date.now()}`,
      wordId: word.id,
      type: 'translation',
      content: word.translation,
    }));

    const characterCards: CardItem[] = words.map((word) => ({
      id: `c-${word.id}-${Date.now()}`,
      wordId: word.id,
      type: 'character',
      content: word.character,
      pinyin: word.pinyin,
    }));

    return [
      ...shuffleArray(translationCards),
      ...shuffleArray(characterCards),
    ];
  }, []);

  // Initialize game
  useEffect(() => {
    const selectedBlocks = getSelectedBlocks();
    const words = getWordsByBlocks(selectedBlocks);
    const shuffledWords = shuffleArray(words);
    setAllWords(shuffledWords);

    const initialWords = shuffledWords.slice(0, VISIBLE_PAIRS);
    const initialUsedIds = new Set(initialWords.map(w => w.id));
    setUsedWordIds(initialUsedIds);
    setCards(createCardsFromWords(initialWords));
  }, [createCardsFromWords]);

  // Timer
  useEffect(() => {
    if (isComplete || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, timeLeft]);

  // Add new word when matched
  const addNewWord = useCallback(() => {
    const availableWords = allWords.filter(w => !usedWordIds.has(w.id));
    if (availableWords.length === 0) return null;

    const newWord = availableWords[0];
    setUsedWordIds(prev => new Set([...prev, newWord.id]));

    const newCards: CardItem[] = [
      {
        id: `t-${newWord.id}-${Date.now()}`,
        wordId: newWord.id,
        type: 'translation',
        content: newWord.translation,
      },
      {
        id: `c-${newWord.id}-${Date.now()}`,
        wordId: newWord.id,
        type: 'character',
        content: newWord.character,
        pinyin: newWord.pinyin,
      },
    ];

    setCards(prev => [...prev, ...newCards]);
    return newWord;
  }, [allWords, usedWordIds]);

  // Check completion (when time runs out OR all words matched)
  useEffect(() => {
    if (isComplete) return;

    // Check if all words have been used and matched
    const allWordsMatched = allWords.length > 0 &&
      usedWordIds.size === allWords.length &&
      matchedIds.size === allWords.length;

    if (timeLeft <= 0 || allWordsMatched) {
      setIsComplete(true);
      completeSession();
      if (totalMatched >= 10 || allWordsMatched) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [timeLeft, isComplete, totalMatched, allWords.length, usedWordIds.size, matchedIds.size]);

  const handleCardClick = useCallback(
    (card: CardItem) => {
      if (matchedIds.has(card.wordId) || wrongPair.length > 0) return;

      if (!selectedCard) {
        setSelectedCard(card);
        return;
      }

      if (selectedCard.id === card.id) {
        setSelectedCard(null);
        return;
      }

      // Check if same type
      if (selectedCard.type === card.type) {
        setSelectedCard(card);
        return;
      }

      // Check match
      if (selectedCard.wordId === card.wordId) {
        // Match!
        setMatchedIds((prev) => new Set([...prev, card.wordId]));
        setCombo((prev) => prev + 1);
        setScore((prev) => prev + 10 + combo * 2);
        setTotalMatched((prev) => prev + 1);
        updateStats(true, combo + 1);
        setSelectedCard(null);

        // Add new word after a short delay
        setTimeout(() => {
          addNewWord();
        }, 300);
      } else {
        // Wrong!
        setWrongPair([selectedCard.id, card.id]);
        setCombo(0);
        updateStats(false, 0);

        setTimeout(() => {
          setWrongPair([]);
          setSelectedCard(null);
        }, 500);
      }
    },
    [selectedCard, matchedIds, wrongPair, combo, addNewWord]
  );

  const leftCards = cards.filter((c) => c.type === 'translation');
  const rightCards = cards.filter((c) => c.type === 'character');

  if (isComplete) {
    const allWordsFinished = matchedIds.size === allWords.length;
    const success = totalMatched >= 10 || allWordsFinished;
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-8"
        >
          <span className="text-8xl">{success ? '🎉' : '⏰'}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mb-4"
        >
          {allWordsFinished ? 'Все слова пройдены!' : success ? 'Отлично!' : 'Время вышло!'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 mb-8"
        >
          <p className="text-xl">
            Угадано пар:{' '}
            <span className="font-bold text-green-500">
              {totalMatched}
            </span>
          </p>
          <p className="text-xl">
            Счёт: <span className="font-bold text-red-500">{score}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 w-full"
        >
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full"
          >
            Играть снова
          </button>
          <button
            onClick={() => router.push('/training')}
            className="btn btn-secondary w-full"
          >
            Выбрать режим
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/training')}
          className="text-gray-400 text-sm"
        >
          ← Назад
        </button>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">COMBO</span>
            <motion.span
              key={combo}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className={`font-bold ${combo > 0 ? 'text-red-500' : 'text-gray-400'}`}
            >
              x{combo}
            </motion.span>
            {combo >= 5 && <span>🔥</span>}
          </div>
        </div>

        {/* Timer */}
        <motion.div
          animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: timeLeft <= 10 ? Infinity : 0, duration: 0.5 }}
          className={`font-mono font-bold ${
            timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          {formatTime(timeLeft)}
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((totalMatched / 15) * 100, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Instruction and toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">
          Угадано: <span className="font-bold text-red-500">{totalMatched}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Пиньинь</span>
          <button
            onClick={() => setShowPinyin(!showPinyin)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              showPinyin ? 'bg-red-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                showPinyin ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 flex gap-3">
        {/* Left column - translations */}
        <div className="flex-1 flex flex-col gap-3">
          <AnimatePresence>
            {leftCards.map((card) => {
              const isMatched = matchedIds.has(card.wordId);
              const isSelected = selectedCard?.id === card.id;
              const isWrong = wrongPair.includes(card.id);

              if (isMatched) return null;

              return (
                <motion.button
                  key={card.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardClick(card)}
                  className={`card p-4 text-center no-select transition-all min-h-[88px] flex items-center justify-center ${
                    isWrong
                      ? 'border-red-500 bg-red-50 animate-shake'
                      : isSelected
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-lg">{card.content}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right column - characters */}
        <div className="flex-1 flex flex-col gap-3">
          <AnimatePresence>
            {rightCards.map((card) => {
              const isMatched = matchedIds.has(card.wordId);
              const isSelected = selectedCard?.id === card.id;
              const isWrong = wrongPair.includes(card.id);

              if (isMatched) return null;

              return (
                <motion.button
                  key={card.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardClick(card)}
                  className={`card p-4 text-center no-select transition-all min-h-[88px] flex flex-col items-center justify-center ${
                    isWrong
                      ? 'border-red-500 bg-red-50 animate-shake'
                      : isSelected
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                      : 'border-gray-200'
                  }`}
                >
                  {showPinyin && <span className="text-sm pinyin">{card.pinyin}</span>}
                  <span className="text-2xl chinese">{card.content}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
