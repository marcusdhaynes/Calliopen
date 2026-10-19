import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { usePage } from '../../hooks/usePage';
import { useFileStore } from '../../hooks/useFileStore';
import { getManuscriptText, withManuscriptText } from '../../lib/bookDocument';

const PAGE_DELIMITER = '\f';
const COL_DELIMITER = '|||';

export const WritingSurface: React.FC = () => {
  const { format, fontSizeOverride, currentPageIndex, setCurrentPageIndex } = usePage();
  const { items, activeFileId, updateFileContent } = useFileStore();
  const [focusedSide, setFocusedSide] = useState<'left' | 'right' | 'main' | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const leftRef = useRef<HTMLTextAreaElement>(null);
  const rightRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = activeFileId ? items[activeFileId] : null;
  const content = getManuscriptText(activeFile?.content || '');

  const currentFontSize = fontSizeOverride ? `${fontSizeOverride}px` : format.fontSize;

  // Full redistribution logic
  const performFullRedistribution = () => {
    if (!activeFileId) return;
    const isDual = format.id === 'dual_notebook';
    const currentFullContent = getManuscriptText(items[activeFileId]?.content || '');
    const allPages = currentFullContent.split(PAGE_DELIMITER);
    
    // We need a test element to simulate dimensions
    // We'll use the current textarea ref if available, otherwise we use the dimensions from format
    const targetRef = isDual ? leftRef : textareaRef;
    if (!targetRef.current) return;

    const styles = window.getComputedStyle(targetRef.current);
    const clientHeight = targetRef.current.clientHeight;
    
    const testEl = document.createElement('textarea');
    testEl.style.width = styles.width;
    testEl.style.height = styles.height;
    testEl.style.padding = styles.padding;
    testEl.style.lineHeight = styles.lineHeight;
    testEl.style.fontSize = currentFontSize; // Use the NEW font size
    testEl.style.fontFamily = styles.fontFamily;
    testEl.style.fontWeight = styles.fontWeight;
    testEl.style.letterSpacing = styles.letterSpacing;
    testEl.style.textTransform = styles.textTransform;
    testEl.style.wordBreak = styles.wordBreak;
    testEl.style.whiteSpace = styles.whiteSpace;
    testEl.style.boxSizing = 'border-box';
    testEl.style.overflow = 'hidden';
    testEl.style.visibility = 'hidden';
    testEl.style.position = 'absolute';
    testEl.style.left = '-9999px';
    document.body.appendChild(testEl);

    const newPages: string[] = [];
    
    if (isDual) {
      // Handle dual columns - this is more complex as we have two streams
      // For simplicity, we'll redistribute the entire streams
      let leftStream = allPages.map(p => p.split(COL_DELIMITER)[0] || '').join('');
      let rightStream = allPages.map(p => p.split(COL_DELIMITER)[1] || '').join('');
      
      const leftPages: string[] = [];
      const rightPages: string[] = [];

      const paginateStream = (stream: string, targetArr: string[]) => {
        let remaining = stream;
        while (remaining.length > 0 || targetArr.length === 0) {
          testEl.value = remaining;
          if (testEl.scrollHeight > clientHeight && remaining.length > 0) {
            let low = 0;
            let high = remaining.length;
            let splitAt = remaining.length;
            while (low <= high) {
              const mid = Math.floor((low + high) / 2);
              testEl.value = remaining.substring(0, mid);
              if (testEl.scrollHeight > clientHeight) {
                splitAt = mid;
                high = mid - 1;
              } else {
                low = mid + 1;
              }
            }
            const lastSpace = remaining.lastIndexOf(' ', splitAt);
            const lastNewline = remaining.lastIndexOf('\n', splitAt);
            const wrapPoint = Math.max(lastSpace, lastNewline);
            if (wrapPoint > splitAt * 0.7) splitAt = wrapPoint + 1;
            
            targetArr.push(remaining.substring(0, splitAt));
            remaining = remaining.substring(splitAt);
          } else {
            targetArr.push(remaining);
            remaining = '';
          }
          if (targetArr.length > 200) break; // safety
        }
      };

      paginateStream(leftStream, leftPages);
      paginateStream(rightStream, rightPages);

      const maxLen = Math.max(leftPages.length, rightPages.length);
      for (let i = 0; i < maxLen; i++) {
        newPages.push(`${leftPages[i] || ''}${COL_DELIMITER}${rightPages[i] || ''}`);
      }
    } else {
      let fullStream = allPages.join('');
      let remaining = fullStream;
      while (remaining.length > 0 || newPages.length === 0) {
        testEl.value = remaining;
        if (testEl.scrollHeight > clientHeight && remaining.length > 0) {
          let low = 0;
          let high = remaining.length;
          let splitAt = remaining.length;
          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            testEl.value = remaining.substring(0, mid);
            if (testEl.scrollHeight > clientHeight) {
              splitAt = mid;
              high = mid - 1;
            } else {
              low = mid + 1;
            }
          }
          const lastSpace = remaining.lastIndexOf(' ', splitAt);
          const lastNewline = remaining.lastIndexOf('\n', splitAt);
          const wrapPoint = Math.max(lastSpace, lastNewline);
          if (wrapPoint > splitAt * 0.7) splitAt = wrapPoint + 1;
          
          newPages.push(remaining.substring(0, splitAt));
          remaining = remaining.substring(splitAt);
        } else {
          newPages.push(remaining);
          remaining = '';
        }
        if (newPages.length > 200) break; // safety
      }
    }

    document.body.removeChild(testEl);
    updateFileContent(activeFileId, withManuscriptText(items[activeFileId]?.content || '', newPages.join(PAGE_DELIMITER)));
  };

  // Trigger redistribution on font size change
  const lastFontSize = useRef(currentFontSize);
  useEffect(() => {
    if (lastFontSize.current !== currentFontSize) {
      performFullRedistribution();
      lastFontSize.current = currentFontSize;
    }
  }, [currentFontSize]);

  const pages = content.split(PAGE_DELIMITER);
  if (pages.length <= currentPageIndex) {
    while (pages.length <= currentPageIndex) pages.push(format.id === 'dual_notebook' ? COL_DELIMITER : '');
  }
  const currentPageContent = pages[currentPageIndex] || '';

  // Redistribution logic for typing
  const redistribute = (text: string, currentIdx: number, isDual: boolean, side?: 'left' | 'right') => {
    if (!activeFileId) return;

    // Get the latest content from the store/items to avoid stale closure issues
    const currentFullContent = getManuscriptText(items[activeFileId]?.content || '');
    const allPages = currentFullContent.split(PAGE_DELIMITER);
    
    // Ensure the array is long enough
    while (allPages.length <= currentIdx) {
      allPages.push(isDual ? `${COL_DELIMITER}` : '');
    }

    if (isDual) {
      const [l = '', r = ''] = allPages[currentIdx].split(COL_DELIMITER);
      if (side === 'left') {
        allPages[currentIdx] = `${text}${COL_DELIMITER}${r}`;
      } else {
        allPages[currentIdx] = `${l}${COL_DELIMITER}${text}`;
      }
    } else {
      allPages[currentIdx] = text;
    }

    const targetRef = isDual ? (side === 'left' ? leftRef : rightRef) : textareaRef;
    const el = targetRef.current;
    if (!el) {
      updateFileContent(activeFileId, withManuscriptText(items[activeFileId]?.content || '', allPages.join(PAGE_DELIMITER)));
      return;
    }

    const styles = window.getComputedStyle(el);
    const clientHeight = el.clientHeight;
    
    // Create a robust test element
    const testEl = document.createElement('textarea');
    testEl.style.width = styles.width;
    testEl.style.height = styles.height;
    testEl.style.padding = styles.padding;
    testEl.style.lineHeight = styles.lineHeight;
    testEl.style.fontSize = styles.fontSize;
    testEl.style.fontFamily = styles.fontFamily;
    testEl.style.fontWeight = styles.fontWeight;
    testEl.style.letterSpacing = styles.letterSpacing;
    testEl.style.textTransform = styles.textTransform;
    testEl.style.wordBreak = styles.wordBreak;
    testEl.style.whiteSpace = styles.whiteSpace;
    testEl.style.boxSizing = 'border-box';
    testEl.style.overflow = 'hidden';
    testEl.style.visibility = 'hidden';
    testEl.style.position = 'absolute';
    testEl.style.left = '-9999px';
    document.body.appendChild(testEl);

    // Iteratively handle overflow until it fits
    let currentIterationIdx = currentIdx;
    let textToProcess = text;
    let hasChanges = true;

    while (hasChanges && currentIterationIdx < 100) { // Safety break at 100 pages
      testEl.value = textToProcess;
      
      if (testEl.scrollHeight > clientHeight) {
        // Binary search for split point
        let low = 0;
        let high = textToProcess.length;
        let splitAt = textToProcess.length;

        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          testEl.value = textToProcess.substring(0, mid);
          if (testEl.scrollHeight > clientHeight) {
            splitAt = mid;
            high = mid - 1;
          } else {
            low = mid + 1;
          }
        }

        // Try to find a good wrapping point (space or newline)
        const lastSpace = textToProcess.lastIndexOf(' ', splitAt);
        const lastNewline = textToProcess.lastIndexOf('\n', splitAt);
        const wrapPoint = Math.max(lastSpace, lastNewline);
        
        if (wrapPoint > splitAt * 0.7) {
          splitAt = wrapPoint + 1;
        }

        const kept = textToProcess.substring(0, splitAt);
        const overflow = textToProcess.substring(splitAt);

        // Update current page in array
        if (isDual) {
          const [curL = '', curR = ''] = allPages[currentIterationIdx].split(COL_DELIMITER);
          if (side === 'left') {
            allPages[currentIterationIdx] = `${kept}${COL_DELIMITER}${curR}`;
          } else {
            allPages[currentIterationIdx] = `${curL}${COL_DELIMITER}${kept}`;
          }
        } else {
          allPages[currentIterationIdx] = kept;
        }

        // Prepare next page
        currentIterationIdx++;
        if (allPages.length <= currentIterationIdx) {
          allPages.push(isDual ? `${COL_DELIMITER}` : '');
        }

        if (isDual) {
          const [nextL = '', nextR = ''] = allPages[currentIterationIdx].split(COL_DELIMITER);
          if (side === 'left') {
            textToProcess = overflow + (nextL || '');
            allPages[currentIterationIdx] = `${textToProcess}${COL_DELIMITER}${nextR}`;
          } else {
            textToProcess = overflow + (nextR || '');
            allPages[currentIterationIdx] = `${nextL}${COL_DELIMITER}${textToProcess}`;
          }
        } else {
          textToProcess = overflow + (allPages[currentIterationIdx] || '');
          allPages[currentIterationIdx] = textToProcess;
        }
      } else {
        hasChanges = false;
      }
    }

    document.body.removeChild(testEl);
    updateFileContent(activeFileId, withManuscriptText(items[activeFileId]?.content || '', allPages.join(PAGE_DELIMITER)));
  };

  if (format.id === 'dual_notebook') {
    const [leftContent = '', rightContent = ''] = currentPageContent.split(COL_DELIMITER);

    return (
      <div className="flex w-full h-full overflow-hidden">
        <textarea
          ref={leftRef}
          value={leftContent}
          onChange={(e) => redistribute(e.target.value, currentPageIndex, true, 'left')}
          onFocus={() => setFocusedSide('left')}
          onBlur={() => setFocusedSide(null)}
          className="w-1/2 bg-transparent border-none outline-none resize-none font-serif text-[var(--text-main)] placeholder:text-[var(--text-muted)] opacity-80 focus:opacity-100 selection:bg-main/10 transition-opacity duration-500 ease-in-out overflow-hidden h-full"
          style={{
            lineHeight: format.lineHeight,
            paddingTop: 'calc(var(--top-margin) + 11px)',
            paddingLeft: format.margins.inner,
            paddingRight: '0',
            paddingBottom: format.margins.bottom,
            fontSize: currentFontSize,
            maxHeight: '100%',
          }}
          spellCheck={false}
          placeholder={focusedSide === 'left' ? "" : "Project outline..."}
        />
        <div className="w-[1px] h-full border-l border-transparent pointer-events-none" />
        <textarea
          ref={rightRef}
          value={rightContent}
          onChange={(e) => redistribute(e.target.value, currentPageIndex, true, 'right')}
          onFocus={() => setFocusedSide('right')}
          onBlur={() => setFocusedSide(null)}
          className="w-1/2 bg-transparent border-none outline-none resize-none font-serif text-[var(--text-main)] placeholder:text-[var(--text-muted)] opacity-80 focus:opacity-100 selection:bg-main/10 transition-opacity duration-500 ease-in-out overflow-hidden h-full"
          style={{
            lineHeight: format.lineHeight,
            paddingTop: 'calc(var(--top-margin) + 11px)',
            paddingLeft: '0',
            paddingRight: format.margins.outer,
            paddingBottom: format.margins.bottom,
            fontSize: currentFontSize,
            maxHeight: '100%',
          }}
          spellCheck={false}
          placeholder={focusedSide === 'right' ? "" : "Project outline..."}
        />
      </div>
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={currentPageContent}
      onChange={(e) => redistribute(e.target.value, currentPageIndex, false)}
      onFocus={() => setFocusedSide('main')}
      onBlur={() => setFocusedSide(null)}
      className={`w-full bg-transparent border-none outline-none resize-none font-serif text-[var(--text-main)] placeholder:text-[var(--text-muted)] opacity-80 focus:opacity-100 selection:bg-main/10 transition-opacity duration-500 ease-in-out overflow-hidden h-full`}
      style={{
        lineHeight: format.lineHeight,
        paddingTop: format.id === 'notebook' 
          ? 'calc(var(--top-margin) + 11px)' 
          : format.margins.top,
        paddingLeft: format.margins.inner,
        paddingRight: format.margins.outer,
        paddingBottom: format.margins.bottom,
        fontSize: currentFontSize,
        maxHeight: '100%',
      }}
      spellCheck={false}
      placeholder={focusedSide === 'main' ? "" : "Project outline..."}
    />
  );
};
