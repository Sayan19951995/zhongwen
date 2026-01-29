'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { searchWords, getAllBlocks } from '@/lib/utils';
import { Word } from '@/types';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  const allBlocks = getAllBlocks();

  const results = useMemo(() => {
    if (query.length < 1) return [];
    return searchWords(query);
  }, [query]);

  const getBlockName = (wordId: number): string => {
    for (const block of allBlocks) {
      if (block.words.some((w) => w.id === wordId)) {
        return block.name;
      }
    }
    return '';
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <button
          onClick={() => router.push('/menu')}
          className="text-gray-400 text-sm mb-2"
        >
          ← Меню
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Поиск</h1>
        <p className="text-xs text-gray-400 mt-1">Только по словам из учебника 起步篇 (Начальный уровень)</p>
      </motion.div>

      {/* Search input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative mb-4"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Иероглиф, пиньинь или перевод..."
          style={{ paddingLeft: '2.5rem' }}
          autoFocus
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
          🔍
        </span>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </motion.div>

      {/* Results count */}
      {query && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 mb-4"
        >
          {results.length > 0 ? `Найдено: ${results.length}` : 'Ничего не найдено'}
        </motion.p>
      )}

      {/* Results list */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <AnimatePresence>
          {results.map((word, index) => (
            <motion.button
              key={word.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelectedWord(word)}
              className="card p-4 w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-2xl chinese">{word.character}</p>
                    <p className="text-xs pinyin">{word.pinyin}</p>
                  </div>
                  <div>
                    <p className="font-medium">{word.translation}</p>
                    <p className="text-xs text-gray-400">{getBlockName(word.id)}</p>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center text-gray-400"
        >
          <span className="text-6xl mb-4">🔍</span>
          <p>Введите иероглиф, пиньинь или перевод</p>
          <p className="text-sm mt-2">для поиска среди 200+ слов</p>
        </motion.div>
      )}

      {/* Word detail modal */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWord(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="text-center">
                <p className="text-lg pinyin mb-2">{selectedWord.pinyin}</p>
                <p className="text-6xl chinese mb-4">{selectedWord.character}</p>
                <p className="text-2xl font-medium text-gray-800 mb-2">
                  {selectedWord.translation}
                </p>
                <p className="text-sm text-gray-400">
                  {getBlockName(selectedWord.id)}
                </p>
              </div>

              <button
                onClick={() => setSelectedWord(null)}
                className="btn btn-secondary w-full mt-6"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
