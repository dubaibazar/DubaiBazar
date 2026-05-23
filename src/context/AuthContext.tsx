import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Monitor Firebase Auth state for Google logins
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        // Securely check if the authenticated email is the bootstrapped admin email
        if (user.email === 'nooradildar4789@gmail.com') {
          setIsAdmin(true);
          localStorage.setItem('dubai-bazar-admin-token', 'google-auth-authenticated');
        } else {
          setIsAdmin(false);
          localStorage.removeItem('dubai-bazar-admin-token');
        }
      } else {
        setUserEmail(null);
        // Verify local password-authenticated token as fallback
        const storedToken = localStorage.getItem('dubai-bazar-admin-token');
        if (storedToken) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && result.user.email === 'nooradildar4789@gmail.com') {
        setIsAdmin(true);
        localStorage.setItem('dubai-bazar-admin-token', 'google-auth-authenticated');
        setIsLoading(false);
        return true;
      } else {
        await signOut(auth);
        setIsLoading(false);
        alert("Access Denied: This Google account is not registered as an administrator.");
        return false;
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (password: string) => {
    try {
      // Offline fallback & password checks
      if (password === 'admin123') {
        setIsAdmin(true);
        localStorage.setItem('dubai-bazar-admin-token', 'password-authenticated-' + Date.now());
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setIsAdmin(false);
    localStorage.removeItem('dubai-bazar-admin-token');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, loginWithGoogle, logout, isLoading, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
