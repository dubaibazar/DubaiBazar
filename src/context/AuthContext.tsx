import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session token
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('dubai-bazar-admin-token');
      if (storedToken) {
        // Very basic session check based on token existence
        // For real security, we should validate this token against Supabase or use Supabase Auth
        setIsAdmin(true);
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (username: string, password?: string) => {
    try {
      // In old method it was just a password 'dubai2026', but for the new one we query `admin` table.
      // If the UI only provides a password, we might need to query any admin record with that password,
      // but typical logins use both username and password. Let's handle both.
      
      const pwd = password || username; // if only one arg is passed from existing Login UI
      
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .eq('admin_password', pwd);
        
      if (error) {
        console.error('Supabase fetch error:', error);
        return false;
      }
      
      if (data && data.length > 0) {
        setIsAdmin(true);
        // Do NOT store raw password in localStorage. Use a generic token indicating logged in state
        localStorage.setItem('dubai-bazar-admin-token', 'authenticated-' + Date.now());
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('dubai-bazar-admin-token');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
