import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { FileItem } from '../components/Backend/types';
import { useAuth } from './useAuth';

const initialItems: Record<string, FileItem> = {
  'f1': { id: 'f1', name: 'Project Alpha', type: 'folder', parentId: null, children: ['f2', 'f3'] },
  'f2': { id: 'f2', name: 'Drafts', type: 'folder', parentId: 'f1', children: ['file1'] },
  'f3': { id: 'f3', name: 'Research', type: 'folder', parentId: 'f1', children: [] },
  'file1': { id: 'file1', name: 'Outline', type: 'file', parentId: 'f2', content: '' },
  'f4': { id: 'f4', name: 'Personal', type: 'folder', parentId: null, children: ['file2'] },
  'file2': { id: 'file2', name: 'Notes', type: 'file', parentId: 'f4', content: 'Some personal notes' },
};

const initialRootIds = ['f1', 'f4'];

interface FileStoreContextType {
  items: Record<string, FileItem>;
  setItems: React.Dispatch<React.SetStateAction<Record<string, FileItem>>>;
  rootIds: string[];
  setRootIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  updateFileContent: (id: string, content: string) => void;
  preferredDriveFolder: { id: string; name: string } | null;
  setPreferredDriveFolder: (folder: { id: string; name: string } | null) => void;
  profileReady: boolean;
}

const FileStoreContext = createContext<FileStoreContextType | undefined>(undefined);

export const FileStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Record<string, FileItem>>(initialItems);
  const [rootIds, setRootIds] = useState<string[]>(initialRootIds);
  const [activeFileId, setActiveFileId] = useState<string | null>('file1');
  const [preferredDriveFolder, setPreferredDriveFolderState] = useState<{ id: string; name: string } | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const profileKey = user ? 'calliopen:profile:' + user.uid : null;

  // Each signed-in identity has a separate local workspace. Guest drafts are
  // retained separately, never silently merged into somebody else's profile.
  useEffect(() => {
    if (loading) return;
    setProfileReady(false);
    const storageKey = profileKey || 'calliopen:guest';
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && saved.items && Array.isArray(saved.rootIds)) {
        setItems(saved.items);
        setRootIds(saved.rootIds);
        setActiveFileId(saved.activeFileId || null);
        setPreferredDriveFolderState(saved.preferredDriveFolder || null);
      } else {
        setItems(initialItems);
        setRootIds(initialRootIds);
        setActiveFileId('file1');
        setPreferredDriveFolderState(null);
      }
    } catch {
      setItems(initialItems);
      setRootIds(initialRootIds);
      setActiveFileId('file1');
      setPreferredDriveFolderState(null);
    }
    setProfileReady(true);
  }, [profileKey, loading]);

  useEffect(() => {
    if (!profileReady || loading) return;
    try {
      localStorage.setItem(profileKey || 'calliopen:guest',
        JSON.stringify({items, rootIds, activeFileId, preferredDriveFolder}));
    } catch (error) {
      console.error('Local autosave failed', error);
    }
  }, [items, rootIds, activeFileId, preferredDriveFolder, profileKey, profileReady, loading]);

  const setPreferredDriveFolder = (folder: { id: string; name: string } | null) =>
    setPreferredDriveFolderState(folder);

  const updateFileContent = (id: string, content: string) => {
    setItems(prev => {
      if (!prev[id] || prev[id].content === content) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], content }
      };
    });
  };

  return (
    <FileStoreContext.Provider value={{ 
      items, 
      setItems, 
      rootIds, 
      setRootIds, 
      activeFileId, 
      setActiveFileId,
      updateFileContent,
      preferredDriveFolder,
      setPreferredDriveFolder,
      profileReady
    }}>
      {children}
    </FileStoreContext.Provider>
  );
};

export const useFileStore = () => {
  const context = useContext(FileStoreContext);
  if (!context) {
    throw new Error('useFileStore must be used within a FileStoreProvider');
  }
  return context;
};
