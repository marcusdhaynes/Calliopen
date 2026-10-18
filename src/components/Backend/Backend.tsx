import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Shield, Circle, Files, Settings, Activity } from 'lucide-react';
import { AccountSidebar } from './AccountSidebar';
import { FileManager } from './FileManager';
import { useFileStore } from '../../hooks/useFileStore';

interface BackendProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { email: string | null; photoURL?: string | null } | null;
  accessToken?: string | null;
  onLogin?: () => Promise<void>;
}

export const Backend: React.FC<BackendProps> = ({ isOpen, onClose, user, accessToken, onLogin }) => {
  const [activeTab, setActiveTab] = useState('files');
  const { items, setItems, rootIds, setRootIds } = useFileStore();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[var(--bg-desk)] flex flex-col text-[var(--text-main)] overflow-hidden pt-8"
    >
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Pane: Account Information Card */}
        <div className="w-96 flex flex-col bg-[var(--bg-page)] rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden shrink-0">
          <AccountSidebar user={user} />
        </div>

        {/* Right Pane: Main Workspace Window */}
        <div className="flex-1 flex flex-col bg-[var(--bg-page)] rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden">
          {/* Tab Header */}
          <div className="h-16 border-b border-[var(--border-color)] flex items-center px-4 justify-between bg-[var(--bg-page)]">
            <div className="flex items-center gap-1">
              {[
                { id: 'files', icon: Files, label: 'Files' },
                { id: 'stats', icon: Activity, label: 'Stats' },
                { id: 'security', icon: Shield, label: 'Security' },
                { id: 'config', icon: Settings, label: 'Settings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-all rounded-md ${
                    activeTab === tab.id 
                      ? 'bg-[var(--bg-desk)] text-[var(--text-main)] border border-[var(--border-color)]' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-desk)]/50'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={onClose}
              className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors px-3 py-1.5 border border-[var(--border-color)] rounded-md bg-[var(--bg-desk)]/30 hover:bg-[var(--bg-desk)]"
            >
              Exit Console
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'files' ? (
                <motion.div
                  key="files"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="h-full"
                >
                  <FileManager 
                    accessToken={accessToken} 
                    items={items} 
                    setItems={setItems}
                    rootIds={rootIds}
                    setRootIds={setRootIds}
                    onLogin={onLogin}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="other"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center p-12 text-center"
                >
                  <div className="max-w-md">
                    <div className="text-[var(--text-muted)] uppercase tracking-[0.3em] text-[10px] mb-4">Module Details</div>
                    <h3 className="text-2xl font-serif mb-4">Section Under Development</h3>
                    <p className="text-[var(--text-accent)] text-sm leading-relaxed italic">
                      "The architect continues to draw, for the building is never truly finished, only released to the world."
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
