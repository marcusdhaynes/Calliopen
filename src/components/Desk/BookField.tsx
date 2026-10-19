import React from 'react';
import { useFileStore } from '../../hooks/useFileStore';
import { getBookText, withBookText } from '../../lib/bookDocument';

interface BookFieldProps {
  fieldKey: string;
  fallback?: string;
  placeholder?: string;
  className?: string;
  fill?: boolean;
  rows?: number;
  ariaLabel: string;
}

/**
 * Editable type, not a contentEditable element: its value stays React-controlled
 * and saved in the same active document used by Calliopen's existing sync.
 */
export const BookField: React.FC<BookFieldProps> = ({
  fieldKey, fallback = '', placeholder = '', className = '',
  fill = false, rows = 1, ariaLabel,
}) => {
  const { activeFileId, items, updateFileContent } = useFileStore();
  const raw = activeFileId ? (items[activeFileId]?.content || '') : '';
  const value = getBookText(raw, fieldKey, fallback);
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    if (fill || !ref.current) return;
    const element = ref.current;
    element.style.height = '0px';
    element.style.height = Math.max(20, element.scrollHeight) + 'px';
  }, [fill, value, className]);

  const change = (next: string) => {
    if (!activeFileId) return;
    // Read the current document before each update to preserve all other fields.
    const current = items[activeFileId]?.content || '';
    updateFileContent(activeFileId, withBookText(current, fieldKey, next));
  };

  return (
    <textarea
      ref={ref}
      aria-label={ariaLabel}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={e => change(e.target.value)}
      readOnly={!activeFileId}
      spellCheck
      className={'calli-book-editable ' + (fill ? 'calli-book-editable--fill ' : '') + className}
    />
  );
};
