import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {theme === 'light' ? (
          <Sun className="w-3 h-3 text-[var(--text-main)]" />
        ) : (
          <Moon className="w-3 h-3 text-[var(--text-main)]" />
        )}
      </motion.div>
    </button>
  );
};
