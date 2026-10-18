import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { FolderPlus, FilePlus, RefreshCw, AlertTriangle, Folder, FileText } from 'lucide-react';
import { FileItem } from './types';
import { FileTreeItem } from './FileTreeItem';
import { useDriveSync } from '../../hooks/useDriveSync';
import { useFileStore } from '../../hooks/useFileStore';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { useAuth } from '../../hooks/useAuth';
import { ConflictModal } from './ConflictModal';

interface FileManagerProps {
  accessToken?: string | null;
  onLogin?: () => Promise<void>;
}

interface Conflict {
  id: string;
  name: string;
  localContent: string;
  driveContent: string;
}

export const FileManager: React.FC<FileManagerProps> = ({ 
  accessToken, 
  onLogin
}) => {
  const { user, clearAccessToken } = useAuth();
  const { items, setItems, rootIds, setRootIds } = useFileStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const originalParentId = useRef<string | null>(null);

  const { findOrCreateFolder, syncFile, updateItemParent, deleteItem, listItems } = useGoogleDrive(accessToken || null);
  const { isSyncing, error: syncError, calliopenId, reSync, conflicts, setConflicts } = useDriveSync(accessToken || null, clearAccessToken);

  useEffect(() => {
    if (conflicts.length > 0 && !conflict) {
      setConflict(conflicts[0]);
    }
  }, [conflicts, conflict]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    originalParentId.current = items[id]?.parentId || null;
  };

  const syncToDrive = async (id: string, currentItems: Record<string, FileItem>, currentCalliopenId: string | null) => {
    if (!accessToken || !currentCalliopenId) return currentItems;
    
    const item = currentItems[id];
    let updatedRecord = { ...currentItems };
    
    try {
      const parentId = item.parentId;
      const parentDriveId = parentId ? updatedRecord[parentId]?.driveId : currentCalliopenId;
      
      if (!parentDriveId) return currentItems;

      // Map local name to Drive name (with .txt for files)
      const driveName = item.type === 'file' ? `${item.name}.txt` : item.name;

      // Deduplication check: if no driveId, check if name already exists in parent on Drive
      if (!item.driveId) {
        const driveItems = await listItems(parentDriveId);
        const match = driveItems.find(di => 
          di.name === driveName && 
          di.mimeType === (item.type === 'folder' ? 'application/vnd.google-apps.folder' : 'text/plain')
        );
        
        if (match) {
          const newItem = { ...item, driveId: match.id };
          updatedRecord[id] = newItem;
          setItems(prev => ({ ...prev, [id]: newItem }));
          return updatedRecord;
        }
      }

      if (item.type === 'file') {
        const data = await syncFile(driveName, item.content || '', parentDriveId, item.driveId);
        if (data.id && !item.driveId) {
          const newItem = { ...item, driveId: data.id };
          updatedRecord[id] = newItem;
          setItems(prev => ({ ...prev, [id]: newItem }));
        }
      } else {
        const folderId = await findOrCreateFolder(item.name, parentDriveId);
        
        if (folderId && !item.driveId) {
          const newItem = { ...item, driveId: folderId };
          updatedRecord[id] = newItem;
          setItems(prev => ({ ...prev, [id]: newItem }));
        }
      }
    } catch (error) {
      console.error('Drive sync error:', error);
    }
    return updatedRecord;
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeItem = items[activeId];
    const overItem = items[overId];

    if (!activeItem || !overItem) return;

    // Determine the target container/parent
    let newParentId: string | null = null;
    if (overItem.type === 'folder') {
      newParentId = overId;
    } else {
      newParentId = overItem.parentId;
    }

    if (activeItem.parentId !== newParentId) {
      moveItem(activeId, newParentId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as string;
    setActiveId(null);
    
    const finalItem = items[activeId];
    if (finalItem && calliopenId) {
      if (finalItem.driveId) {
        const finalParentId = finalItem.parentId;
        if (finalParentId !== originalParentId.current) {
          const newParentDriveId = finalParentId ? items[finalParentId].driveId : calliopenId;
          const oldParentDriveId = originalParentId.current ? items[originalParentId.current].driveId : calliopenId;
          
          if (newParentDriveId && oldParentDriveId && newParentDriveId !== oldParentDriveId) {
            updateItemParent(finalItem.driveId, newParentDriveId, oldParentDriveId).catch(console.error);
          }
        }
      } else {
        // Not on Drive yet, sync it now
        syncToDrive(activeId, items, calliopenId);
      }
    }
    originalParentId.current = null;
  };

  const moveItem = (id: string, newParentId: string | null) => {
    const isDescendant = (parent: string, child: string): boolean => {
      const pItem = items[parent];
      if (!pItem.children) return false;
      if (pItem.children.includes(child)) return true;
      return pItem.children.some(cid => isDescendant(cid, child));
    };

    if (newParentId === id || (newParentId && isDescendant(id, newParentId))) {
      return;
    }

    setItems(prev => {
      const item = prev[id];
      const oldParentId = item.parentId;
      if (oldParentId === newParentId) return prev;

      const newItems = { ...prev };
      if (oldParentId) {
        newItems[oldParentId] = {
          ...prev[oldParentId],
          children: prev[oldParentId].children?.filter(cid => cid !== id)
        };
      } else {
        setRootIds(prevIds => prevIds.filter(pid => pid !== id));
      }

      if (newParentId) {
        newItems[newParentId] = {
          ...prev[newParentId],
          children: [...(prev[newParentId].children || []), id]
        };
        newItems[id] = { ...item, parentId: newParentId };
      } else {
        setRootIds(prevIds => [...prevIds, id]);
        newItems[id] = { ...item, parentId: null };
      }

      return newItems;
    });
  };

  const handleCreateFile = (type: 'file' | 'folder', parentId: string | null = null) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem: FileItem = {
      id,
      name: type === 'file' ? 'New File' : 'New Folder',
      type,
      parentId,
      ...(type === 'folder' ? { children: [] } : { content: '' })
    };

    const newItems = {
      ...items,
      [id]: newItem,
      ...(parentId ? {
        [parentId]: { ...items[parentId], children: [...(items[parentId].children || []), id] }
      } : {})
    };

    setItems(newItems);
    if (!parentId) {
      setRootIds(prev => [...prev, id]);
    }
    
    syncToDrive(id, newItems, calliopenId);
  };

  const handleRename = (id: string, newName: string) => {
    const newItems = {
      ...items,
      [id]: { ...items[id], name: newName }
    };
    setItems(newItems);
    syncToDrive(id, newItems, calliopenId);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this?')) {
      const item = items[id];
      if (item.driveId) {
        deleteItem(item.driveId).catch(console.error);
      }
      
      setItems(prev => {
        const item = prev[id];
        const newItems = { ...prev };
        delete newItems[id];

        if (item.parentId) {
          newItems[item.parentId] = {
            ...prev[item.parentId],
            children: prev[item.parentId].children?.filter(cid => cid !== id)
          };
        } else {
          setRootIds(prevIds => prevIds.filter(pid => pid !== id));
        }

        return newItems;
      });
    }
  };

  const handleConflictResolve = (choice: 'local' | 'drive') => {
    if (!conflict) return;
    
    if (choice === 'drive') {
      setItems(prev => ({
        ...prev,
        [conflict.id]: { ...prev[conflict.id], content: conflict.driveContent }
      }));
    } else {
      // Choice is local, sync local content to Drive
      syncToDrive(conflict.id, items, calliopenId);
    }
    
    setConflict(null);
    setConflicts(prev => prev.slice(1));
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-desk)]/10 backdrop-blur-sm relative">
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium opacity-60">Directory Structure</h3>
          {isSyncing && <RefreshCw size={12} className="animate-spin text-[var(--text-accent)]" />}
          {accessToken && !isSyncing && <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Drive Connected" />}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleCreateFile('folder')}
            className="p-2 hover:bg-[var(--bg-page)] rounded-md transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
            title="Add Folder"
          >
            <FolderPlus size={16} />
          </button>
          <button 
            onClick={() => handleCreateFile('file')}
            className="p-2 hover:bg-[var(--bg-page)] rounded-md transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
            title="Add File"
          >
            <FilePlus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1">
              {rootIds.map((id) => (
                <FileTreeItem 
                  key={id} 
                  id={id} 
                  items={items} 
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onCreateChild={handleCreateFile}
                />
              ))}
            </div>
          </SortableContext>
          
          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <div className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded px-4 py-2 shadow-2xl opacity-90 cursor-grabbing flex items-center gap-2 z-50 pointer-events-none whitespace-nowrap">
                <div className={items[activeId].type === 'folder' ? 'text-blue-400' : 'text-green-400'}>
                  {items[activeId].type === 'folder' ? <Folder size={16} fill="currentColor" fillOpacity={0.1} /> : <FileText size={16} />}
                </div>
                <span className="text-sm font-medium text-[var(--text-main)] italic">
                  {items[activeId].name.replace(/\.txt$/, '')}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {syncError === 'API_DISABLED' && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-md space-y-2">
            <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
              <AlertTriangle size={14} />
              Action Required
            </div>
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Google Drive API is disabled for this project. This is a one-time configuration update needed in the Google Cloud Console.
            </p>
            <a 
              href="https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=41259771198"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[9px] text-amber-500 underline uppercase tracking-widest font-bold hover:text-amber-400"
            >
              Enable Drive API in Console
            </a>
            <p className="text-[8px] text-[var(--text-muted)] opacity-60">
              After enabling, please wait 1-2 minutes and then click retry.
            </p>
            <button 
              onClick={reSync}
              className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--text-accent)] font-bold border border-[var(--text-accent)]/30 px-3 py-1.5 rounded hover:bg-[var(--text-accent)]/10 transition-colors"
            >
              <RefreshCw size={12} />
              Retry Sync
            </button>
          </div>
        )}

        {syncError && syncError !== 'API_DISABLED' && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded space-y-2">
            <div className="text-[10px] text-red-500 opacity-80">
              {syncError}
            </div>
            <button 
              onClick={reSync}
              className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-red-400 font-bold hover:text-red-300 transition-colors"
            >
              <RefreshCw size={10} />
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-page)]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{Object.values(items).filter((i: FileItem) => i.type === 'folder').length} Folders</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>{Object.values(items).filter((i: FileItem) => i.type === 'file').length} Files</span>
            </div>
          </div>
          {!accessToken ? (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-amber-500 font-bold hover:text-amber-400 transition-colors"
            >
              <AlertTriangle size={10} />
              Connect Google Drive
            </button>
          ) : (
            <div className="text-[9px] uppercase tracking-wider text-green-500 font-medium">
              Sync Active
            </div>
          )}
        </div>
      </div>

      <ConflictModal
        isOpen={!!conflict}
        fileName={conflict?.name || ''}
        localContent={conflict?.localContent || ''}
        driveContent={conflict?.driveContent || ''}
        onSelect={handleConflictResolve}
      />
    </div>
  );
};
