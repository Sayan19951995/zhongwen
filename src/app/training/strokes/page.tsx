'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HanziWriter from 'hanzi-writer';
import { getWordsByBlocks, shuffleArray } from '@/lib/utils';
import { getSelectedBlocks } from '@/lib/storage';
import { Word } from '@/types';

type Mode = 'animate' | 'quiz';

export default function StrokesPage() {
  const router = useRouter();
  const writerRef = useRef<HanziWriter | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('animate');
  const [isAnimating, setIsAnimating] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const currentWord = words[currentIndex];

  // Initialize words
  useEffect(() => {
    const selectedBlocks = getSelectedBlocks();
    const allWords = getWordsByBlocks(selectedBlocks);
    setWords(shuffleArray(allWords));
  }, []);

  // Initialize HanziWriter
  const initWriter = useCallback(() => {
    if (!containerRef.current || !currentWord) return;

    // Clear previous
    containerRef.current.innerHTML = '';
    writerRef.current = null;

    const character = currentWord.character[0]; // Take first character if compound

    try {
      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width: 280,
        height: 280,
        padding: 10,
        strokeColor: '#1f2937',
        radicalColor: '#ef4444',
        outlineColor: '#e5e7eb',
        drawingColor: '#ef4444',
        showOutline: true,
        showCharacter: mode === 'animate',
        delayBetweenStrokes: 300,
        strokeAnimationSpeed: 1,
        delayBetweenLoops: 2000,
        drawingWidth: 20,
        showHintAfterMisses: 3,
        highlightOnComplete: true,
        charDataLoader: (char: string, onComplete: (data: object) => void) => {
          fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
            .then(res => res.json())
            .then(onComplete)
            .catch(() => {
              console.log('Character not found:', char);
            });
        },
      });

      if (mode === 'quiz') {
        setQuizComplete(false);
        setMistakes(0);
        writerRef.current.quiz({
          onMistake: () => {
            setMistakes(prev => prev + 1);
          },
          onComplete: () => {
            setQuizComplete(true);
          },
        });
      }
    } catch (e) {
      console.error('Failed to create HanziWriter:', e);
    }
  }, [currentWord, mode]);

  useEffect(() => {
    if (currentWord) {
      initWriter();
    }
  }, [currentWord, mode, initWriter]);

  const handleAnimate = () => {
    if (!writerRef.current || isAnimating) return;
    setIsAnimating(true);
    writerRef.current.animateCharacter({
      onComplete: () => setIsAnimating(false),
    });
  };

  const handleShowHint = () => {
    if (!writerRef.current) return;
    setShowHint(true);
    writerRef.current.showOutline();
    setTimeout(() => {
      writerRef.current?.hideOutline();
      setShowHint(false);
    }, 1500);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuizComplete(false);
      setMistakes(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setQuizComplete(false);
      setMistakes(0);
    }
  };

  const handleReset = () => {
    initWriter();
  };

  if (words.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
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

      {/* Word info */}
      <div className="text-center mb-4">
        <p className="text-lg pinyin">{currentWord.pinyin}</p>
        <p className="text-gray-600">{currentWord.translation}</p>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setMode('animate')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'animate'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Показать
        </button>
        <button
          onClick={() => setMode('quiz')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'quiz'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Написать
        </button>
      </div>

      {/* Character canvas */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          ref={containerRef}
          className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm"
          style={{ width: 280, height: 280 }}
        />

        {/* Quiz feedback */}
        {mode === 'quiz' && (
          <div className="mt-4 text-center">
            {quizComplete ? (
              <p className="text-green-500 font-medium">
                Отлично! {mistakes === 0 ? 'Без ошибок!' : `Ошибок: ${mistakes}`}
              </p>
            ) : (
              <p className="text-gray-500 text-sm">
                Нарисуйте иероглиф {mistakes > 0 && `(ошибок: ${mistakes})`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3 mt-4">
        {mode === 'animate' ? (
          <button
            onClick={handleAnimate}
            disabled={isAnimating}
            className={`btn w-full ${isAnimating ? 'bg-gray-200 text-gray-400' : 'btn-primary'}`}
          >
            {isAnimating ? 'Показываю...' : 'Показать порядок черт'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleShowHint}
              disabled={showHint}
              className="btn btn-secondary flex-1"
            >
              Подсказка
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary flex-1"
            >
              Заново
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`btn flex-1 ${currentIndex === 0 ? 'bg-gray-100 text-gray-400' : 'btn-secondary'}`}
          >
            ← Назад
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            className={`btn flex-1 ${currentIndex === words.length - 1 ? 'bg-gray-100 text-gray-400' : 'btn-secondary'}`}
          >
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  );
}
