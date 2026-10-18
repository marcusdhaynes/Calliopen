import React from 'react';
import { Code, Home } from 'lucide-react';
import { BrandName } from './BrandName';
import { ThemeToggle } from './ThemeToggle';
import { ProfileIcon } from './ProfileIcon';
import { FormatSelector } from './FormatSelector';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user: any;
  onLogin: () => void;
  onOpenBackend: () => void;
  onCloseBackend?: () => void;
  isBackendOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  theme, 
  onToggleTheme, 
  user, 
  onLogin,
  onOpenBackend,
  onCloseBackend,
  isBackendOpen
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-8 px-4 flex items-center justify-between z-[110] bg-[var(--bg-header)] border-b border-[var(--border-color)]">
      <BrandName />
      <div className="flex items-center gap-4">
        <div className={`transition-opacity duration-300 ${isBackendOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <FormatSelector />
        </div>
        {user && (
          <button
            onClick={isBackendOpen ? onCloseBackend : onOpenBackend}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isBackendOpen ? "Home" : "Backend Settings"}
          >
            {isBackendOpen ? (
              <Home className="w-3 h-3 text-[var(--text-accent)]" />
            ) : (
              <Code className="w-3 h-3 text-[var(--text-muted)]" />
            )}
          </button>
        )}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <ProfileIcon 
          photoURL={user?.photoURL} 
          onClick={user ? (isBackendOpen ? onCloseBackend : onOpenBackend) : onLogin} 
        />
      </div>
    </header>
  );
};
