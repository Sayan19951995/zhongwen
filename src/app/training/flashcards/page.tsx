'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getWordsByBlocks, shuffleArray } from '@/lib/utils';
import { getSelectedBlocks, updateStats, completeSession } from '@/lib/storage';
import { Word } from '@/types';

export default function FlashcardsPage() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);

  useEffect(() => {
    const selectedBlocks = getSelectedBlocks();
    const allWords = getWordsByBlocks(selectedBlocks);
    setWords(shuffleArray(allWords).slice(0, 20));
  }, []);

  const currentWord = words[currentIndex];

  const handleAnswer = (isKnown: boolean) => {
    if (isKnown) {
      setKnown((prev) => prev + 1);
      updateStats(true, 0);
    } else {
      setUnknown((prev) => prev + 1);
      updateStats(false, 0);
    }

    if (currentIndex + 1 >= words.length) {
      setIsComplete(true);
      completeSession();
      if (known / words.length >= 0.8) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 200);
    }
  };

  if (words.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((known / words.length) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-8"
        >
          <span className="text-8xl">{percentage >= 80 ? '🎉' : '💪'}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mb-4"
        >
          {percentage >= 80 ? 'Отлично!' : 'Хорошая работа!'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 mb-8"
        >
          <p className="text-xl">
            Знаю:{' '}
            <span className="font-bold text-green-500">{known}</span>
          </p>
          <p className="text-xl">
            Учу:{' '}
            <span className="font-bold text-orange-500">{unknown}</span>
          </p>
          <p className="text-2xl font-bold mt-4">{percentage}%</p>
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
            Ещё раз
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
        <span className="text-gray-500 text-sm">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-red-500"
          animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Pinyin toggle */}
      <div className="flex justify-end mb-4">
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

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsFlipped(!isFlipped)}
            className="card w-full aspect-[3/4] flex flex-col items-center justify-center cursor-pointer no-select"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {!isFlipped ? (
                <div className="text-center">
                  {showPinyin && <p className="text-lg pinyin mb-2">{currentWord.pinyin}</p>}
                  <p className="text-6xl chinese mb-4">{currentWord.character}</p>
                  <p className="text-gray-400 text-sm">Нажми, чтобы перевернуть</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <p className="text-3xl font-medium text-gray-800">
                    {currentWord.translation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isFlipped ? 1 : 0.3, y: 0 }}
        className="flex gap-4 mt-6"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAnswer(false)}
          disabled={!isFlipped}
          className="btn flex-1 bg-orange-100 text-orange-600 hover:bg-orange-200 disabled:opacity-50"
        >
          Не знаю 🤔
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAnswer(true)}
          disabled={!isFlipped}
          className="btn flex-1 bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50"
        >
          Знаю ✓
        </motion.button>
      </motion.div>
    </div>
  );
}
