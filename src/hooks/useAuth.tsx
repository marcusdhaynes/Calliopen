import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { auth, signInWithGoogle as firebaseSignInWithGoogle, logout as firebaseLogout } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearAccessToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('google_access_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setAccessToken(null);
        localStorage.removeItem('google_access_token');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await firebaseSignInWithGoogle();
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        localStorage.setItem('google_access_token', credential.accessToken);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setAuthError(error.message || 'Failed to sign in with Google');
    }
  };

  const clearAccessToken = () => {
    setAccessToken(null);
    localStorage.removeItem('google_access_token');
  };

  const handleLogout = async () => {
    await firebaseLogout();
    clearAccessToken();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      loading, 
      authError,
      signInWithGoogle: handleSignIn, 
      logout: handleLogout,
      clearAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
