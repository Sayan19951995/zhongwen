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
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('animate');
  const [isAnimating, setIsAnimating] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [showOutline, setShowOutline] = useState(true);
  const [showCharPreview, setShowCharPreview] = useState(true);

  const currentWord = words[currentIndex];
  const characters = currentWord?.character.split('') || [];
  const currentChar = characters[currentCharIndex];

  // Initialize words
  useEffect(() => {
    const selectedBlocks = getSelectedBlocks();
    const allWords = getWordsByBlocks(selectedBlocks);
    setWords(shuffleArray(allWords));
  }, []);

  // Initialize HanziWriter for current character
  const initWriter = useCallback(() => {
    if (!containerRef.current || !currentChar) return;

    // Clear previous
    containerRef.current.innerHTML = '';
    writerRef.current = null;
    setQuizComplete(false);
    setMistakes(0);

    try {
      writerRef.current = HanziWriter.create(containerRef.current, currentChar, {
        width: 240,
        height: 240,
        padding: 10,
        strokeColor: '#1f2937',
        radicalColor: '#1f2937',
        outlineColor: '#d1d5db',
        drawingColor: '#1f2937',
        showOutline: showOutline,
        showCharacter: mode === 'animate',
        delayBetweenStrokes: 300,
        strokeAnimationSpeed: 1.2,
        delayBetweenLoops: 2000,
        drawingWidth: 18,
        showHintAfterMisses: 2,
        highlightOnComplete: true,
        highlightColor: '#22c55e',
        leniency: 1.5,
        charDataLoader: (c: string, onComplete: (data: object) => void) => {
          fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${c}.json`)
            .then(res => res.json())
            .then(onComplete)
            .catch(() => {
              console.log('Character not found:', c);
            });
        },
      });

      if (mode === 'quiz') {
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
  }, [currentChar, mode, showOutline]);

  useEffect(() => {
    if (currentChar) {
      initWriter();
    }
  }, [currentChar, mode, initWriter]);

  // Update outline visibility
  useEffect(() => {
    if (writerRef.current) {
      if (showOutline) {
        writerRef.current.showOutline();
      } else {
        writerRef.current.hideOutline();
      }
    }
  }, [showOutline]);

  const handleAnimate = () => {
    if (!writerRef.current || isAnimating) return;
    setIsAnimating(true);
    writerRef.current.animateCharacter({
      onComplete: () => setIsAnimating(false),
    });
  };

  // Character navigation
  const handleNextChar = () => {
    if (currentCharIndex < characters.length - 1) {
      setCurrentCharIndex(prev => prev + 1);
    }
  };

  const handlePrevChar = () => {
    if (currentCharIndex > 0) {
      setCurrentCharIndex(prev => prev - 1);
    }
  };

  // Word navigation
  const handleNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentCharIndex(0);
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentCharIndex(0);
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
        {/* Show all characters with current highlighted */}
        <div className="flex justify-center gap-1 mt-2">
          {characters.map((char, idx) => (
            <span
              key={idx}
              className={`text-2xl chinese ${
                idx === currentCharIndex
                  ? 'text-red-500 font-bold'
                  : 'text-gray-300'
              }`}
            >
              {showCharPreview ? char : '?'}
            </span>
          ))}
        </div>
        {/* Toggle to hide characters */}
        <button
          onClick={() => setShowCharPreview(!showCharPreview)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600"
        >
          {showCharPreview ? '🙈 Скрыть' : '👁 Показать'}
        </button>
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

      {/* Character canvas with carousel */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Character indicator */}
        {characters.length > 1 && (
          <div className="mb-3 text-gray-500 text-sm font-medium">
            Иероглиф {currentCharIndex + 1} из {characters.length}
          </div>
        )}

        {/* Canvas with navigation arrows */}
        <div className="flex items-center gap-4">
          {/* Left arrow */}
          {characters.length > 1 && (
            <button
              onClick={handlePrevChar}
              disabled={currentCharIndex === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                currentCharIndex === 0
                  ? 'text-gray-200'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              ‹
            </button>
          )}

          {/* Canvas */}
          <div
            ref={containerRef}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm"
            style={{ width: 240, height: 240 }}
          />

          {/* Right arrow */}
          {characters.length > 1 && (
            <button
              onClick={handleNextChar}
              disabled={currentCharIndex === characters.length - 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                currentCharIndex === characters.length - 1
                  ? 'text-gray-200'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              ›
            </button>
          )}
        </div>

        {/* Character dots */}
        {characters.length > 1 && (
          <div className="flex gap-2 mt-3">
            {characters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentCharIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentCharIndex ? 'bg-red-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quiz feedback */}
        {mode === 'quiz' && (
          <div className="mt-4 text-center">
            {quizComplete ? (
              <p className="text-green-500 font-medium">
                Отлично! {mistakes === 0 ? 'Без ошибок!' : `Ошибок: ${mistakes}`}
                {currentCharIndex < characters.length - 1 && (
                  <button
                    onClick={handleNextChar}
                    className="ml-2 text-red-500 underline"
                  >
                    → Следующий
                  </button>
                )}
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
              onClick={() => setShowOutline(!showOutline)}
              className={`btn flex-1 ${showOutline ? 'btn-primary' : 'btn-secondary'}`}
            >
              Контур {showOutline ? 'вкл' : 'выкл'}
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary flex-1"
            >
              Заново
            </button>
          </div>
        )}

        {/* Word navigation */}
        <div className="flex gap-2">
          <button
            onClick={handlePrevWord}
            disabled={currentIndex === 0}
            className={`btn flex-1 ${currentIndex === 0 ? 'bg-gray-100 text-gray-400' : 'btn-secondary'}`}
          >
            ← Слово
          </button>
          <button
            onClick={handleNextWord}
            disabled={currentIndex === words.length - 1}
            className={`btn flex-1 ${currentIndex === words.length - 1 ? 'bg-gray-100 text-gray-400' : 'btn-secondary'}`}
          >
            Слово →
          </button>
        </div>
      </div>
    </div>
  );
}
