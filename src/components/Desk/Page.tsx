import React from 'react';
import { Lines } from './Lines';
import { PageFold } from './PageFold';
import { usePage } from '../../hooks/usePage';

interface PageProps {
  children: React.ReactNode;
}

export const Page: React.FC<PageProps> = ({ children }) => {
  const { format, currentPageIndex, setCurrentPageIndex, content } = usePage();
  const pages = content.split('\f');

  const handleNext = () => setCurrentPageIndex(currentPageIndex + 1);
  const handlePrev = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
  };

  const isNotebook = format.id === 'notebook' || format.id === 'dual_notebook';

  return (
    <div className="relative w-full max-w-[900px] aspect-[1/1.4142] mx-auto bg-[var(--bg-page)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm flex flex-col border border-[var(--border-color)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-multiply parchment-texture" />
      <div className="absolute left-[60px] top-0 bottom-0 w-[1px] bg-red-200/50 dark:bg-red-900/20" />
      <div className="absolute right-[60px] top-0 bottom-0 w-[1px] bg-blue-200/50 dark:bg-blue-900/20" />
      
      {format.id === 'dual_notebook' && (
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-300/30 dark:bg-emerald-800/10 -translate-x-1/2" />
      )}

      <PageFold />

      {/* Navigation Folds */}
      {isNotebook && (
        <>
          {currentPageIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute bottom-0 left-0 w-12 h-12 z-50 group hover:scale-105 transition-transform"
              aria-label="Previous page"
            >
              <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[48px] border-r-[48px] border-b-[var(--bg-page)] border-r-transparent drop-shadow-[2px_-2px_2px_rgba(0,0,0,0.1)]" />
              <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[48px] border-r-[48px] border-b-black/5 dark:border-b-white/5 border-r-transparent" />
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="absolute bottom-0 right-0 w-12 h-12 z-50 group hover:scale-105 transition-transform"
            aria-label="Next page"
          >
            <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[48px] border-l-[48px] border-b-[var(--bg-page)] border-l-transparent drop-shadow-[-2px_-2px_2px_rgba(0,0,0,0.1)]" />
            <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[48px] border-l-[48px] border-b-black/5 dark:border-b-white/5 border-l-transparent" />
          </button>
        </>
      )}

      <Lines />
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>

      {/* Page Number */}
      {isNotebook && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-20">
          <span className="text-[20px] leading-none text-gray-500 dark:text-gray-400 font-mono opacity-30 tracking-tight select-none">
            {currentPageIndex + 1}
          </span>
        </div>
      )}
    </div>
  );
};
