import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, FileText, Book, BookOpen, Columns2 } from 'lucide-react';
import { usePage } from '../../hooks/usePage';
import { PAGE_FORMATS, PageFormatType } from '../../lib/formats';

export const FormatSelector: React.FC = () => {
  const { format, setFormat } = usePage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 rounded-full bg-[var(--border-color)]/30 hover:bg-[var(--border-color)]/50 border border-[var(--border-color)]/50 transition-colors text-[9px] font-medium h-5"
      >
        {format.id === 'notebook' ? (
          <FileText size={12} className="text-[var(--text-accent)]" />
        ) : format.id === 'dual_notebook' ? (
          <Columns2 size={12} className="text-[var(--text-accent)]" />
        ) : (
          <BookOpen size={12} className="text-[var(--text-accent)]" />
        )}
        <span className="hidden sm:inline">{format.name.split(' (')[0]}</span>
        <ChevronDown 
          size={10} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--bg-desk)] border border-[var(--border-color)] shadow-xl overflow-hidden z-50 p-1"
            >
              {PAGE_FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFormat(f.id as PageFormatType);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                    format.id === f.id 
                      ? 'bg-[var(--text-accent)]/10 text-[var(--text-accent)]' 
                      : 'hover:bg-[var(--border-color)]/30'
                  }`}
                >
                  {f.id === 'notebook' ? (
                    <FileText size={14} />
                  ) : f.id === 'dual_notebook' ? (
                    <Columns2 size={14} />
                  ) : (
                    <Book size={14} />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium leading-tight">{f.name.split(' (')[0]}</span>
                    <span className="text-[9px] text-[var(--text-muted)] leading-tight">
                      {f.name.split('(')[1]?.replace(')', '') || 'Standard'}
                    </span>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
