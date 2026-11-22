import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { username: string; email: string; password: string; first_name?: string; last_name?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await authApi.me();
      if (res.success && res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: res.message || 'Identifiants invalides' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Identifiants invalides' };
    }
  };

  const register = async (payload: { username: string; email: string; password: string; first_name?: string; last_name?: string }) => {
    try {
      const res = await authApi.register(payload);
      if (res.success && res.user) {
        setUser(res.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: res.message || 'Erreur lors de l\'inscription' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erreur lors de l\'inscription' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
