'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUserProgress, getName } from '@/lib/storage';
import { UserProgress } from '@/types';
import { BookIcon, CheckIcon, CrossIcon, BoltIcon, FlagIcon } from '@/components/icons';

export default function StatsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(getUserProgress());
  }, []);

  if (!progress) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { stats } = progress;
  const accuracy =
    stats.totalWords > 0
      ? Math.round((stats.correctAnswers / stats.totalWords) * 100)
      : 0;

  const statItems: {
    label: string;
    value: number;
    icon: ReactNode;
    color: string;
  }[] = [
    {
      label: 'Слов изучено',
      value: stats.totalWords,
      icon: <BookIcon className="text-blue-500" size={24} />,
      color: 'bg-blue-50',
    },
    {
      label: 'Правильных ответов',
      value: stats.correctAnswers,
      icon: <CheckIcon className="text-green-500" size={24} />,
      color: 'bg-green-50',
    },
    {
      label: 'Неправильных ответов',
      value: stats.wrongAnswers,
      icon: <CrossIcon className="text-red-500" size={24} />,
      color: 'bg-red-50',
    },
    {
      label: 'Лучшая серия (combo)',
      value: stats.bestCombo,
      icon: <BoltIcon className="text-orange-500" size={24} />,
      color: 'bg-orange-50',
    },
    {
      label: 'Сессий завершено',
      value: stats.sessionsCompleted,
      icon: <FlagIcon className="text-purple-500" size={24} />,
      color: 'bg-purple-50',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => router.push('/menu')}
          className="text-gray-400 text-sm mb-2"
        >
          ← Меню
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Статистика</h1>
        <p className="text-gray-500 text-sm">{getName()}</p>
      </motion.div>

      {/* Accuracy circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex justify-center mb-8"
      >
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="#ef4444"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 440' }}
              animate={{ strokeDasharray: `${(accuracy / 100) * 440} 440` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-gray-800"
            >
              {accuracy}%
            </motion.span>
            <span className="text-sm text-gray-500">точность</span>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="space-y-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`card p-4 ${item.color}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-gray-600">{item.label}</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {item.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reset button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <button
          onClick={() => {
            if (confirm('Вы уверены, что хотите сбросить статистику?')) {
              const name = getName();
              localStorage.clear();
              if (name) {
                localStorage.setItem(
                  'zhongwen_progress',
                  JSON.stringify({ name, selectedBlocks: [], stats: {
                    totalWords: 0,
                    correctAnswers: 0,
                    wrongAnswers: 0,
                    bestCombo: 0,
                    sessionsCompleted: 0,
                  }})
                );
              }
              window.location.reload();
            }
          }}
          className="text-red-400 text-sm w-full text-center hover:text-red-600 transition-colors"
        >
          Сбросить статистику
        </button>
      </motion.div>
    </div>
  );
}
