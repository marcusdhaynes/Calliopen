import React from 'react';
import { motion } from 'motion/react';
import { Page } from './Page';
import { WritingSurface } from './WritingSurface';
import { BookLayout } from './BookLayout';
import { TextControls } from './TextControls';
import { usePage } from '../../hooks/usePage';

interface DeskProps {
  isDrawerOpen?: boolean;
}

export const Desk: React.FC<DeskProps> = ({ isDrawerOpen }) => {
  const { format, isControlsOpen } = usePage();

  return (
    <motion.main 
      animate={{ y: isDrawerOpen ? 320 : 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`flex-1 flex flex-col items-center relative overflow-y-auto bg-[var(--bg-desk)] min-h-screen pt-20 ${format.isBook ? "px-3 md:px-6 xl:px-8 pb-10" : "p-10"}`}
    >
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(var(--text-accent) 0.5px, transparent 0.5px)', 
          backgroundSize: '24px 24px' 
        }} 
      />
      
      <div className={`relative z-10 w-full flex justify-center transition-all duration-500 ease-in-out`}>
        <div className={`relative w-full ${format.isBook ? "max-w-none" : "max-w-[900px]"} flex justify-center min-w-0`}>
          {(format.id === 'notebook' || format.id === 'dual_notebook') ? (
            <div className="absolute bottom-full left-0 right-0 z-20">
              <TextControls />
            </div>
          ) : (
            <div className="absolute bottom-full left-0 right-0 z-20 mb-4">
              <TextControls />
            </div>
          )}
          {format.isBook ? (
            <BookLayout />
          ) : (
            <Page>
              <WritingSurface />
            </Page>
          )}
        </div>
      </div>
    </motion.main>
  );
};
