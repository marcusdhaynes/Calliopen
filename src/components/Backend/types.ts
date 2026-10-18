export type FileType = 'file' | 'folder';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  children?: string[]; // IDs of children
  content?: string; // For files
  driveId?: string; // Google Drive ID
}

export interface FileSystemState {
  items: Record<string, FileItem>;
  rootIds: string[];
}
