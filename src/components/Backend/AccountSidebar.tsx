import React, { useState, useMemo } from 'react';
import { User, Shield, Calendar, Activity, Edit2, Check, X } from 'lucide-react';
import { FileItem } from './types';

import { useFileStore } from '../../hooks/useFileStore';

interface AccountSidebarProps {
  user?: { email: string | null; photoURL?: string | null } | null;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({ user }) => {
  const { items } = useFileStore();
  const [orthonym, setOrthonym] = useState('Marcus Haynes');
  const [pseudonym, setPseudonym] = useState('Writer_Architect');
  const [isEditingOrtho, setIsEditingOrtho] = useState(false);
  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const [tempOrtho, setTempOrtho] = useState(orthonym);
  const [tempPseudo, setTempPseudo] = useState(pseudonym);

  const stats = useMemo(() => {
    const allItems = Object.values(items) as FileItem[];
    const files = allItems.filter(item => item.type === 'file');
    const folderCount = allItems.filter(item => item.type === 'folder' && !item.parentId).length;
    
    let words = 0;
    let characters = 0;
    
    files.forEach(file => {
      const content = file.content || '';
      characters += content.length;
      words += content.trim() ? content.trim().split(/\s+/).length : 0;
    });

    return {
      projects: folderCount,
      pages: files.length,
      words: words,
      characters: characters
    };
  }, [items]);

  const joinDate = useMemo(() => {
    // In a real app this would come from the user object
    return 'April 2024';
  }, []);

  const infoRows = [
    { label: 'Information', value: 'Authorized Access' },
    { label: 'Status', value: user ? 'Pro Tier' : 'Guest Tier' },
    { label: 'Join Date', value: joinDate },
  ];

  return (
    <div className="flex-1 p-5 flex flex-col gap-6 overflow-hidden bg-[var(--bg-page)] text-[var(--text-main)]">
      {/* Header Section: Avatar and Names */}
      <div className="flex gap-4 items-start">
        {/* Avatar Top Left */}
        <div className="w-16 h-16 rounded-xl border border-[var(--border-color)] bg-[var(--bg-desk)] flex-shrink-0 overflow-hidden shadow-sm">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-[var(--text-accent)]/10 flex items-center justify-center">
              <User className="w-8 h-8 text-[var(--text-accent)]" />
            </div>
          )}
        </div>

        {/* Names Section */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Orthonym */}
          <div className="group relative">
            {isEditingOrtho ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="bg-[var(--bg-desk)] border border-[var(--border-color)] text-sm font-serif px-2 py-0.5 rounded w-full outline-none focus:border-[var(--text-accent)]"
                  value={tempOrtho}
                  onChange={(e) => setTempOrtho(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { setOrthonym(tempOrtho); setIsEditingOrtho(false); }
                    if (e.key === 'Escape') { setTempOrtho(orthonym); setIsEditingOrtho(false); }
                  }}
                />
                <button onClick={() => { setOrthonym(tempOrtho); setIsEditingOrtho(false); }} className="text-green-500 hover:scale-110"><Check size={14}/></button>
              </div>
            ) : (
              <div 
                onClick={() => { setTempOrtho(orthonym); setIsEditingOrtho(true); }}
                className="flex items-center gap-2 cursor-pointer hover:bg-[var(--bg-desk)]/50 p-0.5 -ml-0.5 rounded transition-colors group"
              >
                <h2 className="text-base font-serif truncate">{orthonym}</h2>
                <Edit2 size={10} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </div>
            )}
          </div>

          {/* Pseudonym */}
          <div className="group relative">
            {isEditingPseudo ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="bg-[var(--bg-desk)] border border-[var(--border-color)] text-[10px] uppercase tracking-widest px-2 py-0.5 rounded w-full outline-none focus:border-[var(--text-accent)]"
                  value={tempPseudo}
                  onChange={(e) => setTempPseudo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { setPseudonym(tempPseudo); setIsEditingPseudo(false); }
                    if (e.key === 'Escape') { setTempPseudo(pseudonym); setIsEditingPseudo(false); }
                  }}
                />
                <button onClick={() => { setPseudonym(tempPseudo); setIsEditingPseudo(false); }} className="text-green-500 hover:scale-110"><Check size={14}/></button>
              </div>
            ) : (
              <div 
                onClick={() => { setTempPseudo(pseudonym); setIsEditingPseudo(true); }}
                className="flex items-center gap-2 cursor-pointer hover:bg-[var(--bg-desk)]/50 p-0.5 -ml-0.5 rounded transition-colors group"
              >
                <p className="text-[var(--text-muted)] text-[9px] uppercase tracking-widest truncate">{pseudonym}</p>
                <Edit2 size={8} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Table Section */}
      <div className="flex flex-col border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-desk)]/10">
        {infoRows.map((row, idx) => (
          <div key={idx} className={`flex items-center justify-between p-2.5 ${idx !== infoRows.length - 1 ? 'border-b border-[var(--border-color)]' : ''}`}>
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-medium">{row.label}</span>
            <span className="text-xs font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Statistics Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
          <Activity size={12} className="opacity-60" />
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold">User Statistics</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Projects', value: stats.projects },
            { label: 'Pages', value: stats.pages },
            { label: 'Words', value: stats.words.toLocaleString() },
            { label: 'Characters', value: stats.characters.toLocaleString() },
          ].map((stat, idx) => (
            <div key={idx} className="bg-[var(--bg-desk)]/30 border border-[var(--border-color)] p-3 rounded-lg flex flex-col gap-1 items-center justify-center text-center">
              <span className="text-[8px] uppercase tracking-[0.15em] text-[var(--text-muted)]">{stat.label}</span>
              <span className="text-sm font-mono font-medium tracking-tight whitespace-nowrap">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Synchronized Status */}
      <div className="mt-auto pt-4 border-t border-[var(--border-color)] border-dashed">
        <div className="flex items-center gap-2 text-[var(--text-muted)] opacity-70">
          <Shield size={10} />
          <p className="text-[9px] italic">Verified across secure network.</p>
        </div>
      </div>
    </div>
  );
};
