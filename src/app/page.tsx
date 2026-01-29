'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getName, saveName } from '@/lib/storage';

export default function HomePage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedName = getName();
    if (savedName) {
      router.push('/menu');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveName(name.trim());
      router.push('/menu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* Logo / Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Китайский язык
          </h1>
          <p className="text-5xl chinese mb-4">中文</p>
          <p className="text-gray-500 text-lg">
            Учительница Мадина Мержанкызы
          </p>
          <p className="text-gray-400 text-sm mt-3">
            Road to Success - Lower Elementary
          </p>
          <p className="text-2xl chinese text-gray-600 mt-1">
            起步篇
          </p>
          <p className="text-gray-400 text-xs mt-6 max-w-[280px] mx-auto leading-relaxed">
            Учись, сдавай тесты — учительница увидит твой прогресс и поможет там, где нужно
          </p>
          <p className="text-gray-300 text-xs mt-2 italic">
            Особенно для Ерасыла 😉
          </p>
        </motion.div>

        {/* Decorative element */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-24 h-1 bg-red-500 mx-auto mb-12 rounded-full"
        />

        {/* Name input form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full space-y-4"
        >
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              className="text-center text-lg"
              autoFocus
            />
          </div>

          <motion.button
            type="submit"
            disabled={!name.trim()}
            whileTap={{ scale: 0.95 }}
            className={`btn w-full text-lg ${
              name.trim()
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Принять
          </motion.button>
        </motion.form>

      </motion.div>
    </div>
  );
}
