import React, { useState } from 'react';
import { Header } from './components/Header/Header';
import { Desk } from './components/Desk/Desk';
import { Footer } from './components/Footer/Footer';
import { DrawerPanel } from './components/Drawer/DrawerPanel';
import { DrawerButton } from './components/Drawer/DrawerButton';
import { Backend } from './components/Backend/Backend';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { PageProvider } from './hooks/usePage';
import { FileStoreProvider } from './hooks/useFileStore';
import { useDriveSync } from './hooks/useDriveSync';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { user, accessToken, signInWithGoogle, clearAccessToken } = useAuth();
  const { isSyncing } = useDriveSync(accessToken, clearAccessToken);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBackendOpen, setIsBackendOpen] = useState(false);

  return (
    <div className={`min-h-screen ${theme}`}>
      <div className="bg-[var(--bg-desk)] text-[var(--text-main)] min-h-screen selection:bg-main/20 selection:text-main relative">
        <Header 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          user={user}
          onLogin={signInWithGoogle}
          onOpenBackend={() => setIsBackendOpen(true)}
          onCloseBackend={() => setIsBackendOpen(false)}
          isBackendOpen={isBackendOpen}
        />
        
        <Desk isDrawerOpen={isDrawerOpen} />
        
        <DrawerPanel isOpen={isDrawerOpen} />

        <DrawerButton 
          isOpen={isDrawerOpen} 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)} 
          isBackendOpen={isBackendOpen}
        />
        
        <Footer />

        <Backend 
          isOpen={isBackendOpen} 
          onClose={() => setIsBackendOpen(false)} 
          user={user}
          accessToken={accessToken}
          onLogin={signInWithGoogle}
        />
        
        {isSyncing && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[var(--bg-page)]/80 backdrop-blur-sm border border-[var(--border-color)] px-3 py-1.5 rounded-full shadow-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest font-medium opacity-60">Syncing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FileStoreProvider>
        <PageProvider>
          <AppContent />
        </PageProvider>
      </FileStoreProvider>
    </AuthProvider>
  );
}
