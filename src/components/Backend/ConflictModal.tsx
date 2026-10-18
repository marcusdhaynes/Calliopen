import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowRight, FileText, Cloud } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  fileName: string;
  localContent: string;
  driveContent: string;
  onSelect: (choice: 'local' | 'drive') => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  fileName,
  localContent,
  driveContent,
  onSelect
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--border-color)] flex items-center gap-4 bg-[var(--bg-desk)]/30">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-xl font-serif">Content Discrepancy Detected</h3>
              <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mt-1">
                Resolving: <span className="text-[var(--text-main)]">{fileName}</span>
              </p>
            </div>
          </div>

          {/* Content Comparison */}
          <div className="flex-1 overflow-hidden flex divide-x divide-[var(--border-color)]">
            {/* Local Version */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-page)]">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[var(--text-muted)]" />
                  <span className="text-xs font-medium uppercase tracking-widest">Local Version</span>
                </div>
                <button
                  onClick={() => onSelect('local')}
                  className="text-[10px] uppercase tracking-widest bg-[var(--text-accent)] text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Keep Local <ArrowRight size={10} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed bg-[var(--bg-desk)]/10">
                {localContent.split('\n').map((line, i) => {
                  const driveLines = driveContent.split('\n');
                  const isMatch = driveLines.includes(line);
                  return (
                    <div key={i} className={`${!isMatch ? 'bg-amber-500/10 border-l-2 border-amber-500 pl-2 -ml-2' : ''}`}>
                      {line || '\u00A0'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drive Version */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-page)]">
                <div className="flex items-center gap-2">
                  <Cloud size={14} className="text-[var(--text-muted)]" />
                  <span className="text-xs font-medium uppercase tracking-widest">Google Drive Version</span>
                </div>
                <button
                  onClick={() => onSelect('drive')}
                  className="text-[10px] uppercase tracking-widest bg-blue-600 text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Keep Drive <ArrowRight size={10} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed bg-[var(--bg-desk)]/10">
                {driveContent.split('\n').map((line, i) => {
                  const localLines = localContent.split('\n');
                  const isMatch = localLines.includes(line);
                  return (
                    <div key={i} className={`${!isMatch ? 'bg-blue-500/10 border-l-2 border-blue-500 pl-2 -ml-2' : ''}`}>
                      {line || '\u00A0'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-page)] text-center">
            <p className="text-[10px] text-[var(--text-muted)] italic">
              Selecting a version will overwrite the other to maintain synchronization.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
