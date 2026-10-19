import { useEffect, useRef, useState, useCallback } from 'react';
import { useFileStore } from './useFileStore';
import { useGoogleDrive } from './useGoogleDrive';
import { FileItem } from '../components/Backend/types';

export function useDriveSync(accessToken: string | null, onAuthError?: () => void) {
  const { items, setItems, setRootIds, activeFileId, preferredDriveFolder, profileReady } = useFileStore();
  const { findOrCreateFolder, listItems, getFileContent, syncFile, updateItemParent } = useGoogleDrive(accessToken);
  const [calliopenId, setCalliopenId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const isInitialSyncDone = useRef(false);
  const lastSyncTime = useRef<number>(0);
  const pollingInterval = useRef<any>(null);
  const itemsRef = useRef(items);

  // Sync ref with current items
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const handleSyncError = useCallback((err: any) => {
    console.error('Drive Sync Error:', err);
    setError(err.message);
    if (err.status === 401) {
      onAuthError?.();
    }
  }, [onAuthError]);

  const initSync = useCallback(async () => {
    if (!accessToken || !profileReady) return;
    
    setIsSyncing(true);
    setConflicts([]);
    try {
      const folderId = await findOrCreateFolder('Calliopen');
      setCalliopenId(folderId);
      
      const driveItems = await listItems(folderId);
      let updatedItems = { ...itemsRef.current };
      const detectedConflicts = [];
      
      // Basic matching
      for (const localId in updatedItems) {
        const localItem = updatedItems[localId];
        const driveName = localItem.type === 'file' ? `${localItem.name}.txt` : localItem.name;
        const match = driveItems.find(di => 
          di.name === driveName && 
          di.mimeType === (localItem.type === 'folder' ? 'application/vnd.google-apps.folder' : 'text/plain')
        );
        
        if (match) {
          updatedItems[localId].driveId = match.id;
          
          if (localItem.type === 'file') {
            const driveContent = await getFileContent(match.id);
            if (driveContent !== null && driveContent !== localItem.content) {
              detectedConflicts.push({
                id: localId,
                name: localItem.name,
                localContent: localItem.content || '',
                driveContent: driveContent
              });
            }
          }
        }
      }
      
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
      }
      
      // Perform initial upload for items not on Drive
      const syncQueue = Object.keys(updatedItems);
      let progress = true;
      while (syncQueue.length > 0 && progress) {
        progress = false;
        for (let i = 0; i < syncQueue.length; i++) {
          const id = syncQueue[i];
          const item = updatedItems[id];
          const canSync = !item.parentId || updatedItems[item.parentId].driveId;
          
          if (!item.driveId && canSync) {
            const parentDriveId = item.type === 'file' && id === activeFileId && preferredDriveFolder
              ? preferredDriveFolder.id
              : (item.parentId ? updatedItems[item.parentId].driveId : folderId);
            const driveName = item.type === 'file' ? `${item.name}.txt` : item.name;
            if (item.type === 'file') {
              const data = await syncFile(driveName, item.content || '', parentDriveId!, item.driveId);
              updatedItems[id].driveId = data.id;
            } else {
              const driveFolderId = await findOrCreateFolder(item.name, parentDriveId);
              updatedItems[id].driveId = driveFolderId;
            }
            syncQueue.splice(i, 1);
            progress = true;
            break;
          } else if (item.driveId) {
            syncQueue.splice(i, 1);
            progress = true;
            break;
          }
        }
      }
      
      setItems(updatedItems);
      isInitialSyncDone.current = true;
    } catch (err: any) {
      handleSyncError(err);
    } finally {
      setIsSyncing(false);
    }
  }, [accessToken, profileReady, activeFileId, preferredDriveFolder?.id, findOrCreateFolder, listItems, setItems, syncFile, getFileContent, handleSyncError]);

  // Sync from Drive (Poll)
  const syncFromDrive = useCallback(async () => {
    if (!accessToken || !calliopenId || isSyncing) return;
    
    try {
      const driveItems = await listItems(calliopenId);
      const currentItems: Record<string, FileItem> = { ...itemsRef.current };
      let changed = false;

      for (const driveItem of driveItems) {
        const localItem = Object.values(currentItems).find((i: FileItem) => i.driveId === driveItem.id);
        
        if (localItem && localItem.type === 'file') {
          const remoteContent = await getFileContent(driveItem.id);
          if (remoteContent !== null && remoteContent !== localItem.content) {
            currentItems[localItem.id] = { ...localItem, content: remoteContent };
            changed = true;
          }
        }
        // Handle new items on Drive not on Local? (Maybe outside scope for now)
      }

      if (changed) {
        setItems(currentItems);
      }
    } catch (err) {
      handleSyncError(err);
    }
  }, [accessToken, calliopenId, getFileContent, listItems, setItems, handleSyncError]);

  // Initial Sync and Polling Setup
  useEffect(() => {
    if (!accessToken || !profileReady) {
      setError(null);
      return;
    }
    
    if (!isInitialSyncDone.current) {
      initSync();
    }
    
    if (accessToken && calliopenId) {
      pollingInterval.current = setInterval(syncFromDrive, 30000);
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [accessToken, profileReady, calliopenId, initSync, syncFromDrive]);

  // Watch for local changes and sync to Drive
  const lastDebouncedItems = useRef(items);
  useEffect(() => {
    if (!accessToken || !profileReady || !calliopenId || !isInitialSyncDone.current) return;

    const timer = setTimeout(async () => {
      try {
        for (const id in items) {
          const item = items[id];
          const lastItem = lastDebouncedItems.current[id];
          
          if (item.type === 'file' && item.driveId && (item.content !== lastItem?.content || item.name !== lastItem?.name)) {
            const parentDriveId = id === activeFileId && preferredDriveFolder
              ? preferredDriveFolder.id : (item.parentId ? items[item.parentId].driveId : calliopenId);
            const driveName = `${item.name}.txt`;
            if (parentDriveId) {
              await syncFile(driveName, item.content || '', parentDriveId, item.driveId);
            }
          }
        }
        lastDebouncedItems.current = items;
      } catch (err) {
        handleSyncError(err);
      }
    }, 2000); // Debounce sync to Drive

    return () => clearTimeout(timer);
  }, [items, accessToken, profileReady, activeFileId, preferredDriveFolder?.id, calliopenId, syncFile]);

  const reSync = useCallback(() => {
    isInitialSyncDone.current = false;
    setError(null);
    setConflicts([]);
    initSync();
  }, [initSync]);

  return { isSyncing, error, calliopenId, reSync, conflicts, setConflicts };
}
