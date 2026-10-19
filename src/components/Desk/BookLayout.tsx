import React from 'react';
import { usePage } from '../../hooks/usePage';
import { WritingSurface } from './WritingSurface';
import { LAYOUT_GROUPS } from '../Drawer/DrawerPanel';

const ALL_LAYOUTS = LAYOUT_GROUPS.flatMap(([, layouts]) => layouts);
const displayName = (name: string) => name === 'Acknowledgments (Back)' ? 'Acknowledgments' : name;

function LayoutPage({ name }: { name: string }) {
  const centered = /^(Half Title Page|Series Page|Frontispiece|Title Page|Dedication|Epigraph|Part Title Page|Chapter Title Page|Illustration Page|Map)$/.test(name);
  const reference = /^(Table of Contents|List of Illustrations|Glossary|Index|References|Bibliography|Endnotes)$/.test(name);
  return <div className={`relative z-10 w-full h-full px-[12%] py-[14%] flex flex-col font-serif text-[var(--text-main)] ${centered ? 'justify-center items-center text-center' : 'items-start'}`}>
    {name === 'Frontispiece' || name === 'Illustration Page' || name === 'Map' ?
      <div className="w-full aspect-[4/3] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] italic text-sm mb-7">Image Placement</div> : null}
    <h1 className={`max-w-full break-words ${centered ? 'text-2xl md:text-3xl tracking-wide' : 'text-xl md:text-2xl'} font-semibold leading-tight`}>{displayName(name)}</h1>
    {name === 'Copyright Page' && <p className="mt-auto text-xs opacity-60">© Copyright · All rights reserved.</p>}
    {reference && <div className="mt-8 w-full border-t border-[var(--border-color)] opacity-50" />}
    {name === 'Family Tree' && <div className="mt-10 w-full flex justify-center"><div className="border border-[var(--border-color)] rounded px-6 py-3 text-sm opacity-50">Family Tree</div></div>}
  </div>;
}

export const BookLayout: React.FC = () => {
  const { format, selectedLayouts, currentPageIndex, setCurrentPageIndex } = usePage();
  const ordered = ALL_LAYOUTS.filter(name => selectedLayouts.includes(name));
  const active = ordered[currentPageIndex];
  const pageStyle = { width: format.width, aspectRatio: format.aspectRatio };
  return <div className="flex flex-col items-center w-full gap-3">
    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
      <button type="button" disabled={currentPageIndex === 0} onClick={() => setCurrentPageIndex(Math.max(0,currentPageIndex-1))} className="disabled:opacity-30 px-3 py-1 border border-[var(--border-color)] rounded">Previous</button>
      <span>{active ? displayName(active) : 'Document'} · Spread {currentPageIndex + 1}</span>
      <button type="button" onClick={() => setCurrentPageIndex(currentPageIndex+1)} className="px-3 py-1 border border-[var(--border-color)] rounded">Next</button>
    </div>
    <div className="flex flex-col md:flex-row items-center justify-center gap-0 p-4 w-full">
      <div className="relative bg-[var(--bg-page)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-l-sm border border-[var(--border-color)] overflow-hidden" style={pageStyle}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.2] mix-blend-multiply book-fiber" />
        <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-black/20 via-black/10 to-transparent pointer-events-none" />
        {active ? <LayoutPage name={active}/> : <div className="p-10 opacity-30 select-none w-full"><div className="h-4 w-3/4 bg-current/20 rounded mb-4"/><div className="h-4 w-full bg-current/20 rounded mb-4"/></div>}
      </div>
      <div className="hidden md:block w-3 self-stretch z-20 relative bg-[var(--border-color)]/20 shadow-xl border-x border-black/5"/>
      <div className="relative bg-[var(--bg-page)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-r-sm border border-[var(--border-color)] overflow-y-auto" style={pageStyle}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.2] mix-blend-multiply book-fiber" />
        <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-black/20 via-black/10 to-transparent pointer-events-none" />
        <div className="relative z-10 w-full h-full flex flex-col">{active ? null : <WritingSurface />}</div>
      </div>
    </div>
  </div>;
};
