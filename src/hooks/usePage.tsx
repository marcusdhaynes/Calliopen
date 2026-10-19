import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PageFormatType, PAGE_FORMATS, PageFormat } from '../lib/formats';
import { useFileStore } from './useFileStore';
import { getBookSettings, withBookSettings, SavedBookSettings } from '../lib/bookDocument';

interface PageContextType {
  format: PageFormat;
  selectedLayouts: string[];
  toggleLayout: (name: string) => void;
  setFormat: (type: PageFormatType) => void;
  content: string;
  setContent: (content: string) => void;
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (open: boolean) => void;
  fontSizeOverride: number | null;
  setFontSizeOverride: (size: number | null) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { items, activeFileId, updateFileContent } = useFileStore();
  const [fallbackLayouts, setFallbackLayouts] = useState<string[]>([]);
  const [fallbackFormat, setFallbackFormat] = useState<PageFormatType>('notebook');
  const [fallbackFont, setFallbackFont] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const raw = activeFileId ? items[activeFileId]?.content || '' : '';
  const saved = getBookSettings(raw);
  const formatType = (PAGE_FORMATS.some(f => f.id === saved.format) ? saved.format : (activeFileId ? 'notebook' : fallbackFormat)) as PageFormatType;
  const selectedLayouts = saved.selectedLayouts ?? (activeFileId ? [] : fallbackLayouts);
  const fontSizeOverride = saved.fontSizeOverride !== undefined ? saved.fontSizeOverride : (activeFileId ? null : fallbackFont);
  const format = PAGE_FORMATS.find(f => f.id === formatType) || PAGE_FORMATS[0];

  const saveSettings = (changes: Partial<SavedBookSettings>) => {
    if (!activeFileId || !items[activeFileId]) return;
    const current = items[activeFileId].content || '';
    updateFileContent(activeFileId, withBookSettings(current, { ...getBookSettings(current), ...changes }));
  };

  const toggleLayout = (name: string) => {
    const next = selectedLayouts.includes(name) ? selectedLayouts.filter(x => x !== name) : [...selectedLayouts, name];
    setFallbackLayouts(next);
    saveSettings({ selectedLayouts: next });
  };

  const setFormat = (type: PageFormatType) => {
    setFallbackFormat(type);
    saveSettings({ format: type });
    setCurrentPageIndex(0);
  };

  const setFontSizeOverride = (size: number | null) => {
    setFallbackFont(size);
    saveSettings({ fontSizeOverride: size });
  };

  return (
    <PageContext.Provider value={{
      format,
      selectedLayouts,
      toggleLayout,
      setFormat,
      content,
      setContent,
      currentPageIndex,
      setCurrentPageIndex,
      isControlsOpen,
      setIsControlsOpen,
      fontSizeOverride,
      setFontSizeOverride
    }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) throw new Error('usePage must be used within a PageProvider');
  return context;
};
