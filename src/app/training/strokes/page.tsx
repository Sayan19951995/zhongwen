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
  const writersRef = useRef<HanziWriter[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('animate');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [showOutline, setShowOutline] = useState(true);

  const currentWord = words[currentIndex];
  const characters = currentWord?.character.split('') || [];

  // Initialize words
  useEffect(() => {
    const selectedBlocks = getSelectedBlocks();
    const allWords = getWordsByBlocks(selectedBlocks);
    setWords(shuffleArray(allWords));
  }, []);

  // Initialize HanziWriters for all characters
  const initWriters = useCallback(() => {
    if (!containerRef.current || !currentWord) return;

    // Clear previous
    containerRef.current.innerHTML = '';
    writersRef.current = [];
    setCurrentCharIndex(0);
    setQuizComplete(false);
    setMistakes(0);

    const chars = currentWord.character.split('');
    const charSize = chars.length === 1 ? 200 : chars.length === 2 ? 140 : 100;

    chars.forEach((char, index) => {
      const charContainer = document.createElement('div');
      charContainer.className = 'inline-block bg-gray-50 rounded-xl border border-gray-200';
      charContainer.style.width = `${charSize}px`;
      charContainer.style.height = `${charSize}px`;
      containerRef.current?.appendChild(charContainer);

      try {
        const writer = HanziWriter.create(charContainer, char, {
          width: charSize,
          height: charSize,
          padding: 8,
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
          leniency: 1.5, // More forgiving stroke matching
          charDataLoader: (c: string, onComplete: (data: object) => void) => {
            fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${c}.json`)
              .then(res => res.json())
              .then(onComplete)
              .catch(() => {
                console.log('Character not found:', c);
              });
          },
        });

        writersRef.current.push(writer);

        // Start quiz for first character
        if (mode === 'quiz' && index === 0) {
          writer.quiz({
            onMistake: () => {
              setMistakes(prev => prev + 1);
            },
            onComplete: () => {
              // Move to next character or complete
              if (index < chars.length - 1) {
                setCurrentCharIndex(prev => {
                  const next = prev + 1;
                  // Start quiz for next character
                  setTimeout(() => {
                    writersRef.current[next]?.quiz({
                      onMistake: () => setMistakes(prev => prev + 1),
                      onComplete: () => {
                        if (next === chars.length - 1) {
                          setQuizComplete(true);
                        }
                      },
                    });
                  }, 300);
                  return next;
                });
              } else {
                setQuizComplete(true);
              }
            },
          });
        }
      } catch (e) {
        console.error('Failed to create HanziWriter:', e);
      }
    });
  }, [currentWord, mode, showOutline]);

  // Start quiz for subsequent characters
  const startNextCharQuiz = useCallback((charIndex: number) => {
    const writer = writersRef.current[charIndex];
    if (!writer || mode !== 'quiz') return;

    writer.quiz({
      onMistake: () => setMistakes(prev => prev + 1),
      onComplete: () => {
        if (charIndex < characters.length - 1) {
          setCurrentCharIndex(charIndex + 1);
          startNextCharQuiz(charIndex + 1);
        } else {
          setQuizComplete(true);
        }
      },
    });
  }, [mode, characters.length]);

  useEffect(() => {
    if (currentWord) {
      initWriters();
    }
  }, [currentWord, mode, initWriters]);

  // Update outline visibility
  useEffect(() => {
    writersRef.current.forEach(writer => {
      if (showOutline) {
        writer.showOutline();
      } else {
        writer.hideOutline();
      }
    });
  }, [showOutline]);

  const handleAnimate = async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Animate characters one by one
    for (let i = 0; i < writersRef.current.length; i++) {
      await new Promise<void>(resolve => {
        writersRef.current[i].animateCharacter({
          onComplete: resolve,
        });
      });
    }

    setIsAnimating(false);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    initWriters();
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

      {/* Character canvases */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          ref={containerRef}
          className="flex gap-2 justify-center items-center"
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
                {characters.length > 1 && `Иероглиф ${currentCharIndex + 1} из ${characters.length}. `}
                Нарисуйте {mistakes > 0 && `(ошибок: ${mistakes})`}
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
            {/* Outline toggle */}
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
