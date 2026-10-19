import React from 'react';
import { motion } from 'motion/react';
import { useFileStore } from '../../hooks/useFileStore';
import './BookLayout.css';
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


type PaperSide = 'left' | 'right';

const paperOutline = {
  left: 'M 3 37 C 151 6 334 -1 500 38 L 500 732 C 351 714 170 699 3 709 Z',
  right: 'M 0 38 C 166 -1 349 6 497 37 L 497 709 C 330 699 149 714 0 732 Z',
};

function BookPaper({ side, children, style, visible }: {
  side: PaperSide;
  children?: React.ReactNode;
  style: React.CSSProperties;
  visible: boolean;
}) {
  const uniqueId = React.useId().replace(/:/g, '');
  const paperId = 'calli-paper-' + uniqueId;
  const noiseId = 'calli-noise-' + uniqueId;
  const left = side === 'left';
  const outline = paperOutline[side];
  return (
    <div
      className={'calli-book-page calli-book-page--' + side}
      style={{ ...style, opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      aria-hidden={!visible}
    >
      <div className={'calli-book-sheet-stack calli-book-sheet-stack--' + side} aria-hidden="true"/>
      <svg className="calli-book-page-svg" viewBox="0 0 500 750" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={paperId} x1="0%" y1="0%" x2="100%" y2="0%">
            {left ? (
              <>
                <stop offset="0" stopColor="#c6b393"/>
                <stop offset=".065" stopColor="#f7e9d0"/>
                <stop offset=".32" stopColor="#fff9ea"/>
                <stop offset=".72" stopColor="#faf0dd"/>
                <stop offset=".88" stopColor="#e9dcc4"/>
                <stop offset="1" stopColor="#b7a084"/>
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#b7a084"/>
                <stop offset=".12" stopColor="#e9dcc4"/>
                <stop offset=".28" stopColor="#faf0dd"/>
                <stop offset=".68" stopColor="#fff9ea"/>
                <stop offset=".935" stopColor="#f7e9d0"/>
                <stop offset="1" stopColor="#c6b393"/>
              </>
            )}
          </linearGradient>
          <filter id={noiseId} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="2" seed="11" stitchTiles="stitch"/>
          </filter>
        </defs>
        <path d={outline} fill={'url(#' + paperId + ')'} stroke="#c2aa88" strokeWidth="1.4" vectorEffect="non-scaling-stroke"/>
        <path d={outline} fill="#6b5032" opacity=".055" filter={'url(#' + noiseId + ')'}/>
        {left ? (
          <>
            <path d="M 4 37 C 151 6 334 -1 498 38" fill="none" stroke="#fff8e9" strokeWidth="2" opacity=".85" vectorEffect="non-scaling-stroke"/>
            <path d="M 4 709 Q 258 703 500 732" fill="none" stroke="#bca487" strokeWidth="2" opacity=".64" vectorEffect="non-scaling-stroke"/>
            <path d="M 5 714 Q 253 708 498 738" fill="none" stroke="#fcf0d8" strokeWidth="2" opacity=".8" vectorEffect="non-scaling-stroke"/>
          </>
        ) : (
          <>
            <path d="M 2 38 C 166 -1 349 6 496 37" fill="none" stroke="#fff8e9" strokeWidth="2" opacity=".85" vectorEffect="non-scaling-stroke"/>
            <path d="M 0 732 Q 242 703 496 709" fill="none" stroke="#bca487" strokeWidth="2" opacity=".64" vectorEffect="non-scaling-stroke"/>
            <path d="M 2 738 Q 247 708 495 714" fill="none" stroke="#fcf0d8" strokeWidth="2" opacity=".8" vectorEffect="non-scaling-stroke"/>
          </>
        )}
      </svg>
      <div className="calli-book-paper-edge" aria-hidden="true"/>
      <div className="calli-book-page-content">{children}</div>
    </div>
  );
}

function CoverOrnament() {
  return (
    <svg className="calli-book-ornament" viewBox="0 0 180 180" fill="none" stroke="#d8ba85" strokeWidth="1.2" aria-hidden="true">
      <circle cx="90" cy="90" r="55" opacity=".62"/>
      <circle cx="90" cy="90" r="48" opacity=".42"/>
      <path d="M90 15 L96 33 L90 40 L84 33 Z M90 165 L96 147 L90 140 L84 147 Z M15 90 L33 84 L40 90 L33 96 Z M165 90 L147 84 L140 90 L147 96 Z" fill="#d8ba85" opacity=".52"/>
      <path d="M90 37 C107 64 107 116 90 143 C73 116 73 64 90 37Z" opacity=".7"/>
      <path d="M37 90 C64 73 116 73 143 90 C116 107 64 107 37 90Z" opacity=".7"/>
      <path d="M90 54 L100 80 L126 90 L100 100 L90 126 L80 100 L54 90 L80 80 Z" opacity=".78"/>
      <path d="M90 73 L94 86 L107 90 L94 94 L90 107 L86 94 L73 90 L86 86Z" fill="#d8ba85" opacity=".72"/>
      <path d="M90 3 V13 M90 167 V177 M3 90 H13 M167 90 H177 M30 30 L37 37 M143 143 L150 150 M30 150 L37 143 M143 37 L150 30" opacity=".55"/>
      <path d="M52 28 Q90 8 128 28 M52 152 Q90 172 128 152" opacity=".48"/>
    </svg>
  );
}

function BookCoverFace({ back, title, hardcover }: { back: boolean; title: string; hardcover: boolean }) {
  return (
    <div className={'calli-book-cover-face ' + (!hardcover ? 'calli-book-cover-face--soft ' : '') + (back ? 'calli-book-cover-face--back' : '')}>
      <div className="calli-book-cover-grain" aria-hidden="true"/>
      <div className="calli-book-cover-hinge" aria-hidden="true"/>
      {back ? (
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-[12%] py-[15%] text-center">
          <div className="calli-book-foil text-[10px] uppercase tracking-[.27em]">About This Book</div>
          <div className="w-full flex flex-col items-center gap-5">
            <div className="w-14 h-px bg-[#ddbd84]/70"/>
            <p className="font-serif italic leading-relaxed text-base sm:text-lg text-[#f2e8d7]/85">
              Every story begins with a blank page.
            </p>
            <div className="w-14 h-px bg-[#ddbd84]/70"/>
          </div>
          <div className="flex flex-col items-center gap-4">
            <span className="calli-book-foil text-[10px] uppercase tracking-[.25em]">Calliopen</span>
            <div className="h-9 w-24 rounded-sm bg-[#e9e4d7] p-1 flex items-center justify-around gap-[2px]" aria-label="Decorative barcode placeholder">
              {[2,1,3,1,2,3,1,1,3,2,1,3,1,2,2,1,3,1].map((n,i) =>
                <span key={i} className="bg-[#252525] h-full" style={{width:n}}/>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-[11%] py-[12%] text-center">
          <div className="calli-book-foil text-[10px] uppercase tracking-[.3em]">Calliopen Edition</div>
          <div className="w-full flex flex-col items-center gap-2">
            <CoverOrnament/>
            <div className="h-px w-16 bg-[#ddbd84]/75 my-2"/>
            <h1 className="font-serif font-semibold leading-[1.05] tracking-[.025em] text-[clamp(22px,2.4vw,37px)] break-words max-w-full" style={{textShadow:'0 2px 7px #0009'}}>{title}</h1>
            <div className="h-px w-16 bg-[#ddbd84]/75 my-2"/>
          </div>
          <div className="calli-book-foil text-[10px] uppercase tracking-[.24em]">A Work In Progress</div>
        </div>
      )}
    </div>
  );
}

export const BookLayout: React.FC = () => {
  const { format, selectedLayouts, currentPageIndex, setCurrentPageIndex } = usePage();
  const { items, activeFileId } = useFileStore();
  const ordered = ALL_LAYOUTS.filter(name => selectedLayouts.includes(name));
  const finalSpread = Math.max(0, ordered.length);
  const isFront = currentPageIndex < 0;
  const isBack = currentPageIndex > finalSpread;
  const isInside = !isFront && !isBack;
  const active = ordered[currentPageIndex];
  const hardcover = format.id === 'hardcover';
  const pageWidth = parseFloat(format.width) || 450;
  const ratioParts = format.aspectRatio.split('/').map(Number);
  const ratio = ratioParts.length === 2 ? ratioParts[0] / ratioParts[1] : Number(format.aspectRatio);
  const pageHeight = Math.round(pageWidth / (ratio || 2 / 3));
  const spineWidth = hardcover ? 13 : 9;
  const margin = hardcover ? 20 : 15;
  const top = 16;
  const left = margin;
  const right = left + pageWidth + spineWidth;
  const stageWidth = right + pageWidth + margin;
  const stageHeight = pageHeight + 44;
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measureWidth = () => setViewportWidth(viewport.clientWidth);
    measureWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measureWidth);
      observer.observe(viewport);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, []);
  // Keep the complete two-page book in view at its original size when possible,
  // then scale the entire physical spread as one unit on narrower screens.
  const bookScale = viewportWidth > 0 ? Math.min(1, viewportWidth / stageWidth) : 1;
  const title = (activeFileId && items[activeFileId]?.name?.trim()) || 'Untitled Book';
  const tones = ({
    hardcover: ['#324853', '#1c313c', '#101e27', '#192b32'],
    paperback: ['#765044', '#54352e', '#33211e', '#422720'],
    massmarket: ['#4b6052', '#334b3c', '#1a3027', '#25392f'],
    pocket: ['#62605c', '#45423e', '#292825', '#34302c'],
  } as Record<string,string[]>)[format.id] || ['#324853', '#1c313c', '#101e27', '#192b32'];
  const coverVars = {
    '--cover-light': tones[0],
    '--cover-base': tones[1],
    '--cover-deep': tones[2],
    '--cover-edge': tones[3],
  } as React.CSSProperties;
  const placement = (x: number, y = top, width = pageWidth, height = pageHeight): React.CSSProperties =>
    ({ left: x, top: y, width, height });
  React.useEffect(() => {
    if (currentPageIndex > finalSpread + 1) setCurrentPageIndex(finalSpread + 1);
  }, [currentPageIndex, finalSpread, setCurrentPageIndex]);

  return (
    <div className="flex flex-col items-center w-full gap-3">
      <nav className="flex items-center justify-center gap-3 text-xs text-[var(--text-muted)]" aria-label="Book pages">
        <button type="button" disabled={isFront} onClick={() => setCurrentPageIndex(Math.max(-1, currentPageIndex - 1))}
          className="disabled:opacity-30 px-3 py-1 border border-[var(--border-color)] rounded">Previous</button>
        <span className="text-center min-w-[110px]" aria-live="polite">
          {isFront ? 'Front Cover' : isBack ? 'Back Cover' : active ? displayName(active) : 'Document'}
        </span>
        <button type="button" disabled={isBack} onClick={() => setCurrentPageIndex(Math.min(finalSpread + 1, currentPageIndex + 1))}
          className="disabled:opacity-30 px-3 py-1 border border-[var(--border-color)] rounded">Next</button>
      </nav>
      <div className="calli-book-viewport" ref={viewportRef}>
        <div className="calli-book-fit" style={{width: stageWidth * bookScale, height: stageHeight * bookScale}}>
          <div className="calli-book-stage" style={{
            width: stageWidth, height: stageHeight, ...coverVars,
            transform: `scale(${bookScale})`, transformOrigin: 'top left'
          }}>
          <div className="calli-book-shadow" aria-hidden="true"/>
          <div className={'calli-book-board ' + (!hardcover ? 'calli-book-board--soft' : '')}
            style={{ ...placement(left - 9, top + 5, pageWidth + 12, pageHeight + 9), opacity: isFront ? 0 : 1 }}
            aria-hidden="true"/>
          <div className={'calli-book-board ' + (!hardcover ? 'calli-book-board--soft' : '')}
            style={{ ...placement(right - 3, top + 5, pageWidth + 12, pageHeight + 9), opacity: isBack ? 0 : 1 }}
            aria-hidden="true"/>
          {/* The pages remain behind the covers throughout the flip, rather than
              fading out to reveal the colored cover boards mid-animation. */}
          <BookPaper side="left" visible={isInside || isBack} style={placement(left)}>
            {active ? <LayoutPage name={active}/> : null}
          </BookPaper>
          <BookPaper side="right" visible={isInside || isFront} style={placement(right)}>
            {active ? null : <WritingSurface/>}
          </BookPaper>
          <div className="calli-book-seam" style={{ left: left + pageWidth - 8, top: top + 20, height: pageHeight - 39 }} aria-hidden="true"/>
          {(isFront || isBack) && (
            <div className="calli-book-spine-closed" style={placement(left + pageWidth, top + 2, spineWidth, pageHeight + 4)} aria-hidden="true"/>
          )}
          {/* Front and back covers share the same hinge and page slots as the interior spread. */}
          <motion.div className="calli-book-cover-leaf"
            initial={false}
            animate={{rotateY: isFront ? 0 : -179, opacity: isFront ? 1 : 0}}
            transition={{rotateY:{duration:.8,ease:[.22,.61,.36,1]},opacity:{duration:0,delay:isFront?0:.8}}}
            style={{...placement(right, top + 1, pageWidth, pageHeight + 4), transformOrigin:'left center'}}
            aria-hidden={!isFront}>
            <BookCoverFace title={title} hardcover={hardcover} back={false}/>
            <div className="calli-book-cover-lining" aria-hidden="true"/>
          </motion.div>
          <motion.div className="calli-book-cover-leaf"
            initial={false}
            animate={{rotateY: isBack ? 0 : 179, opacity: isBack ? 1 : 0}}
            transition={{rotateY:{duration:.8,ease:[.22,.61,.36,1]},opacity:{duration:0,delay:isBack?0:.8}}}
            style={{...placement(left, top + 1, pageWidth, pageHeight + 4), transformOrigin:'right center'}}
            aria-hidden={!isBack}>
            <BookCoverFace title={title} hardcover={hardcover} back/>
            <div className="calli-book-cover-lining calli-book-cover-lining--back" aria-hidden="true"/>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
