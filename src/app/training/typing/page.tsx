'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getWordsByBlocks, shuffleArray } from '@/lib/utils';
import { getSelectedBlocks, updateStats, completeSession } from '@/lib/storage';
import { Word } from '@/types';

const WORDS_COUNT = 10;

export default function TypingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);

  useEffect(() => {
    const selectedBlocks = getSelectedBlocks();
    const allWords = getWordsByBlocks(selectedBlocks);
    setWords(shuffleArray(allWords).slice(0, WORDS_COUNT));
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const currentWord = words[currentIndex];

  const checkAnswer = () => {
    if (!input.trim()) return;

    const userAnswer = input.trim().toLowerCase();
    const correctAnswer = currentWord.translation.toLowerCase();

    // Check if the answer is close enough (allow minor typos)
    const isMatch =
      userAnswer === correctAnswer ||
      correctAnswer.includes(userAnswer) ||
      userAnswer.includes(correctAnswer);

    setIsCorrect(isMatch);

    if (isMatch) {
      setScore((prev) => prev + 10 + combo * 2);
      setCombo((prev) => prev + 1);
      updateStats(true, combo + 1);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else {
      setCombo(0);
      updateStats(false, 0);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= words.length) {
        setIsComplete(true);
        completeSession();
      } else {
        setCurrentIndex((prev) => prev + 1);
        setInput('');
        setIsCorrect(null);
      }
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isCorrect === null) {
      checkAnswer();
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
    const percentage = Math.round((score / (WORDS_COUNT * 10)) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-8"
        >
          <span className="text-8xl">{percentage >= 80 ? '✍️' : '📝'}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mb-4"
        >
          {percentage >= 80 ? 'Отлично!' : 'Продолжай учить!'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 mb-8"
        >
          <p className="text-xl">
            Счёт: <span className="font-bold text-red-500">{score}</span>
          </p>
          <p className="text-gray-500">{percentage}% правильных ответов</p>
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

        <span className="font-bold text-red-500">{score}</span>
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

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex-1 flex flex-col"
        >
          {/* Word */}
          <div className="text-center mb-8">
            {showPinyin && <p className="text-lg pinyin mb-2">{currentWord.pinyin}</p>}
            <p className="text-5xl chinese mb-2">{currentWord.character}</p>
            <p className="text-gray-400 text-sm">Напишите перевод</p>
          </div>

          {/* Input */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isCorrect !== null}
                placeholder="Введите перевод..."
                className={`text-center text-xl transition-all ${
                  isCorrect === true
                    ? 'border-green-500 bg-green-50'
                    : isCorrect === false
                    ? 'border-red-500 bg-red-50'
                    : ''
                }`}
              />

              {/* Feedback */}
              <AnimatePresence>
                {isCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-center ${
                      isCorrect ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {isCorrect ? (
                      <span className="text-lg">✓ Правильно!</span>
                    ) : (
                      <div>
                        <span className="text-lg">✗ Неправильно</span>
                        <p className="text-sm mt-1">
                          Правильный ответ:{' '}
                          <span className="font-bold">{currentWord.translation}</span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Check button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={checkAnswer}
            disabled={!input.trim() || isCorrect !== null}
            className={`btn w-full text-lg mt-6 ${
              input.trim() && isCorrect === null
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Проверить
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
