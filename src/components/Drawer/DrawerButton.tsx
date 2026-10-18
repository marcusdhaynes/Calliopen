import React from 'react';
import { motion } from 'motion/react';

interface DrawerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  isBackendOpen?: boolean;
}

export const DrawerButton: React.FC<DrawerButtonProps> = ({ isOpen, onClick, isBackendOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed top-6 left-0 right-0 mx-auto w-4 h-4 rounded-full bg-[var(--border-color)] text-[var(--text-main)] flex items-center justify-center shadow-sm hover:scale-110 transition-all z-[120] ${isBackendOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100'}`}
      aria-label="Toggle Drawer"
    >
      <motion.div
        animate={{ rotate: isOpen ? 0 : 180 }}
        className="flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </motion.div>
    </button>
  );
};
