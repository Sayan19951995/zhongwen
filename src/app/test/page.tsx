'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getWordsByBlocks, shuffleArray, getWrongAnswers, formatTime } from '@/lib/utils';
import { getSelectedBlocks, updateStats, completeSession } from '@/lib/storage';
import { Word } from '@/types';

interface Question {
  word: Word;
  options: Word[];
}

export default function TestPage() {
  const router = useRouter();
  const [questionsCount, setQuestionsCount] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Timer
  useEffect(() => {
    if (!questionsCount || isComplete || timeLeft <= 0) return;

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
  }, [questionsCount, isComplete, timeLeft]);

  const startTest = (count: number) => {
    setQuestionsCount(count);
    setTimeLeft(count * 15); // 15 seconds per question

    const selectedBlocks = getSelectedBlocks();
    const allWords = getWordsByBlocks(selectedBlocks);
    const gameWords = shuffleArray(allWords).slice(0, count);

    const generatedQuestions: Question[] = gameWords.map((word) => {
      const wrongAnswers = getWrongAnswers(word, allWords, 3);
      const options = shuffleArray([word, ...wrongAnswers]);
      return { word, options };
    });

    setQuestions(generatedQuestions);
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (optionId: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionId);
    const isCorrectAnswer = optionId === currentQuestion.word.id;
    setIsCorrect(isCorrectAnswer);

    if (isCorrectAnswer) {
      setCorrect((prev) => prev + 1);
      updateStats(true, 0);
    } else {
      setWrong((prev) => prev + 1);
      updateStats(false, 0);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setIsComplete(true);
        completeSession();
        const finalCorrect = correct + (isCorrectAnswer ? 1 : 0);
        if (finalCorrect / questions.length >= 0.8) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    }, 800);
  };

  // Question count selection
  if (questionsCount === null) {
    return (
      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/menu')}
            className="text-gray-400 text-sm mb-2"
          >
            ← Меню
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Выберите количество вопросов
          </h1>
        </motion.div>

        <div className="flex-1 flex flex-col gap-4 justify-center">
          {[5, 10, 20].map((count, index) => (
            <motion.button
              key={count}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startTest(count)}
              className="card p-6 text-center border-2 border-gray-200 hover:border-red-500 transition-all"
            >
              <span className="text-3xl font-bold text-gray-800">{count}</span>
              <span className="text-gray-500 block mt-1">вопросов</span>
              <span className="text-sm text-gray-400 mt-2 block">
                {formatTime(count * 15)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Results
  if (isComplete) {
    const total = correct + wrong;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const grade =
      percentage >= 90
        ? 'A'
        : percentage >= 80
        ? 'B'
        : percentage >= 70
        ? 'C'
        : percentage >= 60
        ? 'D'
        : 'F';

    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6"
        >
          <span
            className={`text-8xl font-bold ${
              percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}
          >
            {grade}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-800 mb-2"
        >
          Тест завершён!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold mb-6"
        >
          {percentage}%
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 w-full mb-8"
        >
          <div className="card p-4 text-center bg-green-50">
            <span className="text-3xl font-bold text-green-500">{correct}</span>
            <span className="text-sm text-gray-500 block">Правильно</span>
          </div>
          <div className="card p-4 text-center bg-red-50">
            <span className="text-3xl font-bold text-red-500">{wrong}</span>
            <span className="text-sm text-gray-500 block">Неправильно</span>
          </div>
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
            Пройти ещё раз
          </button>
          <button
            onClick={() => router.push('/menu')}
            className="btn btn-secondary w-full"
          >
            В меню
          </button>
        </motion.div>
      </div>
    );
  }

  // Test in progress
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 text-sm">
          {currentIndex + 1} / {questions.length}
        </span>

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
      <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-red-500"
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
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
            <p className="text-lg pinyin mb-2">{currentQuestion.word.pinyin}</p>
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
                  buttonClass = 'border-red-500 bg-red-50';
                }
              }

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option.id)}
                  disabled={selectedAnswer !== null}
                  className={`card p-4 text-left text-lg no-select transition-all ${buttonClass}`}
                >
                  {option.translation}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
