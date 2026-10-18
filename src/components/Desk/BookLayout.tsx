import React from 'react';
import { usePage } from '../../hooks/usePage';
import { WritingSurface } from './WritingSurface';

export const BookLayout: React.FC = () => {
  const { format } = usePage();

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-0 p-4 w-full">
      {/* Left Page */}
      <div 
        className="hidden md:flex relative bg-[var(--bg-page)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-l-sm border-t border-l border-[var(--border-color)] overflow-hidden"
        style={{
          width: format.width,
          aspectRatio: format.aspectRatio,
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.2] mix-blend-multiply book-fiber" />
        {/* Shadow for the fold */}
        <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-black/20 via-black/10 to-transparent pointer-events-none" />
        
        <div className="p-10 opacity-30 select-none w-full">
          <div className="h-4 w-3/4 bg-current/20 rounded mb-4" />
          <div className="h-4 w-full bg-current/20 rounded mb-4" />
          <div className="h-4 w-5/6 bg-current/20 rounded mb-4" />
          <div className="h-4 w-full bg-current/20 rounded mb-4" />
          <div className="h-4 w-4/6 bg-current/20 rounded mb-4" />
        </div>
      </div>

      {/* Spine / Gutter */}
      <div className="hidden md:block w-3 h-full z-20 relative bg-[var(--border-color)]/20 shadow-xl overflow-hidden border-x border-black/5">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-white/5 to-black/30" />
        {/* Center fold line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-black/20 dark:bg-white/10 -translate-x-1/2" />
      </div>

      {/* Right Page (Active) */}
      <div 
        className="relative bg-[var(--bg-page)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-r-sm border-t border-r border-[var(--border-color)] overflow-y-auto"
        style={{
          width: format.width,
          aspectRatio: format.aspectRatio,
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.2] mix-blend-multiply book-fiber" />
        {/* Shadow for the gutter */}
        <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-black/20 via-black/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full h-full flex flex-col">
          <WritingSurface />
        </div>
      </div>
    </div>
  );
};
