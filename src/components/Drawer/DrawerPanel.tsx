import React from 'react';
import { motion } from 'motion/react';
import { Column } from './Column';

interface DrawerPanelProps {
  isOpen: boolean;
}

export const DrawerPanel: React.FC<DrawerPanelProps> = ({ isOpen }) => {
  const col1 = ["Parchment Texture", "Vertical Rhythm", "Bleed Marks", "Margins"];
  const col2 = ["Auto-Save", "Cloud Sync", "Word Count", "Focus Mode"];
  const col3 = ["Export PDF", "Ashen Tint", "Pearly Luster", "Raw Fiber"];

  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: isOpen ? 0 : "-100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-8 left-0 right-0 h-48 bg-[var(--bg-header)] border-b border-[var(--border-color)] shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex px-10 py-6 gap-10 z-[40]"
    >
      <div className="max-w-6xl mx-auto flex w-full gap-10">
        <Column title="Document Settings" items={col1} />
        <Column className="border-l border-[var(--border-color)] pl-10" title="Typography" items={col2} />
        <Column className="border-l border-[var(--border-color)] pl-10" title="Interface" items={col3} />
      </div>
    </motion.div>
  );
};
