import React from 'react';
import { usePage } from '../../hooks/usePage';

export const PageFold: React.FC = () => {
  const { isControlsOpen, setIsControlsOpen, format } = usePage();

  if (format.id !== 'notebook' && format.id !== 'dual_notebook') return null;

  return (
    <button
      onClick={() => setIsControlsOpen(!isControlsOpen)}
      className="absolute top-0 right-0 w-12 h-12 z-50 group transition-all duration-300 ease-in-out"
      aria-label="Toggle text controls"
    >
      <div 
        className={`absolute top-0 right-0 w-0 h-0 border-t-[48px] border-l-[48px] border-t-[var(--bg-page)] border-l-transparent drop-shadow-[-2px_2px_2px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out origin-top-right ${
          isControlsOpen ? 'rotate-[-5deg] scale-110' : 'hover:scale-105'
        }`}
      />
      <div 
        className="absolute top-0 right-0 w-0 h-0 border-t-[48px] border-l-[48px] border-t-black/5 dark:border-t-white/5 border-l-transparent"
      />
    </button>
  );
};
