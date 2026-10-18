import React, { useState, useEffect } from 'react';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  ChevronDown,
  ChevronUp,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon
} from 'lucide-react';
import { usePage } from '../../hooks/usePage';

export const TextControls: React.FC = () => {
  const { format, fontSizeOverride, setFontSizeOverride, isControlsOpen } = usePage();
  const currentFontSize = fontSizeOverride || parseInt(format.fontSize);
  const [inputValue, setInputValue] = useState(currentFontSize.toString());

  useEffect(() => {
    setInputValue(currentFontSize.toString());
  }, [currentFontSize]);

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.max(8, Math.min(72, newSize));
    setFontSizeOverride(size);
  };

  const handleInputBlur = () => {
    const size = parseInt(inputValue);
    if (!isNaN(size)) {
      handleFontSizeChange(size);
    } else {
      setInputValue(currentFontSize.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  if (!isControlsOpen) return null;

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-t-lg rounded-b-none shadow-sm p-2 flex flex-wrap items-center gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Font Selection Placeholder */}
      <div className="flex items-center gap-2 px-2 py-1 hover:bg-[var(--bg-desk)]/50 rounded cursor-default border border-transparent hover:border-[var(--border-color)] transition-all">
        <Type size={16} className="text-[var(--text-muted)]" />
        <span className="text-sm font-medium">Serif</span>
        <ChevronDown size={14} className="text-[var(--text-muted)]" />
      </div>

      <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1" />

      {/* Font Size Controls */}
      <div className="flex items-center">
        <button 
          onClick={() => handleFontSizeChange(currentFontSize - 1)}
          className="p-1 hover:bg-[var(--bg-desk)]/50 rounded text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <ChevronDown size={16} />
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-10 text-center bg-transparent border-none outline-none text-sm font-medium"
        />
        <button 
          onClick={() => handleFontSizeChange(currentFontSize + 1)}
          className="p-1 hover:bg-[var(--bg-desk)]/50 rounded text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <ChevronUp size={16} />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1" />

      {/* Formatting Hooks (Visual Only) */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={<Bold size={16} />} active />
        <ToolbarButton icon={<Italic size={16} />} />
        <ToolbarButton icon={<Underline size={16} />} />
      </div>

      <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1" />

      {/* Alignment */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={<AlignLeft size={16} />} />
        <ToolbarButton icon={<AlignCenter size={16} />} />
        <ToolbarButton icon={<AlignRight size={16} />} />
        <ToolbarButton icon={<AlignJustify size={16} />} />
      </div>

      <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1" />

      {/* Others */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={<List size={16} />} />
        <ToolbarButton icon={<ListOrdered size={16} />} />
        <ToolbarButton icon={<Quote size={16} />} />
      </div>

      <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1" />

      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={<LinkIcon size={16} />} />
        <ToolbarButton icon={<ImageIcon size={16} />} />
        <ToolbarButton icon={<TableIcon size={16} />} />
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: React.ReactNode; active?: boolean }> = ({ icon, active }) => (
  <button 
    className={`p-1.5 rounded transition-all ${
      active 
        ? 'bg-[var(--text-accent)]/10 text-[var(--text-accent)]' 
        : 'hover:bg-[var(--bg-desk)]/50 text-[var(--text-muted)] hover:text-[var(--text-main)]'
    }`}
  >
    {icon}
  </button>
);
