import React, { createContext, useContext, useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface AuthContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  signInWithGooglePopup: () => Promise<{ idToken: string; email: string }>;
  logoutFirebase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Store token strictly in memory (never in localStorage)
  const [token, setToken] = useState<string | null>(null);

  const signInWithGooglePopup = async () => {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const idToken = await result.user.getIdToken();
    setToken(idToken);
    return {
      idToken,
      email: result.user.email || '',
    };
  };

  const logoutFirebase = async () => {
    setToken(null);
    try {
      await signOut(auth);
    } catch {
      // Ignore sign-out errors if not signed in via Firebase
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, setToken, signInWithGooglePopup, logoutFirebase }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
