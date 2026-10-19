import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PageFormatType, PAGE_FORMATS, PageFormat } from '../lib/formats';

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
  const [selectedLayouts, setSelectedLayouts] = useState<string[]>([]);
  const toggleLayout = (name: string) => setSelectedLayouts(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  const [formatType, setFormatType] = useState<PageFormatType>('notebook');
  const [content, setContent] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [fontSizeOverride, setFontSizeOverride] = useState<number | null>(null);

  const format = PAGE_FORMATS.find(f => f.id === formatType) || PAGE_FORMATS[0];

  const setFormat = (type: PageFormatType) => {
    setFormatType(type);
    setCurrentPageIndex(0); // Reset page on format change
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
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};
