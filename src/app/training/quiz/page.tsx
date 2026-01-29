'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getWordsByBlocks, shuffleArray, getWrongAnswers } from '@/lib/utils';
import { getSelectedBlocks, updateStats, completeSession } from '@/lib/storage';
import { Word } from '@/types';

const QUESTIONS_COUNT = 10;

interface Question {
  word: Word;
  options: Word[];
}

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);

  useEffect(() => {
    const selectedBlocks = getSelectedBlocks();
    const allWords = getWordsByBlocks(selectedBlocks);
    const gameWords = shuffleArray(allWords).slice(0, QUESTIONS_COUNT);

    const generatedQuestions: Question[] = gameWords.map((word) => {
      const wrongAnswers = getWrongAnswers(word, allWords, 3);
      const options = shuffleArray([word, ...wrongAnswers]);
      return { word, options };
    });

    setQuestions(generatedQuestions);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (optionId: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionId);
    const correct = optionId === currentQuestion.word.id;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 10 + combo * 2);
      setCombo((prev) => prev + 1);
      updateStats(true, combo + 1);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else {
      setCombo(0);
      updateStats(false, 0);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setIsComplete(true);
        completeSession();
        if (score >= QUESTIONS_COUNT * 8) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    }, 1000);
  };

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / (QUESTIONS_COUNT * 10)) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-8"
        >
          <span className="text-8xl">{percentage >= 80 ? '🏆' : '👍'}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mb-4"
        >
          {percentage >= 80 ? 'Превосходно!' : 'Хорошо!'}
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
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col"
        >
          {/* Word */}
          <div className="text-center mb-8">
            {showPinyin && <p className="text-lg pinyin mb-2">{currentQuestion.word.pinyin}</p>}
            <p className="text-5xl chinese">{currentQuestion.word.character}</p>
          </div>

          {/* Options */}
          <div className="flex-1 flex flex-col gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrectOption = option.id === currentQuestion.word.id;
              const showResult = selectedAnswer !== null;

              let buttonClass = 'border-gray-200';
              if (showResult) {
                if (isCorrectOption) {
                  buttonClass = 'border-green-500 bg-green-50';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'border-red-500 bg-red-50 animate-shake';
                }
              } else if (isSelected) {
                buttonClass = 'border-red-500 bg-red-50';
              }

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option.id)}
                  disabled={selectedAnswer !== null}
                  className={`card p-4 text-left text-lg no-select transition-all ${buttonClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.translation}</span>
                    {showResult && isCorrectOption && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                      >
                        ✓
                      </motion.span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-red-500"
                      >
                        ✗
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
