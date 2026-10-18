import React from 'react';
import { cn } from '../../lib/utils';

interface ColumnProps {
  title: string;
  items: string[];
  className?: string;
}

export const Column: React.FC<ColumnProps> = ({ title, items, className }) => {
  return (
    <div className={cn("flex flex-col gap-4 flex-1", className)}>
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-3">
        {title}
      </h3>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <label key={idx} className="flex items-center gap-3 cursor-pointer group text-sm text-[var(--text-accent)]">
            <input 
              type="checkbox" 
              className="accent-[var(--text-accent)] w-4 h-4"
            />
            <span className="group-hover:opacity-100 transition-opacity">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
