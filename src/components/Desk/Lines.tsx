import React from 'react';

export const Lines: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none writing-lines opacity-100" 
      style={{ 
        top: 'var(--top-margin)',
        backgroundPosition: '0 var(--baseline-offset)'
      }} 
    />
  );
};
