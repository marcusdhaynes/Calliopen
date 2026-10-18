import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileIconProps {
  photoURL?: string | null;
  onClick: () => void;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({ photoURL, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-5 h-5 rounded-full overflow-hidden border border-black/10 dark:border-white/10 hover:shadow-lg transition-all flex items-center justify-center bg-white/50"
    >
      {photoURL ? (
        <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <User className="w-3 h-3 text-[var(--text-muted)]" />
      )}
    </button>
  );
};
