import React from 'react';
import { motion } from 'motion/react';
import { usePage } from '../../hooks/usePage';

export const LAYOUT_GROUPS: [string, string[]][] = [
  [
    "Front Matter",
    [
      "Half Title Page",
      "Series Page",
      "Frontispiece",
      "Title Page",
      "Copyright Page",
      "Dedication",
      "Epigraph",
      "Content Warning",
      "Table of Contents",
      "List of Illustrations",
      "Foreword",
      "Preface",
      "Acknowledgments",
      "Introduction",
      "Author's Note",
      "How to Use This Book",
      "Character List",
      "Family Tree",
      "Map"
    ]
  ],
  [
    "Main Matter",
    [
      "Prologue",
      "Part Title Page",
      "Chapter Title Page",
      "Chapter",
      "Interlude",
      "Illustration Page",
      "Epilogue"
    ]
  ],
  [
    "Back Matter",
    [
      "Afterword",
      "Acknowledgments (Back)",
      "Appendix",
      "Glossary",
      "Endnotes",
      "References",
      "Bibliography",
      "Further Reading",
      "Index",
      "Discussion Questions",
      "Study Guide",
      "Answer Key",
      "Bonus Content",
      "Deleted Scenes",
      "Alternate Ending",
      "Sequel Preview",
      "Other Books by the Author",
      "About the Author",
      "Colophon"
    ]
  ]
];

export const DrawerPanel: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const { selectedLayouts, toggleLayout } = usePage();
  return (
    <motion.div initial={{ y: '-100%' }} animate={{ y: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      aria-hidden={!isOpen}
      className="fixed top-8 left-0 right-0 h-80 bg-[var(--bg-header)] border-b border-[var(--border-color)] shadow-[0_10px_30px_rgba(0,0,0,0.05)] px-5 md:px-10 py-5 z-[40] overflow-y-auto">
      <div className="w-max max-w-none mx-auto flex flex-row items-center justify-center gap-6 md:gap-12">
        {LAYOUT_GROUPS.map(([heading, layouts]) => (
          <section key={heading} className="w-[180px] md:w-[220px] shrink-0 flex flex-col items-center">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-3 text-center bg-[var(--bg-header)] py-1">{heading}</h3>
            <div className="flex flex-col gap-2 w-max max-w-full">
              {layouts.map(name => (
                <label key={name} className="flex items-start gap-2 cursor-pointer text-[11px] md:text-xs text-[var(--text-accent)]">
                  <input type="checkbox" checked={selectedLayouts.includes(name)} onChange={() => toggleLayout(name)}
                    className="accent-[var(--text-accent)] mt-0.5 shrink-0" />
                  <span>{name === 'Acknowledgments (Back)' ? 'Acknowledgments' : name}</span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
};
