'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getName, saveName } from '@/lib/storage';
import { TargetIcon, TestIcon, SearchIcon, ChartIcon, UserIcon, WaveIcon } from '@/components/icons';

const menuItems: {
  id: string;
  title: string;
  icon: ReactNode;
  description: string;
  href: string;
  color: string;
}[] = [
  {
    id: 'training',
    title: 'Тренировка',
    icon: <TargetIcon className="text-red-500" size={36} />,
    description: 'Учи слова в игровой форме',
    href: '/blocks?mode=training',
    color: 'bg-red-50 border-red-200',
  },
  {
    id: 'test',
    title: 'Тест',
    icon: <TestIcon className="text-blue-500" size={36} />,
    description: 'Проверь свои знания',
    href: '/blocks?mode=test',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'search',
    title: 'Поиск',
    icon: <SearchIcon className="text-green-500" size={36} />,
    description: 'Найди любой иероглиф',
    href: '/search',
    color: 'bg-green-50 border-green-200',
  },
];

export default function MenuPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedName = getName();
    if (!savedName) {
      router.push('/');
    } else {
      setName(savedName);
    }
  }, [router]);

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-gray-500 text-sm mb-1">Добро пожаловать</p>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          Привет, {name}! <WaveIcon className="text-amber-500" size={28} />
        </h1>
      </div>

      {/* Menu items */}
      <div className="flex-1 flex flex-col gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            className={`card p-5 text-left ${item.color} border-2 no-select`}
          >
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0">{item.icon}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h2>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Stats preview */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/stats')}
          className="text-gray-400 text-sm hover:text-gray-600 transition-colors flex items-center gap-2 justify-center"
        >
          <ChartIcon className="text-gray-400" size={18} /> Статистика
        </button>
      </div>

      {/* Change name option */}
      <div className="mt-6">
        <button
          onClick={() => {
            saveName('');
            router.push('/');
          }}
          className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <UserIcon className="text-gray-400" size={18} />
          <span>Сменить имя</span>
        </button>
      </div>
    </div>
  );
}
