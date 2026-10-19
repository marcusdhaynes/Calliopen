import React from 'react';
import { Folder, ArrowLeft, RefreshCw, MoveRight, Cloud, HardDrive } from 'lucide-react';
import { useFileStore } from '../../hooks/useFileStore';
import { useGoogleDrive, DriveItem } from '../../hooks/useGoogleDrive';

interface Props {
  accessToken?: string | null;
  user?: { email: string | null } | null;
  onLogin?: () => Promise<void>;
}

export const BookSaveSettings: React.FC<Props> = ({ accessToken, user, onLogin }) => {
  const { items, setItems, activeFileId, preferredDriveFolder, setPreferredDriveFolder } = useFileStore();
  const { listFolders, getFileMetadata, updateItemParent, syncFile } = useGoogleDrive(accessToken || null);
  const [folder, setFolder] = React.useState<{ id: string; name: string }>({ id: 'root', name: 'My Drive' });
  const [history, setHistory] = React.useState<{ id: string; name: string }[]>([]);
  const [folders, setFolders] = React.useState<DriveItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [status, setStatus] = React.useState('');

  const activeFile = activeFileId ? items[activeFileId] : null;
  const browse = React.useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      setFolders(await listFolders(folder.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to list Drive folders.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, folder.id, listFolders]);

  React.useEffect(() => { void browse(); }, [browse]);

  const enter = (next: {id: string; name: string}) => {
    setHistory(prev => [...prev, folder]);
    setFolder(next);
  };
  const back = () => {
    if (!history.length) return;
    setFolder(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  };

  const move = async () => {
    if (!accessToken || !activeFile || !activeFileId || activeFile.type !== 'file') return;
    setSaving(true);
    setStatus('');
    setError('');
    try {
      if (activeFile.driveId) {
        const metadata = await getFileMetadata(activeFile.driveId);
        const parents: string[] = metadata.parents || [];
        if (!parents.includes(folder.id)) {
          const oldParent = parents[0];
          if (oldParent) await updateItemParent(activeFile.driveId, folder.id, oldParent);
          else {
            // A file without parents can still be assigned to a destination.
            throw new Error('File has no existing parent folder; please reconnect Drive.');
          }
        }
      } else {
        const uploaded = await syncFile(
          activeFile.name + '.txt', activeFile.content || '', folder.id
        );
        if (!uploaded?.id) throw new Error('Drive did not return a file ID.');
        setItems(prev => ({
          ...prev, [activeFileId]: { ...prev[activeFileId], driveId: uploaded.id }
        }));
      }
      setPreferredDriveFolder(folder);
      setStatus('Book moved. This folder is now the default for future saves.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not move the book.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto text-[var(--text-main)]">
      <div className="flex items-center gap-2 mb-2">
        <HardDrive size={17} className="text-[var(--text-accent)]"/>
        <h2 className="text-xl font-serif font-semibold">Book Saving</h2>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Books, layout selections, cover text, and typography settings autosave under your signed-in profile.
        Choose a Google Drive folder below, then press Move. The last moved-to folder remains the default.
      </p>
      <div className="border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-desk)]/25 mb-5">
        <div className="flex gap-2 items-center mb-2"><Cloud size={15}/><b className="text-sm">Save Destination</b></div>
        <div className="text-xs leading-relaxed">
          <div>Signed-in profile: <b>{user?.email || 'Guest (local autosave only)'}</b></div>
          <div>Current book: <b>{activeFile?.name || 'No book selected'}</b></div>
          <div>Default Drive folder: <b>{preferredDriveFolder?.name || 'Calliopen (default)'}</b></div>
        </div>
      </div>
      {!accessToken ? (
        <div className="flex items-center justify-between gap-4 border border-[var(--border-color)] rounded-lg p-4">
          <span className="text-sm">Connect Google Drive to choose a save folder.</span>
          <button type="button" onClick={() => void onLogin?.()} className="rounded-md border border-[var(--border-color)] px-4 py-2 text-xs hover:bg-[var(--bg-desk)]">Connect</button>
        </div>
      ) : (
        <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 bg-[var(--bg-desk)]/40 p-3 border-b border-[var(--border-color)]">
            <button type="button" disabled={!history.length} onClick={back} className="p-2 disabled:opacity-30" aria-label="Parent folder"><ArrowLeft size={16}/></button>
            <span className="flex-1 truncate text-sm font-medium">{folder.name}</span>
            <button type="button" onClick={() => void browse()} aria-label="Refresh folders" className="p-2"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/></button>
          </div>
          <div className="min-h-32 max-h-64 overflow-y-auto p-2">
            {folders.map(entry => (
              <button key={entry.id} type="button" onClick={() => enter({id:entry.id,name:entry.name})}
                className="w-full flex items-center gap-3 rounded-md hover:bg-[var(--bg-desk)]/60 p-3 text-left text-sm">
                <Folder size={16} className="text-[var(--text-accent)]"/>
                <span className="flex-1 truncate">{entry.name}</span>
                <span className="text-xs opacity-50">Open</span>
              </button>
            ))}
            {!loading && folders.length === 0 && <div className="text-xs text-[var(--text-muted)] p-4 text-center">No subfolders. You can save here.</div>}
          </div>
          <div className="border-t border-[var(--border-color)] p-3 flex items-center justify-between gap-4">
            <span className="text-xs text-[var(--text-muted)]">Selected: {folder.name}</span>
            <button type="button" onClick={() => void move()} disabled={saving || !activeFile || loading}
              className="px-4 py-2 text-xs flex items-center gap-2 rounded-md bg-[var(--text-accent)] text-[var(--bg-page)] disabled:opacity-40">
              <MoveRight size={14}/>{saving ? 'Moving…' : 'Move'}
            </button>
          </div>
        </div>
      )}
      {status && <p role="status" className="text-sm text-green-700 dark:text-green-400 mt-4">{status}</p>}
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400 mt-4">{error}</p>}
    </div>
  );
};
