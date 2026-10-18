import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileText, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Plus, 
  FilePlus, 
  FolderPlus 
} from 'lucide-react';
import { FileItem } from './types';
import { useFileStore } from '../../hooks/useFileStore';

interface FileTreeItemProps {
  id: string;
  items: Record<string, FileItem>;
  depth?: number;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onCreateChild: (type: 'file' | 'folder', parentId: string) => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ 
  id, 
  items, 
  depth = 0,
  onRename,
  onDelete,
  onCreateChild
}) => {
  const { setActiveFileId, activeFileId } = useFileStore();
  const item = items[id];
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  // Use a timer to distinguish between single and double clicks
  const clickTimer = React.useRef<NodeJS.Timeout | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id });

  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isOverFolder = isOver && item.type === 'folder';

  if (!item) return null;

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      onRename(id, editName);
      setIsEditing(false);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (clickTimer.current) {
      // Double click detected
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      if (item.type === 'file') {
        setActiveFileId(id);
      } else {
        setIsExpanded(!isExpanded);
      }
    } else {
      // Single click potential
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        setIsEditing(true);
      }, 250);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }

    if (item.type === 'file') {
      setActiveFileId(id);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const displayName = item.name.replace(/\.txt$/, '');

  return (
    <div ref={setNodeRef} style={style}>
      <div 
        className={`group flex items-center gap-2 py-1.5 px-2 rounded-md transition-all cursor-pointer relative ${
          activeFileId === id ? 'bg-[var(--text-accent)]/10' : 'hover:bg-[var(--bg-desk)]/50'
        } ${isOverFolder ? 'bg-[var(--text-accent)]/20 ring-1 ring-[var(--text-accent)]/30 scale-[1.02]' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        {...attributes}
        {...listeners}
      >
        {/* Expand Icon */}
        <div className="w-4 h-4 flex items-center justify-center" onPointerDown={(e) => e.stopPropagation()}>
          {item.type === 'folder' && item.children && item.children.length > 0 ? (
            <div onClick={toggleExpand} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          ) : item.type === 'folder' ? (
             <div className="w-1 h-1 rounded-full bg-[var(--border-color)] opacity-40 ml-1" />
          ) : null}
        </div>

        {/* Type Icon */}
        <div className={item.type === 'folder' ? 'text-blue-400' : 'text-green-400'} onPointerDown={(e) => e.stopPropagation()}>
          {item.type === 'folder' ? <Folder size={16} fill="currentColor" fillOpacity={0.1} /> : <FileText size={16} />}
        </div>

        {/* Name / Input */}
        <div className="flex-1 min-w-0 pointer-events-none">
          {isEditing ? (
            <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} className="pointer-events-auto">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  if (editName.trim()) onRename(id, editName);
                  setIsEditing(false);
                }}
                className="w-full bg-transparent border-b border-[var(--text-accent)] text-sm outline-none font-medium"
              />
            </form>
          ) : (
            <div 
              className={`text-sm font-medium truncate w-fit pointer-events-auto ${activeFileId === id ? 'text-[var(--text-accent)]' : 'text-[var(--text-main)]/90'}`}
              onClick={handleItemClick}
              onDoubleClick={handleDoubleClick}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {displayName}
            </div>
          )}
        </div>

        {/* Actions */}
        <div 
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {item.type === 'folder' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onCreateChild('file', id); }}
              className="p-1 hover:bg-[var(--bg-page)] rounded text-[var(--text-muted)]"
              title="Add File"
            >
              <FilePlus size={12} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="p-1 hover:bg-[var(--bg-page)] rounded text-[var(--text-muted)]"
            title="Rename"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
            className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded text-[var(--text-muted)]"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Children */}
      {item.type === 'folder' && isExpanded && item.children && item.children.length > 0 && (
        <SortableContext items={item.children} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col">
            {item.children.map((childId) => (
              <FileTreeItem 
                key={childId} 
                id={childId} 
                items={items} 
                depth={depth + 1}
                onRename={onRename}
                onDelete={onDelete}
                onCreateChild={onCreateChild}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
};
