'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { MatchingIcon, CardsIcon, QuizIcon, KeyboardIcon } from '@/components/icons';

const trainingModes: {
  id: string;
  title: string;
  icon: ReactNode;
  description: string;
  color: string;
}[] = [
  {
    id: 'matching',
    title: 'Matching Pairs',
    icon: <MatchingIcon className="text-purple-500" size={36} />,
    description: 'Соедини слово с переводом',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    icon: <CardsIcon className="text-blue-500" size={36} />,
    description: 'Переворачивай карточки',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    icon: <QuizIcon className="text-green-500" size={36} />,
    description: 'Выбери правильный ответ',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 'typing',
    title: 'Typing',
    icon: <KeyboardIcon className="text-orange-500" size={36} />,
    description: 'Напиши перевод',
    color: 'bg-orange-50 border-orange-200',
  },
];

export default function TrainingPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/menu')}
          className="text-gray-400 text-sm mb-2 flex items-center gap-1"
        >
          ← Меню
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Выберите режим тренировки
        </h1>
      </div>

      {/* Training modes */}
      <div className="flex-1 flex flex-col gap-4">
        {trainingModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => router.push(`/training/${mode.id}`)}
            className={`card p-5 text-left ${mode.color} border-2 no-select`}
          >
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0">{mode.icon}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {mode.title}
                </h2>
                <p className="text-gray-500 text-sm">{mode.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
