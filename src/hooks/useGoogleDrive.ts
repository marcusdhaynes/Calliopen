import { useState, useCallback } from 'react';

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  content?: string;
}

export function useGoogleDrive(accessToken: string | null) {
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchWithToken = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!accessToken) throw new Error('No access token available');
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };
    
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `HTTP error! status: ${response.status}`;
      const error = new Error(message);
      (error as any).status = response.status;
      throw error;
    }
    return response.json();
  }, [accessToken]);

  const findOrCreateFolder = useCallback(async (name: string, parentId?: string) => {
    const query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${parentId ? ` and '${parentId}' in parents` : ''}`;
    const data = await fetchWithToken(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name)`);
    
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    const folderMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const newFolder = await fetchWithToken('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(folderMetadata),
    });

    return newFolder.id;
  }, [fetchWithToken]);

  const syncFile = useCallback(async (name: string, content: string, parentId: string, existingId?: string) => {
    const metadata: any = {
      name,
      mimeType: 'text/plain',
    };

    if (!existingId) {
      metadata.parents = [parentId];
    }

    const boundary = 'foo_bar_baz';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain\r\n\r\n' +
      content +
      closeDelimiter;

    let url = existingId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    if (existingId) {
      // If updating an existing file, we might also want to update its parent if it changed
      // But multipart upload for existing files mostly updates metadata/content.
      // To strictly update parents, we might need a separate PATCH call to the v3/files/{id} endpoint
      // for moving files: ?addParents=new&removeParents=old.
      // For now, let's just use the multipart to update name and content.
    }

    const response = await fetchWithToken(url, {
      method: existingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: multipartRequestBody,
    });

    return response;
  }, [fetchWithToken]);

  const updateItemParent = useCallback(async (fileId: string, newParentId: string, oldParentId: string) => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${newParentId}&removeParents=${oldParentId}`;
    await fetchWithToken(url, { method: 'PATCH' });
  }, [fetchWithToken]);

  const getFileContent = useCallback(async (fileId: string) => {
    if (!accessToken) throw new Error('No access token available');
    
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        const error = new Error('Invalid authentication credentials');
        (error as any).status = 401;
        throw error;
      }
      return null;
    }
    return response.text();
  }, [accessToken]);

  const listItems = useCallback(async (folderId: string) => {
    const query = `'${folderId}' in parents and trashed = false`;
    const data = await fetchWithToken(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name, mimeType)`);
    return data.files as DriveItem[];
  }, [fetchWithToken]);

  const getFileMetadata = useCallback(async (fileId: string) => {
    return fetchWithToken(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,parents,mimeType`);
  }, [fetchWithToken]);

  const listFolders = useCallback(async (parentId: string = 'root') => {
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const data = await fetchWithToken(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,name,mimeType)&pageSize=100&orderBy=name`
    );
    return data.files as DriveItem[];
  }, [fetchWithToken]);

  const deleteItem = useCallback(async (fileId: string) => {
    await fetchWithToken(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
    });
  }, [fetchWithToken]);

  return { findOrCreateFolder, syncFile, updateItemParent, getFileContent, listItems, listFolders, getFileMetadata, deleteItem, isSyncing, setIsSyncing };
}
