'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type Auth,
  getAuth,
} from 'firebase/auth';
import { User } from '@/app/types/user';
import { getFirebaseApp } from './client'; // ✅ create this helper (below)

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthClient = (): Auth | null => {
    const app = getFirebaseApp();
    if (!app) return null;
    return getAuth(app);
  };

  const syncUserWithBackend = async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setUser(null);

      // ✅ Don't spam CI/build or unauthenticated environments
      if (typeof window !== 'undefined') {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
          // ignore
        }
      }

      return;
    }

    try {
      const token = await fbUser.getIdToken(true);

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error('Failed to sync user');

      const { user: dbUser } = await response.json();
      setUser(dbUser);
    } catch (error) {
      console.error('Error syncing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const auth = getAuthClient();

    // ✅ If Firebase isn't configured (like CI build), don't crash.
    if (!auth) {
      setFirebaseUser(null);
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      await syncUserWithBackend(fbUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const auth = getAuthClient();
    if (!auth) throw new Error('Firebase is not configured');

    const credential = await signInWithEmailAndPassword(auth, email, password);
    await syncUserWithBackend(credential.user);
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const auth = getAuthClient();
    if (!auth) throw new Error('Firebase is not configured');

    const credential = await createUserWithEmailAndPassword(auth, email, password);

    const token = await credential.user.getIdToken();
    const response = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name }),
    });

    if (!response.ok) throw new Error('Failed to create user');

    const { user: dbUser } = await response.json();
    setFirebaseUser(credential.user);
    setUser(dbUser);
  };

  const signInWithGoogle = async () => {
    const auth = getAuthClient();
    if (!auth) throw new Error('Firebase is not configured');

    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await syncUserWithBackend(credential.user);
  };

  const signOut = async () => {
    const auth = getAuthClient();

    // If auth isn't configured, just clear local state
    if (auth) {
      await firebaseSignOut(auth);
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }

    setFirebaseUser(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const auth = getAuthClient();
    if (!auth) throw new Error('Firebase is not configured');

    await sendPasswordResetEmail(auth, email);
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await syncUserWithBackend(firebaseUser);
    }
  };

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      resetPassword,
      refreshUser,
    }),
    // functions are stable enough; if you want you can wrap them in useCallback later
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, firebaseUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
