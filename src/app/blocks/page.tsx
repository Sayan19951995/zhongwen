'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getAllBlocks } from '@/lib/utils';
import { saveSelectedBlocks } from '@/lib/storage';
import { Block } from '@/types';

function BlocksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'training';

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const allBlocks = getAllBlocks();
    setBlocks(allBlocks);
    setSelectedIds(allBlocks.map((b) => b.id));
  }, []);

  const toggleBlock = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === blocks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(blocks.map((b) => b.id));
    }
  };

  const handleStart = () => {
    if (selectedIds.length === 0) return;

    saveSelectedBlocks(selectedIds);

    if (mode === 'test') {
      router.push('/test');
    } else {
      router.push('/training');
    }
  };

  const allSelected = selectedIds.length === blocks.length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <button
          onClick={() => router.back()}
          className="text-gray-400 text-sm mb-2 flex items-center gap-1"
        >
          ← Назад
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {mode === 'test' ? 'Выберите блоки для теста' : 'Выберите блоки'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {selectedIds.length} из {blocks.length} блоков выбрано
        </p>
      </motion.div>

      {/* Start button - top */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={selectedIds.length === 0}
          className={`btn w-full text-lg ${
            selectedIds.length > 0
              ? 'btn-primary'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {mode === 'test' ? 'Начать тест' : 'Начать тренировку'}
        </motion.button>
      </motion.div>

      {/* Select All */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={toggleAll}
        className={`card p-4 mb-4 flex items-center gap-3 border-2 ${
          allSelected ? 'border-red-500 bg-red-50' : 'border-gray-200'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            allSelected
              ? 'bg-red-500 border-red-500'
              : 'border-gray-300'
          }`}
        >
          {allSelected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-white text-sm"
            >
              ✓
            </motion.span>
          )}
        </div>
        <span className="font-medium">Все блоки</span>
      </motion.button>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-4" />

      {/* Block list */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {blocks.map((block, index) => {
          const isSelected = selectedIds.includes(block.id);
          return (
            <motion.button
              key={block.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => toggleBlock(block.id)}
              className={`card p-4 w-full text-left flex items-center gap-3 border-2 transition-all ${
                isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? 'bg-red-500 border-red-500'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white text-sm"
                  >
                    ✓
                  </motion.span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{block.id}.</span>
                  <span className="font-medium truncate">{block.name}</span>
                </div>
                <p className="text-gray-400 text-sm chinese truncate">
                  {block.chineseName}
                </p>
              </div>
              <span className="text-gray-400 text-xs flex-shrink-0">
                {block.words.length} слов
              </span>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}

export default function BlocksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <BlocksContent />
    </Suspense>
  );
}
